import google.generativeai as genai
import googlemaps
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY is not set.")
            self.model = None
            self.vision_model = None
        else:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
            self.vision_model = genai.GenerativeModel('gemini-pro-vision')

    def parse_query(self, text):
        """
        Uses Gemini to extract structured data from natural language query.
        Returns a JSON object with: location, budget, property_type, visual_preferences, keywords.
        """
        if not self.model:
            return {}

        prompt = f"""
        Extract the following detailed real estate requirements from this text: "{text}"
        
        Return ONLY a JSON object with these keys:
        - target_location: (string) The main location mentioned.
        - workplaces: (list of strings) Any workplace addresses mentioned.
        - schools: (list of strings) Any school names or types mentioned.
        - max_price: (number or null) The budget/price.
        - min_beds: (number or null) Minimum bedrooms.
        - property_type: (string or null) e.g. "house", "apartment".
        - visual_requirements: (list of strings) e.g. "modern kitchen", "pool", "wood floor".
        - travel_mode: (string) "driving" or "transit" (default to driving).
        
        Do not include markdown formatting like ```json.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # basic clean up if model returns markdown
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

    def generate_chat_response(self, user_text, property_context, location_context=None):
        """
        Generates a conversational response based on the found properties.
        """
        if not self.model:
            return "I'm sorry, I couldn't process your request as my brain is offline (API Key missing)."

        location_msg = ""
        if location_context:
            location_msg = f"User pinned a specific location: {location_context}."

        prompt = f"""
        You are a helpful Real Estate AI. 
        User asked: "{user_text}"
        {location_msg}
        
        We found these properties for them:
        {json.dumps(property_context, indent=2)}
        
        Write a friendly, professional response (max 3 sentences) summarizing what you found. 
        Highlight why the top option matches their needs (especially commute or visual request).
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini Chat Error: {e}")
            return "Here are the properties I found for you."

class GoogleMapsService:
    def __init__(self):
        if not settings.GOOGLE_MAPS_API_KEY:
            logger.warning("GOOGLE_MAPS_API_KEY is not set.")
            self.client = None
        else:
            self.client = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

    def geocode(self, address):
        """
        Returns (lat, lng) for an address.
        """
        if not self.client:
            return None
        
        try:
            result = self.client.geocode(address)
            if result:
                return result[0]['geometry']['location']
        except Exception as e:
            logger.error(f"Geocoding Error: {e}")
        return None

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
                            'distance': element['distance']['text'],
                            'value': element['duration']['value'] # seconds
                        })
                    else:
                        results.append(None)
            return results
        except Exception as e:
            logger.error(f"Distance Matrix Error: {e}")
            return []
