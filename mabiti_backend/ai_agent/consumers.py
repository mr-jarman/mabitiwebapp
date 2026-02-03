import json
import asyncio
import base64
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from google import genai
from google.genai import types
from django.conf import settings

logger = logging.getLogger(__name__)

class LiveCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.client = genai.Client(
            http_options={"api_version": "v1beta"},
            api_key=settings.GOOGLE_API_KEY,
        )
        # Try a few common model names for Live API
        models_to_try = [
            "gemini-2.0-flash-exp",
            "models/gemini-2.0-flash-exp",
            "gemini-2.0-flash",
            "models/gemini-2.0-flash",
            "gemini-2.5-flash-native-audio-preview-12-2025",
            "models/gemini-2.5-flash-native-audio-preview-12-2025",
        ]
        
        self.config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            media_resolution="MEDIA_RESOLUTION_MEDIUM",
            system_instruction=types.Content(
                parts=[types.Part(text="You are Mabiti, a warm and helpful Real Estate AI assistant. Use the tools provided to search for properties and nearby places (hospitals, schools, etc.) when the user asks.")]
            ),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
                )
            ),
            tools=[
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
        )
        
        self.context_manager = None
        self.gemini_session = None
        self.receive_task = None
        
        for model_name in models_to_try:
            try:
                logger.info(f"Attempting to connect to Gemini Live with model: {model_name}")
                self.context_manager = self.client.aio.live.connect(model=model_name, config=self.config)
                self.gemini_session = await self.context_manager.__aenter__()
                self.receive_task = asyncio.create_task(self.receive_from_gemini())
                logger.info(f"Connected successfully to {model_name}")
                return # Success!
            except Exception as e:
                logger.warning(f"Failed to connect with {model_name}: {e}")
                self.context_manager = None
                self.gemini_session = None
                continue
        
        # If we get here, all models failed
        logger.error("All Gemini Live models failed to connect.")
        await self.send(text_data=json.dumps({"error": "Failed to initialize Gemini Live session"}))
        await self.close()

    async def disconnect(self, close_code):
        if self.receive_task:
            self.receive_task.cancel()
        if self.context_manager:
            try:
                await self.context_manager.__aexit__(None, None, None)
            except Exception as e:
                logger.error(f"Error during Gemini session exit: {e}")
        logger.info("Gemini Live Call session closed.")

    async def receive(self, text_data=None, bytes_data=None):
        """
        Receives audio chunks (bytes) or text commands from the frontend.
        """
        if not self.gemini_session:
            logger.warning("Attempted to send data but gemini_session is not initialized.")
            return

        try:
            if bytes_data:
                await self.gemini_session.send(input={"data": bytes_data, "mime_type": "audio/pcm"}, end_of_turn=True)
            elif text_data:
                data = json.loads(text_data)
                if "text" in data:
                    await self.gemini_session.send(input=data["text"], end_of_turn=True)
        except Exception as e:
            logger.error(f"Error sending to Gemini: {e}")
            await self.close()

    async def receive_from_gemini(self):
        """
        Stream responses and tool calls from Gemini back to the frontend.
        """
        if not self.gemini_session:
            return
            
        try:
            async for response in self.gemini_session.receive():
                if response.data:
                    # Binary audio data
                    await self.send(bytes_data=response.data)
                
                if response.server_content and response.server_content.model_turn:
                    parts = response.server_content.model_turn.parts
                    for part in parts:
                        if part.text:
                            # AI Text transcript
                            await self.send(text_data=json.dumps({"text": part.text}))

                if response.tool_call:
                    # Handle tool calls
                    for call in response.tool_call.function_calls:
                        logger.info(f"Live Tool Call: {call.name} with {call.args}")
                        
                        from ai_agent.services import GeminiService, GoogleMapsService
                        res = None
                        if call.name == "search_properties":
                            # We need a sync-to-async way or just call the service method
                            # Since we are in a consumer, we can use the service
                            svc = GeminiService()
                            res = svc.search_properties(**call.args)
                        elif call.name == "search_nearby_places":
                            svc = GoogleMapsService()
                            res = svc.search_nearby_places(**call.args)
                        
                        if res is not None:
                            # Send tool response back to Gemini
                            await self.gemini_session.send(input=types.LiveClientToolResponse(
                                function_responses=[
                                    types.LiveClientFunctionResponse(
                                        name=call.name,
                                        id=call.id,
                                        response={"result": res}
                                    )
                                ]
                            ))
                            # Also notify frontend about what we are doing to unify UI
                            await self.send(text_data=json.dumps({
                                "tool": call.name,
                                "args": call.args,
                                "result": res
                            }))

        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error receiving from Gemini: {e}")
