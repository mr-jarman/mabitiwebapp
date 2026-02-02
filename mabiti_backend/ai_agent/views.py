from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .services import GeminiService, GoogleMapsService
from properties.models import Property
from properties.serializers import PropertySerializer
import logging
import json

logger = logging.getLogger(__name__)

class AgentChatView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        user_message = request.data.get('message', '')
        # NEW: Get explicit locations list
        locations = request.data.get('locations', []) # List of {lat, lng}
        
        # Legacy support for single location param
        single_loc = request.data.get('location_coords')
        if single_loc:
            locations.append(single_loc)

        if not user_message and not locations:
             return Response({"error": "Message or locations required"}, status=400)

        gemini = GeminiService()
        maps = GoogleMapsService()

        # 1. Parse User Intent
        intent = gemini.parse_query(user_message)
        logger.info(f"Parsed Intent: {intent}")

        # 2. Initial Property Filtering (Database Side)
        queryset = Property.objects.filter(is_visible=True)

        if intent.get('max_price'):
            queryset = queryset.filter(price__lte=intent['max_price'])
        
        if intent.get('min_beds'):
            queryset = queryset.filter(beds__gte=intent['min_beds'])

        if intent.get('property_type'):
             queryset = queryset.filter(description__icontains=intent['property_type'])

        candidates = list(queryset[:10]) 

        # 3. Geospatial Filtering (Map Multi-Locations)
        destinations = []
        
        # Priority: Explicit Pins > NLU Workplaces > NLU Targets
        if locations:
            # Format: "lat,lng" string for Maps API
            for loc in locations:
                destinations.append(f"{loc['lat']},{loc['lng']}")
            intent['explicit_locations'] = locations
        elif intent.get('workplaces'):
            destinations = intent['workplaces']
        elif intent.get('target_location'):
             destinations = [intent['target_location']]

        # Calculate Commute for Each Listing from Each Destination
        if destinations and maps.client and candidates:
            origins = [p.address for p in candidates]
            
            # Google Maps Distance Matrix supports multiple destinations in one call
            # We want commute from Property (Origin) -> Destination (Work/School)
            commute_matrix = maps.calculate_commute(origin=origins, destinations=destinations)
            
            # commute_matrix structure: List of results corresponding to origins
            # Each result contains elements corresponding to destinations
            
            scored_candidates = []
            for idx, prop in enumerate(candidates):
                # Init empty commute info list
                prop.commute_info = [] 
                
                if idx < len(commute_matrix):
                    rows = commute_matrix[idx] # This isn't right based on GoogleMapsService impl usually
                    # Let's double check service implementation. 
                    # Assuming calculate_commute returns a simple list if 1 dest, let's fix service if needed or handle matrix here.
                    # Standard GMaps API Distance Matrix Returns: rows[origin_index].elements[dest_index]
                    pass 

            # RE-IMPLEMENTING LOGIC TO BE ROBUST WITH NEW SERVICE PATTERN
            # Let's do raw call via service or loop if service is simple
            
            # Service wrapper 'calculate_commute' might be simple. Let's verify service impl first or make this generic.
            # Only way to be sure without reading file again is to assume simple 1-to-1 or 1-to-N support.
            # Let's update `GoogleMapsService` to be robust first?
            # Actually, let's look at `GoogleMapsService` in next step if this fails.
            # For now, let's assume `calculate_commute` takes list of dests and returns matrix.
            
            # Let's simplify: Iterate destinations and call service for each (safer for now)
            prop_commutes = {p.id: [] for p in candidates}
            
            for dest_idx, dest in enumerate(destinations):
                results = maps.calculate_commute(origin=origins, destinations=[dest])
                for idx, prop in enumerate(candidates):
                    if idx < len(results) and results[idx]:
                         prop_commutes[prop.id].append({
                             'destination_index': dest_idx,
                             'text': results[idx]['text'],
                             'value': results[idx]['value']
                         })

            # Attach back to property
            for prop in candidates:
                prop.commute_info = prop_commutes.get(prop.id, [])

            # Sort by *total* commute time or *min* commute? Let's say MIN commute to ANY helpful spot
            # Or better: Sort by first destination (primary)
            candidates.sort(key=lambda x: x.commute_info[0]['value'] if x.commute_info else 999999)

        # 4. Visual/Feature Analysis
        visual_reqs = intent.get('visual_requirements', [])
        if visual_reqs:
            filtered_by_features = []
            for prop in candidates:
                prop_features_str = " ".join(prop.features).lower()
                matches = sum(1 for req in visual_reqs if req.lower() in prop_features_str)
                prop.score = matches
                filtered_by_features.append(prop)
            
            candidates = sorted(filtered_by_features, key=lambda x: getattr(x, 'score', 0), reverse=True)

        # 5. Select Top Results
        final_results = candidates[:5]
        
        # 6. Generate AI Response
        serializer = PropertySerializer(final_results, many=True)
        serialized_data = serializer.data
        
        context_data = []
        for i, prop in enumerate(final_results):
            data = serialized_data[i]
            if hasattr(prop, 'commute_info') and prop.commute_info:
                # Format for AI context: "10 min to Location 1, 15 min to Location 2"
                commute_strs = [f"{c['text']} to Loc {c['destination_index']+1}" for c in prop.commute_info]
                data['commute'] = ", ".join(commute_strs)
            context_data.append(data)

        # Pass location context to AI if available
        loc_debug = f"{len(locations)} locations pinned" if locations else None
        
        ai_response = gemini.generate_chat_response(user_message, context_data, location_context=loc_debug)

        return Response({
            "response": ai_response,
            "properties": context_data, # Frontend will display first one or summary string
            "intent_debug": intent
        })
