import React, { useEffect, useRef, useState } from 'react';
import { useVisualizer } from '../services/VisualizerContext';

export const VoiceWave: React.FC = () => {
    const { analyser } = useVisualizer();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isEntryFinished, setIsEntryFinished] = useState(false);

    useEffect(() => {
        // Simple delay to trigger CSS entry animation
        const timer = setTimeout(() => setIsEntryFinished(true), 50);

        if (!canvasRef.current || !analyser) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let animationId: number;
        let phase = 0;

        const render = () => {
            animationId = requestAnimationFrame(render);
            analyser.getByteFrequencyData(dataArray);

            // Get average volume for overall scale
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            const volumeScale = Math.min(1.8, average / 40); // boosted for visibility

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            phase += 0.015 + volumeScale * 0.04;

            const drawAurora = (offset: number, opacity: number, colors: string[], speed: number, scale: number) => {
                ctx.save();
                ctx.globalAlpha = opacity * (0.4 + volumeScale * 0.6);
                ctx.globalCompositeOperation = 'lighter';

                const grad = ctx.createLinearGradient(0, height, 0, 0);
                grad.addColorStop(0, colors[0]);
                grad.addColorStop(0.5, colors[1]);
                grad.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.moveTo(0, height);

                for (let x = 0; x <= width; x += 30) {
                    const noise = dataArray[Math.floor((x / width) * (bufferLength / 2))] / 255;
                    // Sine waves for the vertical "curtain" movement
                    const wave1 = Math.sin(x * 0.0015 + phase * speed + offset);
                    const wave2 = Math.sin(x * 0.004 - phase * speed * 0.6 + offset);

                    const amplitude = scale * (60 + noise * 180 * volumeScale);
                    const y = height * 0.8 - (wave1 * 0.6 + wave2 * 0.4) * amplitude;

                    ctx.lineTo(x, y);
                }

                ctx.lineTo(width, height);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            };

            // Aurora Layers - Shifting Curtains
            drawAurora(0, 0.5, ['rgba(0, 40, 150, 0.9)', 'rgba(0, 120, 255, 0.5)'], 0.4, 0.9);
            drawAurora(Math.PI / 4, 0.6, ['rgba(0, 150, 80, 0.9)', 'rgba(100, 255, 150, 0.5)'], 0.6, 1.1);
            drawAurora(Math.PI / 1.8, 0.5, ['rgba(120, 0, 200, 0.9)', 'rgba(200, 100, 255, 0.5)'], 0.3, 1.3);
            drawAurora(Math.PI, 0.4, ['rgba(0, 150, 200, 0.9)', 'rgba(100, 230, 255, 0.5)'], 0.8, 0.7);

            // Subtle vertical glow lines
            ctx.save();
            ctx.globalAlpha = 0.1 * volumeScale;
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const lx = (width / 5) * i + (Math.sin(phase) * 50);
                ctx.beginPath();
                ctx.moveTo(lx, height);
                ctx.lineTo(lx, 0);
                ctx.strokeStyle = 'white';
                ctx.stroke();
            }
            ctx.restore();
        };

        render();

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(timer);
        };
    }, [analyser]);

    return (
        <canvas
            ref={canvasRef}
            width={1600}
            height={800}
            className={`
                fixed bottom-0 left-0 w-full h-[50vh] pointer-events-none z-[45] 
                mix-blend-screen filter blur-[35px] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${isEntryFinished ? 'opacity-90 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-90'}
            `}
        />
    );
};
