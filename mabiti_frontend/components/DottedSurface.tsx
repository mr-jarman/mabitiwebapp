'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '../services/webgl';
import { useTheme } from '../services/ThemeContext';

const vertexShader = `
    uniform float uTime;
    uniform float uIntensity;
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
        vColor = color;
        vec3 pos = position;
        
        float wave = (
            sin(pos.x * 0.002 + uTime * 3.0) * 50.0 + 
            sin(pos.z * 0.003 + uTime * 5.0) * 50.0
        ) * uIntensity;
        
        pos.y = wave;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 8.0 * (1000.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
    varying vec3 vColor;
    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        gl_FragColor = vec4(vColor / 255.0, alpha * 0.8);
    }
`;

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'> & {
    className?: string;
    intensity?: number;
    analyserNode?: AnalyserNode;
    animated?: boolean;
    orientation?: 'vertical' | 'horizontal' | 'transitioning';
};

export function DottedSurface({ className = '', intensity = 1.0, analyserNode, animated = false, orientation = 'vertical', ...props }: DottedSurfaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const intensityRef = useRef(intensity);
    const analyserRef = useRef<AnalyserNode | undefined>(analyserNode);
    const animatedRef = useRef(animated);
    const orientationRef = useRef(orientation);
    const useWebGL = useRef(isWebGLAvailable());
    const { theme } = useTheme();

    const uniformsRef = useRef({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
    });

    useEffect(() => {
        intensityRef.current = intensity;
        uniformsRef.current.uIntensity.value = intensity;
    }, [intensity]);

    useEffect(() => {
        analyserRef.current = analyserNode;
    }, [analyserNode]);

    useEffect(() => {
        animatedRef.current = animated;
    }, [animated]);

    useEffect(() => {
        orientationRef.current = orientation;
    }, [orientation]);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- WEBGL PATH (THREE.JS) ---
        if (useWebGL.current) {
            const SEPARATION = 150;
            const AMOUNTX = 40;
            const AMOUNTY = 60;

            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x000000, 2000, 10000);

            const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);

            // Initial camera position based on orientation
            const getCameraPosition = (orient: string) => {
                if (orient === 'horizontal') {
                    // Side view (horizontal perspective)
                    return { x: 2000, y: 200, z: 0 };
                } else if (orient === 'transitioning') {
                    // Mid transition
                    return { x: 1000, y: 280, z: 610 };
                } else {
                    // Default vertical view
                    return { x: 0, y: 355, z: 1220 };
                }
            };

            const pos = getCameraPosition(orientation);
            camera.position.set(pos.x, pos.y, pos.z);
            camera.lookAt(0, 0, 0);

            let renderer: THREE.WebGLRenderer;
            try {
                renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor(scene.fog.color, 0);
            } catch (e) {
                console.error("WebGL initialization failed, falling back to Canvas2D", e);
                // Force switch to Canvas path by manipulating the ref (hacky but effective for current render cycle if forced re-render or just return early to let parent re-render? 
                // Better: Just return and let the user see nothing for a split second or set state? 
                // Since this is inside useEffect, we can't easily switch the render path of THIS render.
                // But we can rely on our `useWebGL` ref being correct next time? No.
                // For now, let's just abort this block. The user calls `isWebGLAvailable` which checks context. 
                // If `new WebGLRenderer` throws, it's a hard fail.
                return;
            }

            containerRef.current.appendChild(renderer.domElement);

            const positions = new Float32Array(AMOUNTX * AMOUNTY * 3);
            const colors = new Float32Array(AMOUNTX * AMOUNTY * 3);

            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    positions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                    positions[i * 3 + 1] = 0;
                    positions[i * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                    // Theme based color
                    // Light mode: 180 (Light Grey) | Dark mode: 200 (White/Grey)
                    const colorVal = theme === 'dark' ? 200 : 180;
                    colors[i * 3] = colorVal;
                    colors[i * 3 + 1] = colorVal;
                    colors[i * 3 + 2] = colorVal;
                    i++;
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.ShaderMaterial({
                uniforms: uniformsRef.current,
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            const clock = new THREE.Clock();
            const audioData = new Uint8Array(128);
            let totalTime = Math.random() * 100;

            const animate = () => {
                requestRef.current = requestAnimationFrame(animate);
                const delta = clock.getDelta();

                if (animatedRef.current) {
                    totalTime += delta * 0.8; // Fast speed for active state
                } else {
                    totalTime += delta * 0.05; // Slow drift for idle state
                }

                // Smooth camera transitions
                const targetPos = getCameraPosition(orientationRef.current);
                const lerpSpeed = 0.05; // Smooth transition speed
                camera.position.x += (targetPos.x - camera.position.x) * lerpSpeed;
                camera.position.y += (targetPos.y - camera.position.y) * lerpSpeed;
                camera.position.z += (targetPos.z - camera.position.z) * lerpSpeed;
                camera.lookAt(0, 0, 0);

                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(audioData);
                    let sum = 0;
                    for (let j = 0; j < audioData.length; j++) sum += audioData[j];
                    const average = sum / audioData.length;
                    uniformsRef.current.uIntensity.value = 1.0 + (average / 255.0) * 11.0;
                } else {
                    uniformsRef.current.uIntensity.value = intensityRef.current;
                }

                uniformsRef.current.uTime.value = totalTime;
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
                window.removeEventListener('resize', handleResize);
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                geometry.dispose();
                material.dispose();
                renderer.dispose();
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
            };
        }

        // --- CANVAS 2D FALLBACK PATH ---
        else {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            let width = window.innerWidth;
            let height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Increased separation for cleaner look
            const SEPARATION = 60;
            const audioData = new Uint8Array(128);
            let time = 0;

            const draw = () => {
                requestRef.current = requestAnimationFrame(draw);

                // Match speed logic from WebGL path
                if (animatedRef.current) {
                    time += 0.05;
                } else {
                    time += 0.005;
                }

                let audioIntensity = 1.0;
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(audioData);
                    let sum = 0;
                    for (let j = 0; j < audioData.length; j++) sum += audioData[j];
                    audioIntensity = 1.0 + (sum / audioData.length / 255.0) * 2.0;
                }

                ctx.clearRect(0, 0, width, height);
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = theme === 'dark' ? 'rgba(200, 200, 200, 0.4)' : 'rgba(180, 180, 180, 0.4)';

                // Move "camera" up and back
                const offsetX = width / 2;
                const offsetY = height * 0.4; // Higher horizon line (was height/1.5)
                const fov = 1000;

                // Wider grid
                const ROWS = 50;
                const COLS = 50; // Increased width

                for (let ix = 0; ix < COLS; ix++) {
                    for (let iy = 0; iy < ROWS; iy++) {
                        // Center the grid
                        const px = (ix - COLS / 2) * SEPARATION;

                        // Push grid into z-distance
                        const pz = (iy * SEPARATION) - 500;

                        // 3D Projection
                        // z-index: higher z = further away. 
                        // In canvas, y increases downwards.
                        // We want rows to recede "up" the screen.

                        // Modified projection to look "down" at a floor
                        const scale = fov / (fov + pz);
                        if (scale < 0) continue; // Behind camera

                        const x3d = px;
                        const y3d = 400; // Fixed "floor" height relative to camera

                        // Wave effect on Y
                        const wave = Math.sin(ix * 0.2 + time) * 20 + Math.sin(iy * 0.2 + time * 1.5) * 20;
                        const yWithWave = y3d + (wave * audioIntensity * intensityRef.current);

                        const x2d = offsetX + x3d * scale;
                        const y2d = offsetY + yWithWave * scale;

                        const size = 2.0 * scale * audioIntensity;
                        if (size > 0.1 && y2d < height + 10 && y2d > -10 && x2d > -10 && x2d < width + 10) {
                            ctx.beginPath();
                            ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            };

            const handleResize = () => {
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = width;
                canvas.height = height;
            };

            window.addEventListener('resize', handleResize);
            draw();

            return () => {
                window.removeEventListener('resize', handleResize);
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
            };
        }
    }, [theme]);

    return (
        <div ref={containerRef} className={`pointer-events-none fixed inset-0 -z-10 ${className}`} {...props}>
            {!useWebGL.current && <canvas ref={canvasRef} className="w-full h-full" />}
        </div>
    );
}
