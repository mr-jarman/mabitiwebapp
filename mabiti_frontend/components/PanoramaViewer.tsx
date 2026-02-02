import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LiquidGlass } from './LiquidGlass';

interface PanoramaViewerProps {
    imageUrl: string;
    onClose: () => void;
}

type Quality = 'performance' | 'balanced';

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ imageUrl, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [quality, setQuality] = useState<Quality>('balanced');

    // State-like refs to avoid re-renders but keep values across loop
    const stateRef = useRef({
        lon: 0,
        lat: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        startLon: 0,
        startLat: 0,
        hasRenderedOnce: false,
        renderer: null as THREE.WebGLRenderer | null,
        camera: null as THREE.PerspectiveCamera | null,
        sphere: null as THREE.Mesh | null,
    });

    useEffect(() => {
        // Pause Aurora to free up GPU for 360
        window.dispatchEvent(new CustomEvent('pause-aurora'));

        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
        camera.position.set(0, 0, 0);
        stateRef.current.camera = camera;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: quality === 'balanced',
            alpha: false,
            powerPreference: 'high-performance',
            precision: quality === 'balanced' ? 'highp' : 'mediump'
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(quality === 'balanced' ? Math.min(window.devicePixelRatio, 2) : 1);
        stateRef.current.renderer = renderer;

        const geometry = new THREE.SphereGeometry(500, quality === 'balanced' ? 60 : 32, quality === 'balanced' ? 40 : 16);
        geometry.scale(-1, 1, 1);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
            imageUrl,
            () => {
                setTimeout(() => setIsLoading(false), 300);
            },
            (xhr) => {
                if (xhr.lengthComputable) {
                    const percent = Math.round((xhr.loaded / xhr.total) * 100);
                    setLoadProgress(percent);
                }
            }
        );

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        stateRef.current.sphere = sphere;
        scene.add(sphere);

        let animateId: number;
        const animate = () => {
            animateId = requestAnimationFrame(animate);

            // Directly use lon/lat for instant response (no damping)
            const lat = Math.max(-85, Math.min(85, stateRef.current.lat));
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(stateRef.current.lon);

            const x = 500 * Math.sin(phi) * Math.cos(theta);
            const y = 500 * Math.cos(phi);
            const z = 500 * Math.sin(phi) * Math.sin(theta);

            camera.lookAt(x, y, z);
            renderer.render(scene, camera);
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.dispatchEvent(new CustomEvent('resume-aurora'));
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animateId);
            geometry.dispose();
            material.dispose();
            texture.dispose();
            renderer.dispose();
        };
    }, [imageUrl, quality]);

    const handlePointerDown = (e: React.PointerEvent) => {
        stateRef.current.isDragging = true;
        stateRef.current.startX = e.clientX;
        stateRef.current.startY = e.clientY;
        stateRef.current.startLon = stateRef.current.lon;
        stateRef.current.startLat = stateRef.current.lat;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!stateRef.current.isDragging) return;

        // Increased sensitivity and direct mapping for instant feel
        const factor = quality === 'balanced' ? 0.1 : 0.15;
        stateRef.current.lon = stateRef.current.startLon + (stateRef.current.startX - e.clientX) * factor;
        stateRef.current.lat = stateRef.current.startLat + (e.clientY - stateRef.current.startY) * factor;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        stateRef.current.isDragging = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center touch-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto" />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-[210]">
                    <div className="flex flex-col items-center gap-8 w-64">
                        <div className="relative size-24 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-white/5 rounded-full scale-110"></div>
                            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="text-blue-500 transition-all duration-300"
                                    strokeWidth="3"
                                    strokeDasharray={2 * Math.PI * 45}
                                    strokeDashoffset={2 * Math.PI * 45 * (1 - loadProgress / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <span className="absolute text-white font-black text-xl tracking-tighter">{loadProgress}%</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-white text-[12px] font-black uppercase tracking-[0.5em] animate-pulse">Mabiti Vision 360</span>
                            <div className="flex items-center gap-2">
                                <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/20"></span>
                                <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-bold">Initializing Engine</span>
                                <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/20"></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quality Controls */}
            <div className="absolute bottom-10 right-10 z-30 flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex items-center gap-1 shadow-2xl">
                    <button
                        onClick={() => setQuality('performance')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quality === 'performance' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Perform
                    </button>
                    <button
                        onClick={() => setQuality('balanced')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quality === 'balanced' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Quality
                    </button>
                </div>
            </div>

            {/* Header Badge */}
            <div className="absolute top-10 pointer-events-none select-none z-20">
                <LiquidGlass variant="clear" className="!bg-black/40 backdrop-blur-xl border border-white/10 !rounded-full !p-0 shadow-2xl">
                    <div className="flex items-center gap-4 px-8 py-4">
                        <span className="material-symbols-outlined text-white text-3xl animate-pulse">360</span>
                        <div className="flex flex-col">
                            <span className="text-white font-black uppercase tracking-[0.3em] text-[12px] leading-tight">Mabiti Vision</span>
                            <span className="text-zinc-400 font-bold uppercase tracking-[0.1em] text-[9px]">Panoramic Explorer v2.0</span>
                        </div>
                    </div>
                </LiquidGlass>
            </div>

            {/* Close Button */}
            <div className="absolute top-10 right-10 z-30">
                <LiquidGlass
                    variant="clear"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="group !p-0 !bg-white/5 hover:!bg-white/20 active:scale-90 transition-all !rounded-2xl border border-white/20 backdrop-blur-2xl pointer-events-auto"
                >
                    <div className="w-16 h-16 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl group-hover:rotate-90 transition-transform duration-500">close</span>
                    </div>
                </LiquidGlass>
            </div>

            {/* Navigation Hint */}
            {!stateRef.current.isDragging && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 animate-pulse z-20">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-white text-6xl">drag_pan</span>
                        <span className="text-white text-[12px] font-black uppercase tracking-[0.6em]">Drag to Explore</span>
                    </div>
                </div>
            )}
        </div>
    );
};
