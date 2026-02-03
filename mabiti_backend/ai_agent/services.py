import google.generativeai as genai_old
import googlemaps
from django.conf import settings
import json
import logging
import base64
import struct
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY is not set.")
            self.model_old = None
            self.client = None
        else:
            # Keep old client for compatibility if needed, but primary is now genai.Client
            genai_old.configure(api_key=settings.GOOGLE_API_KEY)
            self.model_old = genai_old.GenerativeModel('gemini-1.5-flash')
            
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            self.tts_model = "gemini-2.0-flash-exp" # Switching back to a more capable reasoning model
            self.nlu_model = "gemini-2.5-flash-lite"

    def parse_query(self, text):
        """
        Uses Gemini to extract structured data from natural language query.
        """
        if not self.client:
            return {}

        prompt = f"""
        Extract the following detailed real estate requirements from this text: "{text}"
        Return ONLY a JSON object with these keys: target_location, workplaces, schools, max_price, min_beds, property_type, visual_requirements, travel_mode.
        Do not include markdown formatting.
        """
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=prompt
            )
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        except Exception as e:
            logger.error(f"Gemini NLU Error: {e}")
            return {}

    def analyze_image(self, image_path, criteria):
        """
        Uses Gemini Vision to check if an image meets a specific criteria (e.g. "modern kitchen").
        """
        # Note: image_path handles local paths for now. For URLs, we'd fetch bytes.
        # This is a placeholder for the advanced visual feature.
        return True # Stub for now

    def search_properties(self, min_price=None, max_price=None, beds=None, city=None, listing_type='buy'):
        """
        Tool for searching properties in the internal database.
        """
        from properties.models import Property
        queryset = Property.objects.all()
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if beds:
            queryset = queryset.filter(beds__gte=beds)
        if city:
            queryset = queryset.filter(address__icontains=city)
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)
            
        results = []
        for p in queryset[:5]: # Return top 5
            results.append({
                'id': p.id,
                'title': p.title,
                'price': float(p.price),
                'beds': p.beds,
                'address': p.address,
                'lat': p.latitude,
                'lng': p.longitude
            })
        return results

    def generate_chat_response(self, user_text, property_context, location_context=None, want_audio=False, user_audio_bytes=None):
        if not self.client:
            return "Brain offline.", None

        location_msg = f"User pinned: {location_context}." if location_context else ""
        user_query = user_text if user_text else "the provided audio"
        
        prompt = f"""
        You are Mabiti, an expert Real Estate AI.
        User Query: "{user_query}"
        {location_msg}
        
        Strategy:
        1. If user asks for properties near amenities (hospital, school, etc) in a city:
           - First, use 'search_nearby_places' to find those amenities in that city.
           - Second, use 'search_properties' to find homes in that city.
           - Third, compare the coordinates to find the best matches.
        2. Always summarize your findings concisely.
        """
        
        try:
            contents = []
            if user_audio_bytes:
                contents.append(types.Part.from_bytes(data=user_audio_bytes, mime_type="audio/webm"))
            contents.append(prompt)
            
            # Simplified tool definition for API
            tools = [
                types.Tool(google_search=types.GoogleSearch()),
                types.Tool(
                    function_declarations=[
                        types.FunctionDeclaration(
                            name="search_properties",
                            description="Search the real estate property database.",
                            parameters=types.Schema(
                                type="OBJECT",
                                properties={
                                    "min_price": types.Schema(type="NUMBER"),
                                    "max_price": types.Schema(type="NUMBER"),
                                    "beds": types.Schema(type="INTEGER"),
                                    "city": types.Schema(type="STRING"),
                                    "listing_type": types.Schema(type="STRING", enum=["buy", "rent"])
                                }
                            )
                        ),
                        types.FunctionDeclaration(
                            name="search_nearby_places",
                            description="Find places like hospitals/schools/parks using Google Maps.",
                            parameters=types.Schema(
                                type="OBJECT",
                                properties={
                                    "location_name": types.Schema(type="STRING", description="City or specific address"),
                                    "place_type": types.Schema(type="STRING", enum=["hospital", "school", "park", "shopping_mall", "gym"])
                                },
                                required=["location_name", "place_type"]
                            )
                        )
                    ]
                )
            ]

            config = types.GenerateContentConfig(
                temperature=0.7,
                response_modalities=["AUDIO"] if want_audio else ["TEXT"],
                thinking_config=types.ThinkingConfig(thinking_budget=0),
                tools=tools,
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
                    )
                ) if want_audio else None
            )

            # Handle Function Calling Loop
            while True:
                response = self.client.models.generate_content(
                    model=self.tts_model,
                    contents=contents,
                    config=config
                )
                
                # Check for tool calls
                tool_calls = response.candidates[0].content.parts
                tool_call_found = False
                
                for part in tool_calls:
                    if part.function_call:
                        tool_call_found = True
                        call = part.function_call
                        logger.info(f"AI Tool Call: {call.name} with {call.args}")
                        
                        # Execute
                        if call.name == "search_properties":
                            res = self.search_properties(**call.args)
                        elif call.name == "search_nearby_places":
                            res = GoogleMapsService().search_nearby_places(**call.args)
                        else:
                            res = {"error": "Unknown tool"}
                            
                        # Feed result back
                        contents.append(response.candidates[0].content) # Model turn
                        contents.append(types.Content(
                            role="user",
                            parts=[types.Part.from_function_response(
                                name=call.name,
                                response={"result": res}
                            )]
                        ))
                
                if not tool_call_found:
                    break # Final response reached

            # Extract text and audio manually to avoid SDK warnings about multimodal responses
            text_parts = []
            audio_base64 = None
            
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.text:
                        text_parts.append(part.text)
                    if part.inline_data:
                        # Convert raw audio to WAV
                        wav_data = self._convert_to_wav(part.inline_data.data, part.inline_data.mime_type)
                        audio_base64 = base64.b64encode(wav_data).decode('utf-8')

            text_response = "".join(text_parts).strip() or "I found the information for you."
            return text_response, audio_base64

        except Exception as e:
            logger.error(f"Gemini Chat Error: {e}")
            return "Here is what I found.", None

    def _convert_to_wav(self, audio_data: bytes, mime_type: str) -> bytes:
        bits_per_sample = 16
        rate = 24000
        
        parts = mime_type.split(";")
        for param in parts:
            param = param.strip()
            if param.lower().startswith("rate="):
                try: rate = int(param.split("=")[1])
                except: pass
            elif "L" in param:
                try: bits_per_sample = int(param.split("L")[1])
                except: pass

        num_channels = 1
        data_size = len(audio_data)
        block_align = num_channels * (bits_per_sample // 8)
        byte_rate = rate * block_align
        chunk_size = 36 + data_size

        header = struct.pack(
            "<4sI4s4sIHHIIHH4sI",
            b"RIFF", chunk_size, b"WAVE", b"fmt ", 16, 1,
            num_channels, rate, byte_rate, block_align, bits_per_sample,
            b"data", data_size
        )
        return header + audio_data

class GoogleMapsService:
    def __init__(self):
        if not settings.GOOGLE_MAPS_API_KEY:
            logger.warning("GOOGLE_MAPS_API_KEY is not set.")
            self.client = None
        else:
            self.client = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

    def geocode(self, address):
        if not self.client:
            return None
        try:
            result = self.client.geocode(address)
            if result:
                return result[0]['geometry']['location']
        except Exception as e:
            logger.error(f"Geocoding Error: {e}")
        return None

    def search_nearby_places(self, location_name, place_type):
        """
        Uses Google Places to find interesting spots near a location.
        place_type can be 'hospital', 'school', 'park', etc.
        """
        if not self.client:
            return []
        try:
            # Geocode the location first to get lat/lng
            loc = self.geocode(location_name)
            if not loc:
                return []
            
            places = self.client.places_nearby(
                location=loc,
                radius=3000, # 3km radius
                type=place_type
            )
            
            results = []
            for p in places.get('results', []):
                results.append({
                    'name': p.get('name'),
                    'address': p.get('vicinity'),
                    'lat': p.get('geometry', {}).get('location', {}).get('lat'),
                    'lng': p.get('geometry', {}).get('location', {}).get('lng')
                })
            return results
        except Exception as e:
            logger.error(f"Places Search Error: {e}")
            return []

    def calculate_commute(self, origin, destinations, mode='driving'):
        """
        Returns a list of duration_text for commutes from origin to property locations.
        """
        if not self.client or not destinations:
            return []
            
        try:
            # Distance Matrix API
            # origins=property_locations, destinations=[workplace]
            # But usually we want: from property(rows) to workplace(col)
            
            # Format destinations for API
            matrix = self.client.distance_matrix(origins=origin, destinations=destinations, mode=mode)
            
            results = []
            if matrix['status'] == 'OK':
                for element in matrix['rows'][0]['elements']:
                    if element['status'] == 'OK':
                        results.append({
                            'duration': element['duration']['text'],
                            'text': element['duration']['text'],
                            'distance': element['distance']['text'],
                            'value': element['duration']['value'] # seconds
                        })
                    else:
                        results.append(None)
            return results
        except Exception as e:
            logger.error(f"Distance Matrix Error: {e}")
            return []
