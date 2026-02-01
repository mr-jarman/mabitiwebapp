import React, { useState, useEffect, useRef, memo } from 'react';
import { Header } from '../components/Header';
import { LiquidGlassFilters, LiquidGlass } from '../components/LiquidGlass';
import { DottedSurface } from '../components/DottedSurface';
import { useVisualizer } from '../services/VisualizerContext';

// Memoize stable components to prevent re-renders
const MemoizedFilters = memo(LiquidGlassFilters);
const MemoizedHeader = memo(Header);

export const AiPage: React.FC = () => {
    const { setAnalyser: setGlobalAnalyser } = useVisualizer();
    const [isCallActive, setIsCallActive] = useState(false);
    const [inputText, setInputText] = useState("");
    const [analyser, setAnalyser] = useState<AnalyserNode | undefined>(undefined);

    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyserNode = audioContext.createAnalyser();

            analyserNode.fftSize = 256;
            source.connect(analyserNode);

            audioContextRef.current = audioContext;
            setAnalyser(analyserNode);
            setGlobalAnalyser(analyserNode);
            setIsCallActive(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access is required for call mode.");
        }
    };

    const stopAudioCapture = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setAnalyser(undefined);
        setGlobalAnalyser(undefined);
        setIsCallActive(false);
    };

    const toggleCall = () => {
        if (isCallActive) {
            stopAudioCapture();
        } else {
            startAudioCapture();
        }
    };

    useEffect(() => {
        return () => {
            stopAudioCapture();
            setGlobalAnalyser(undefined);
        };
    }, []);

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-transparent overflow-hidden">
            <MemoizedFilters />

            {/* DottedSurface now handles audio sampling internally via the analyser prop */}
            <DottedSurface analyserNode={analyser} animated={true} />

            <MemoizedHeader />

            <main className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
                <div className="max-w-2xl w-full text-center mb-12 relative z-10">
                    <h1 className="text-zinc-900 dark:text-white text-5xl font-black tracking-tight mb-4 drop-shadow-2xl">
                        Ready for a <span className="text-blue-600 dark:text-blue-400">Call?</span>
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium leading-relaxed">
                        Connect with our AI specialized in real estate. Ask about market trends, property evaluations, or just start a conversation.
                    </p>
                </div>

                {/* Floating Interaction Bar */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
                    <LiquidGlass variant="default" className="w-full flex items-center gap-3 p-2 pr-4 bg-white/40 dark:bg-zinc-900/40 border border-black/5 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
                        <button
                            onClick={toggleCall}
                            className={`size-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCallActive
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-black/5 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            title={isCallActive ? "End Call" : "Start Call"}
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {isCallActive ? 'call_end' : 'call'}
                            </span>
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isCallActive ? "AI is listening..." : "Ask AI about properties..."}
                            className="flex-1 bg-transparent border-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-0 text-lg py-3"
                        />

                        <button
                            className={`size-12 rounded-2xl flex items-center justify-center transition-all ${inputText.trim()
                                ? 'bg-white text-black scale-100 hover:scale-105 active:scale-95'
                                : 'bg-white/5 text-zinc-600 scale-90 cursor-not-allowed'
                                }`}
                            disabled={!inputText.trim()}
                        >
                            <span className="material-symbols-outlined text-[24px]">send</span>
                        </button>
                    </LiquidGlass>

                    {isCallActive && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            <div className="size-2 rounded-full bg-red-500 animate-ping"></div>
                            <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Live Audio Integration</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
