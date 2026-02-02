// Licence CC BY-NC-SA 4.0
// Attribution — You must give appropriate credit.
// Non Commercial — You may not use the material for commercial purposes.

import React, { useEffect, useRef } from 'react';

interface LiquidBackgroundProps {
    className?: string;
    metalness?: number;
    roughness?: number;
    displacementScale?: number;
    rain?: boolean;
    imageUrl?: string;
}

// Global flag to track if the library is loaded
let liquidBackgroundLibraryLoaded = false;
let liquidBackgroundLoadingPromise: Promise<void> | null = null;

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({
    className = '',
    metalness = 0.75,
    roughness = 0.25,
    displacementScale = 5,
    rain = false,
    imageUrl = '/Images/bg.png'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        let mounted = true;

        const loadLibrary = (): Promise<void> => {
            if (liquidBackgroundLibraryLoaded) {
                return Promise.resolve();
            }

            if (liquidBackgroundLoadingPromise) {
                return liquidBackgroundLoadingPromise;
            }

            liquidBackgroundLoadingPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.innerHTML = `
                    import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js';
                    window.LiquidBackground = LiquidBackground;
                    window.dispatchEvent(new Event('liquidBackgroundLoaded'));
                `;

                const onLoad = () => {
                    liquidBackgroundLibraryLoaded = true;
                    resolve();
                };

                window.addEventListener('liquidBackgroundLoaded', onLoad, { once: true });

                script.onerror = () => {
                    reject(new Error('Failed to load LiquidBackground library'));
                };

                document.head.appendChild(script);
            });

            return liquidBackgroundLoadingPromise;
        };

        const initLiquid = async () => {
            try {
                await loadLibrary();

                // Add a small delay to ensure DOM is fully ready
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!mounted || !canvasRef.current) return;

                const LiquidBackground = (window as any).LiquidBackground;
                if (!LiquidBackground) {
                    console.error('LiquidBackground not found on window');
                    return;
                }

                // Initialize with the canvas element
                const app = LiquidBackground(canvasRef.current);

                // Configure material properties
                app.loadImage(imageUrl);
                app.liquidPlane.material.metalness = metalness;
                app.liquidPlane.material.roughness = roughness;
                app.liquidPlane.uniforms.displacementScale.value = displacementScale;
                app.setRain(rain);

                appRef.current = app;

                console.log('LiquidBackground initialized successfully');
            } catch (error) {
                console.error('Error initializing liquid background:', error);
            }
        };

        initLiquid();

        return () => {
            mounted = false;
            // Cleanup Three.js scene if the library provides a cleanup method
            if (appRef.current && typeof appRef.current.dispose === 'function') {
                try {
                    appRef.current.dispose();
                } catch (e) {
                    console.warn('Error disposing liquid background:', e);
                }
            }
        };
    }, [metalness, roughness, displacementScale, rain, imageUrl]);

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        >
            <canvas
                ref={canvasRef}
                id="liquid-canvas"
                className="w-full h-full"
                style={{ display: 'block' }}
            />
        </div>
    );
};
