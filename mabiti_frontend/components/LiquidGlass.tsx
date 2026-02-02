import React from 'react';

interface LiquidGlassProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'large' | 'nav' | 'clear';
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
    children,
    className = '',
    onClick,
    variant = 'default'
}) => {
    const isClear = variant === 'clear';

    return (
        <div
            onClick={onClick}
            className={`
        relative flex font-semibold text-[var(--lg-text)] cursor-pointer bg-transparent overflow-hidden
        transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,2.2)]
        shadow-[0_6px_6px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1)]
        
        ${variant === 'nav' ? 'rounded-full' : 'rounded-[2rem]'}
        ${variant === 'large' ? 'min-w-[32rem]' : ''}
        ${className}
      `}
        >
            {/* Layer 0: Glass Filter (Distortion) */}
            <div
                className="absolute inset-0 z-0 backdrop-blur-[0px] isolate"
                style={{ filter: 'url(#lg-dist)' }}
            />

            {/* Layer 1: Glass Overlay (Background Color) - Transparent for 'clear' variant */}
            <div className={`absolute inset-0 z-[1] ${isClear ? 'bg-transparent' : 'bg-[var(--lg-bg-color)]'}`} />

            {/* Layer 2: Glass Specular (Highlights/Borders) - Lighter for 'clear' variant */}
            <div className={`
                absolute inset-0 z-[2] rounded-[inherit] overflow-hidden pointer-events-none
                ${isClear
                    ? 'shadow-[inset_1px_1px_0_rgba(255,255,255,0.3),inset_0_0_8px_rgba(255,255,255,0.15)]'
                    : 'shadow-[inset_1px_1px_0_var(--lg-highlight),inset_0_0_5px_var(--lg-highlight)]'
                }
            `} />

            {/* Layer 3: Glass Content */}
            <div className={`
        relative z-[3] flex items-center w-full gap-0 pl-0 pr-0 pt-0 pb-0
        ${variant === 'nav' ? 'px-4 py-2' : 'p-[1rem_1.5rem_0.9rem]'}
      `}>
                {children}
            </div>
        </div>
    );
};

// Global SVG definition component to be placed in App root
export const LiquidGlassFilters = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
            <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="1" seed="92" result="noise" />
                <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
                <feDisplacementMap in="SourceGraphic" in2="blurred" scale="50" xChannelSelector="R" yChannelSelector="G" />
            </filter>
        </defs>
    </svg>
);
