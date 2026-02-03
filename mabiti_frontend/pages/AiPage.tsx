import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Header } from '../components/Header';
import { LiquidGlassFilters, LiquidGlass } from '../components/LiquidGlass';
import { DottedSurface } from '../components/DottedSurface';
import { LiquidBackground } from '../components/LiquidBackground';
import { useVisualizer } from '../services/VisualizerContext';
import { aiService } from '../services/aiService';
import { AiPropertyCard } from '../components/AiPropertyCard';
import { Property } from '../types';
import { useAuth } from '../services/AuthContext';
import { VoiceWave } from '../components/VoiceWave';

// Map Styles for a clean look (Silver/Dark theme)
const mapStyles = [
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    },
    {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    }
];

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    properties?: Property[];
}

interface PinnedLocation {
    id: string;
    lat: number;
    lng: number;
    label: string;
}

export const AiPage: React.FC = () => {
    const { setAnalyser: setGlobalAnalyser } = useVisualizer();
    const { user } = useAuth();

    // Map State
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places']
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState({ lat: 51.5074, lng: -0.1278 }); // Default London
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            text: `Hello ${user?.username || 'there'}! I'm your advanced AI Real Estate Agent. I can help you find properties based on location, commute, budget, and even visual preferences. Toggle the chat to see the map better!`
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Manual Pinning State (Replaces separate Modal)
    const [isPinningMode, setIsPinningMode] = useState(false);
    const [pinnedLocations, setPinnedLocations] = useState<PinnedLocation[]>([]);

    const [isCalling, setIsCalling] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                if (transcript.trim()) {
                    setInputText(transcript);
                    // Automatically send after a short delay or handle in effect
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed') {
                    stopCall();
                }
            };
        }
    }, []);

    const speak = (text: string, audioBase64?: string) => {
        // Always stop any robotic voice immediately
        window.speechSynthesis.cancel();

        if (audioBase64) {
            // Play high quality Gemini audio (Aoede)
            const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
            audio.play().catch(e => console.error("Audio playback failed:", e));
        } else if (!isCalling) {
            // Only fallback to robotic voice if NOT in a call mode
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1.1; // Slightly more natural pitch
            window.speechSynthesis.speak(utterance);
        }
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 256;
            source.connect(analyserNode);

            audioContextRef.current = audioContext;
            setGlobalAnalyser(analyserNode);
            setIsCalling(true);

            // Connect WebSocket
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const socket = new WebSocket(`${protocol}//${window.location.hostname}:8000/ws/agent/call/`);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("Live Call Connected");
                // Send initial context if needed
                socket.send(JSON.stringify({ text: "Hello, I am ready to talk." }));
            };

            socket.onmessage = async (event) => {
                if (event.data instanceof Blob) {
                    const arrayBuffer = await event.data.arrayBuffer();
                    playReceivedAudio(arrayBuffer);
                } else {
                    const data = JSON.parse(event.data);

                    if (data.text) {
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            const last = newMsgs[newMsgs.length - 1];
                            if (last && last.role === 'ai') {
                                return [...newMsgs.slice(0, -1), { ...last, text: last.text + data.text }];
                            }
                            return [...newMsgs, { id: Date.now().toString(), role: 'ai', text: data.text }];
                        });
                    }

                    if (data.tool) {
                        setMessages(prev => [
                            ...prev,
                            {
                                id: Date.now().toString(),
                                role: 'ai',
                                text: `⚡ Using ${data.tool.replace('_', ' ')}...`,
                                properties: data.tool === "search_properties" ? data.result : undefined
                            }
                        ]);
                        if (data.tool === "search_properties" && data.result && data.result.length > 0) {
                            const mappedResults = data.result.map((r: any) => ({
                                ...r,
                                latitude: r.lat,
                                longitude: r.lng
                            }));
                            // The useMemo for allProperties will pick these up from the messages state.
                            if (mappedResults[0].latitude && mappedResults[0].longitude) {
                                map?.panTo({ lat: mappedResults[0].latitude, lng: mappedResults[0].longitude });
                            }
                        }
                    }
                }
            };

            // Start Speech Recognition for UI visual feedback
            if (recognitionRef.current) {
                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    // Add user message to chat for unification
                    setMessages(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === 'user' && !last.image) {
                            return [...prev.slice(0, -1), { ...last, text: transcript }];
                        }
                        return [...prev, { id: Date.now().toString(), role: 'user', text: transcript }];
                    });
                };
                recognitionRef.current.start();
            }

            // Setup audio input processing (ScriptProcessor)
            const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
            source.connect(scriptNode);
            scriptNode.connect(audioContext.destination);

            scriptNode.onaudioprocess = (e) => {
                if (socket.readyState === WebSocket.OPEN && !isLoading) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                    }
                    socket.send(pcmData.buffer);
                }
            };
        } catch (err) {
            console.error("Failed to access microphone:", err);
            alert("Please allow microphone access to use the voice feature.");
        }
    };

    const nextStartTimeRef = useRef<number>(0);

    const playReceivedAudio = (buffer: ArrayBuffer) => {
        if (!audioContextRef.current) return;

        const int16Data = new Int16Array(buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 0x7FFF;
        }

        const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        const currentTime = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < currentTime) {
            nextStartTimeRef.current = currentTime;
        }

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
    };

    const stopCall = () => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        window.speechSynthesis.cancel();
        setGlobalAnalyser(undefined);
        setIsCalling(false);
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatOpen) {
            scrollToBottom();
        }
    }, [messages, isChatOpen]);

    // Remove old silence detection effect as it's now in startCall
    /*
    useEffect(() => {
        if (isCalling && inputText.trim() && !isLoading) {
            const timeout = setTimeout(() => {
                handleSendMessage();
            }, 1000); 
            return () => clearTimeout(timeout);
        }
    }, [inputText, isCalling]);
    */

    // Collect all properties from chat history for markers
    const allProperties = useMemo(() => {
        const props: Property[] = [];
        messages.forEach(msg => {
            if (msg.properties) {
                props.push(...msg.properties);
            }
        });
        return props;
    }, [messages]);

    // Fit bounds when new properties arrive
    useEffect(() => {
        if (map && allProperties.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            allProperties.forEach(p => {
                if (p.latitude && p.longitude) {
                    bounds.extend({ lat: p.latitude, lng: p.longitude });
                }
            });
            // Also include pinned locations
            pinnedLocations.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));

            map.fitBounds(bounds);
        }
    }, [map, allProperties, pinnedLocations]);

    // Get User Location on Init
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => console.log("Geolocation failed or denied")
            );
        }
    }, []);

    const handleSendMessage = async (textOverride?: string, audioData?: string) => {
        const textToUse = textOverride !== undefined ? textOverride : inputText;
        if (!textToUse.trim() && pinnedLocations.length === 0 && !audioData) return;

        let displayMetrics = textToUse;
        if (pinnedLocations.length > 0) {
            const tags = pinnedLocations.map(l => `[${l.label}]`).join(' ');
            displayMetrics = `${tags} ${textToUse}`;
        }

        // Only add user message to list if it's text or if we have a transcript
        if (displayMetrics.trim() || !audioData) {
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                text: displayMetrics || "..."
            };
            setMessages(prev => [...prev, userMsg]);
        }

        setInputText("");
        const locationsToSend = pinnedLocations.map(l => ({ lat: l.lat, lng: l.lng }));

        // Only clear pins if we actually send text/intent
        if (textToUse.trim() || audioData) {
            setPinnedLocations([]);
            setIsPinningMode(false);
        }

        setIsLoading(true);

        try {
            const data = await aiService.chat(textToUse, locationsToSend, isCalling, audioData);

            // Update the last user message with transcript if backend provided one and we were just "..."
            if (audioData && data.intent_debug?.transcript) {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.role === 'user' && last.text === "...") {
                        last.text = data.intent_debug.transcript;
                    }
                    return newMsgs;
                });
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: data.response,
                properties: data.properties
            };
            setMessages(prev => [...prev, aiMsg]);

            if (isCalling) {
                speak(data.response, data.audio);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "I'm having trouble connecting to my brain right now."
            };
            setMessages(prev => [...prev, errorMsg]);
            if (isCalling) speak(errorMsg.text);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (isPinningMode && e.latLng) {
            const newLocation: PinnedLocation = {
                id: Date.now().toString(),
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                label: `Pin ${pinnedLocations.length + 1}`
            };
            setPinnedLocations(prev => [...prev, newLocation]);
            // Flash a message or toast here ideally
            setIsChatOpen(true); // Open chat to show it was added
        }
        // If clicking a blank spot and chat is open on mobile, maybe close it?
    };

    const removeLocation = (id: string) => {
        setPinnedLocations(prev => prev.filter(l => l.id !== id));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-zinc-900 fixed inset-0">
            <LiquidGlassFilters />

            <Header />

            {/* FULL SCREEN MAP */}
            {isLoaded ? (
                <div className="absolute inset-0 z-0 pointer-events-auto">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={center}
                        zoom={13}
                        onLoad={setMap}
                        onClick={handleMapClick}
                        options={{
                            styles: mapStyles,
                            disableDefaultUI: true,
                            zoomControl: true,
                        }}
                    >
                        {/* Property Markers */}
                        {allProperties.map(prop => (
                            prop.latitude && prop.longitude && (
                                <Marker
                                    key={prop.id}
                                    position={{ lat: prop.latitude, lng: prop.longitude }}
                                    onClick={() => setSelectedProperty(prop)}
                                    animation={google.maps.Animation.DROP}
                                />
                            )
                        ))}

                        {/* Pinned User Locations */}
                        {pinnedLocations.map(pin => (
                            <Marker
                                key={pin.id}
                                position={{ lat: pin.lat, lng: pin.lng }}
                                icon={{
                                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                                }}
                            />
                        ))}

                        {/* Info Window for Selected Property */}
                        {selectedProperty && (
                            <InfoWindow
                                position={{ lat: selectedProperty.latitude!, lng: selectedProperty.longitude! }}
                                onCloseClick={() => setSelectedProperty(null)}
                            >
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-gray-900">{selectedProperty.address}</h3>
                                    <p className="text-sm text-gray-600">${selectedProperty.price}/mo</p>
                                    <p className="text-xs text-blue-600 font-semibold">
                                        {selectedProperty.beds}bd | {selectedProperty.baths}ba
                                    </p>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>

                    {/* Feather Mask Overlay */}
                    <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">Loading Map...</div>
            )}


            {/* CHAT TOGGLE BUTTON (Floating) */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`
                    absolute z-30 bottom-6 left-6 
                    bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white
                    p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110
                    flex items-center gap-2 font-bold
                `}
            >
                <span className="material-symbols-outlined">{isChatOpen ? 'visibility_off' : 'chat'}</span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
                    {isChatOpen ? 'Hide Chat' : 'Ask AI'}
                </span>
            </button>

            {/* PINNING MODE INDICATOR */}
            {isPinningMode && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg animate-bounce cursor-default pointer-events-none">
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined">touch_app</span>
                        Tap map to pin location
                    </span>
                </div>
            )}

            {/* CHAT PANEL (Drawer) - Messages Only */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-[450px] z-[60]
                    transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                    ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="w-full h-full pb-24">
                    <LiquidGlass className="w-full h-full !rounded-l-3xl !rounded-r-none !p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="relative h-full flex flex-col pt-24 pb-6 px-6 w-full">

                            {/* Message List */}
                            <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-6 scrollbar-thin scrollbar-thumb-zinc-500/50">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                    max-w-[90%] text-sm p-4 rounded-xl shadow-sm
                                    ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-gray-200 rounded-bl-none'}
                                `}>
                                            {msg.text}
                                        </div>

                                        {msg.role === 'ai' && msg.properties && msg.properties.length > 0 && (
                                            <div className="w-full mt-4">
                                                <div className="flex flex-col gap-3">
                                                    {msg.properties.slice(0, 3).map((prop: any) => (
                                                        <div key={prop.id}
                                                            onClick={() => {
                                                                map?.panTo({ lat: prop.latitude, lng: prop.longitude });
                                                                setSelectedProperty(prop);
                                                            }}
                                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                                        >
                                                            <AiPropertyCard property={prop} commute={prop.commute} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="text-zinc-500 text-sm animate-pulse">Thinking...</div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </LiquidGlass>
                </div>
            </div>

            {/* VOICE VISUALIZER WAVES */}
            {isCalling && (
                <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
                    <VoiceWave />
                </div>
            )}

            {/* FLOATING INPUT AREA (Persistent) */}
            <div className={`
                fixed z-[70] bottom-8 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                ${isChatOpen
                    ? 'right-0 translate-x-0 w-[450px] px-6'
                    : 'left-1/2 -translate-x-1/2 w-full max-w-2xl px-4'
                }
            `}>
                {pinnedLocations.length > 0 && !isCalling && (
                    <div className={`flex flex-wrap gap-2 mb-2 ${isChatOpen ? 'justify-end' : 'justify-center'}`}>
                        {pinnedLocations.map(loc => (
                            <div key={loc.id} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg animate-in zoom-in">
                                <span>{loc.label}</span>
                                <button onClick={() => removeLocation(loc.id)} className="hover:text-red-300">×</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative w-full flex justify-center h-20 items-end">
                    <LiquidGlass
                        variant="nav"
                        className={`
                            transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl overflow-hidden !p-0
                            ${isCalling
                                ? 'w-[280px] h-14 !rounded-full bg-red-500/10 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
                                : 'w-full h-14 !rounded-full border-gray-500/20 bg-black/5 dark:bg-black/20'
                            }
                        `}
                    >
                        <div className="relative w-full h-full">
                            {/* Standard Content - Crosfade */}
                            <div className={`
                                flex items-center gap-2 w-full h-full px-2 transition-all duration-500
                                ${isCalling ? 'opacity-0 scale-90 pointer-events-none translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
                            `}>
                                <button
                                    onClick={() => {
                                        setIsPinningMode(!isPinningMode);
                                        if (isChatOpen) setIsChatOpen(false);
                                    }}
                                    className={`p-3 rounded-full flex items-center justify-center transition-all 
                                        ${isPinningMode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : 'hover:bg-white/10 text-zinc-400'}`}
                                >
                                    <span className="material-symbols-outlined">add_location_alt</span>
                                </button>

                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={isPinningMode ? "Click map to pin location..." : "Ask AI properties..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-400 resize-none h-[44px] px-2 py-2.5 leading-tight font-medium"
                                    disabled={isLoading}
                                    rows={1}
                                />

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={startCall}
                                        className="p-3 rounded-full text-zinc-400 hover:text-blue-500 transition-all hover:bg-white/5 active:scale-90"
                                    >
                                        <span className="material-symbols-outlined">mic</span>
                                    </button>

                                    <button
                                        onClick={handleSendMessage}
                                        disabled={(!inputText.trim() && pinnedLocations.length === 0) || isLoading}
                                        className={`
                                            p-2 rounded-full transition-all duration-300
                                            ${(inputText.trim() || pinnedLocations.length > 0) && !isLoading
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-zinc-500'
                                            }
                                        `}
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>

                            {/* Calling Content - Crosfade */}
                            <div
                                onClick={stopCall}
                                className={`
                                    absolute inset-0 flex items-center justify-center cursor-pointer transition-all duration-500
                                    ${isCalling ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 -translate-y-4 pointer-events-none'}
                                `}
                            >
                                <div className="flex items-center gap-4 px-4 whitespace-nowrap">
                                    <div className="relative flex">
                                        <div className="absolute inset-0 size-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                        <div className="relative size-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
                                    </div>
                                    <span className="text-white font-black uppercase tracking-[0.3em] text-[11px]">End Mabiti Call</span>
                                    <span className="material-symbols-outlined text-white text-3xl">call_end</span>
                                </div>
                            </div>
                        </div>
                    </LiquidGlass>

                    {/* Floating listening indicator */}
                    <div className={`
                        absolute -top-8 left-1/2 -translate-x-1/2 transition-all duration-500
                        ${isCalling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                    `}>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse whitespace-nowrap">
                            Assistant is listening...
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
};
