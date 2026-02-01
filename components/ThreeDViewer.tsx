import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Simple 3D House Model Component
const HouseModel: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
    const houseRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (houseRef.current) {
            // Subtle floating animation
            houseRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={houseRef} scale={scale}>
            {/* Main House Body */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 2.5]} />
                <meshStandardMaterial 
                    color={hovered ? "#e0e7ff" : "#f5f5f5"} 
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[2.2, 1.5, 4]} />
                <meshStandardMaterial 
                    color="#dc2626" 
                    roughness={0.6}
                    metalness={0.2}
                />
            </mesh>

            {/* Door */}
            <mesh position={[0, 0.5, 1.26]} castShadow>
                <boxGeometry args={[0.6, 1.2, 0.1]} />
                <meshStandardMaterial color="#8b4513" roughness={0.8} />
            </mesh>

            {/* Door Knob */}
            <mesh position={[0.2, 0.5, 1.31]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Windows - Front */}
            <group position={[0, 1.2, 1.26]}>
                <mesh position={[-0.8, 0, 0]}>
                    <boxGeometry args={[0.5, 0.5, 0.05]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
                </mesh>
                <mesh position={[0.8, 0, 0]}>
                    <boxGeometry args={[0.5, 0.5, 0.05]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
                </mesh>
            </group>

            {/* Windows - Sides */}
            <mesh position={[-1.51, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.05]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
            </mesh>
            <mesh position={[1.51, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.05]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
            </mesh>

            {/* Chimney */}
            <mesh position={[-1, 2.8, -0.5]} castShadow>
                <boxGeometry args={[0.4, 1, 0.4]} />
                <meshStandardMaterial color="#8b4513" roughness={0.8} />
            </mesh>

            {/* Garden/Base */}
            <mesh position={[0, -0.05, 0]} receiveShadow>
                <cylinderGeometry args={[3, 3, 0.1, 32]} />
                <meshStandardMaterial color="#22c55e" roughness={0.9} />
            </mesh>

            {/* Driveway */}
            <mesh position={[0, -0.04, 2]} receiveShadow>
                <boxGeometry args={[1.5, 0.05, 2]} />
                <meshStandardMaterial color="#6b7280" roughness={0.7} />
            </mesh>

            {/* Trees */}
            <group position={[-2.5, 0.3, -1.5]}>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
                    <meshStandardMaterial color="#8b4513" />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <coneGeometry args={[0.4, 0.8, 8]} />
                    <meshStandardMaterial color="#059669" />
                </mesh>
            </group>

            <group position={[2.5, 0.3, -1.5]}>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
                    <meshStandardMaterial color="#8b4513" />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <coneGeometry args={[0.4, 0.8, 8]} />
                    <meshStandardMaterial color="#059669" />
                </mesh>
            </group>

            {/* Interactive hitbox */}
            <mesh
                position={[0, 1, 0]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                visible={false}
            >
                <boxGeometry args={[4, 4, 4]} />
            </mesh>
        </group>
    );
};

// Loading Component
const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-zinc-700 dark:text-zinc-300 font-semibold">Loading 3D Model...</p>
    </div>
);

// Main 3D Viewer Component
interface ThreeDViewerProps {
    isOpen: boolean;
    onClose: () => void;
    propertyTitle?: string;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    isOpen, 
    onClose,
    propertyTitle = "Property 3D Tour"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 size-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:rotate-90"
            >
                <span className="material-symbols-outlined text-[28px]">close</span>
            </button>

            {/* Title */}
            <div className="absolute top-6 left-6 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
                <h2 className="text-white font-bold text-lg">{propertyTitle}</h2>
                <p className="text-white/70 text-sm">Interactive 3D Tour</p>
            </div>

            {/* Controls Info */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
                <div className="flex items-center gap-6 text-white text-sm">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">mouse</span>
                        <span>Drag to Rotate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                        <span>Scroll to Zoom</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">touch_app</span>
                        <span>Touch to Explore</span>
                    </div>
                </div>
            </div>

            {/* 3D Canvas */}
            <div className="w-full h-full">
                <Canvas
                    shadows
                    className="cursor-grab active:cursor-grabbing"
                    gl={{ 
                        antialias: true,
                        alpha: true,
                        preserveDrawingBuffer: true 
                    }}
                >
                    <PerspectiveCamera makeDefault position={[5, 4, 8]} fov={50} />
                    
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight 
                        position={[10, 10, 5]} 
                        intensity={1} 
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <pointLight position={[-10, 10, -5]} intensity={0.3} />
                    <spotLight 
                        position={[0, 15, 0]} 
                        angle={0.3} 
                        penumbra={1} 
                        intensity={0.5}
                        castShadow
                    />

                    {/* Environment */}
                    <Environment preset="sunset" />
                    
                    {/* 3D Model */}
                    <Suspense fallback={null}>
                        <HouseModel scale={1} />
                        <ContactShadows 
                            position={[0, -0.1, 0]} 
                            opacity={0.4} 
                            scale={10} 
                            blur={2} 
                            far={4}
                        />
                    </Suspense>

                    {/* Controls */}
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={3}
                        maxDistance={15}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2}
                        autoRotate={false}
                        autoRotateSpeed={0.5}
                    />

                    {/* Grid Helper (optional) */}
                    {/* <gridHelper args={[20, 20, '#888888', '#444444']} position={[0, -0.1, 0]} /> */}
                </Canvas>
            </div>

            {/* Quick Actions */}
            <div className="absolute top-24 right-6 z-50 space-y-3">
                <button className="size-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group">
                    <span className="material-symbols-outlined text-[24px]">screenshot</span>
                    <span className="absolute right-14 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Take Screenshot
                    </span>
                </button>
                <button className="size-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group">
                    <span className="material-symbols-outlined text-[24px]">fullscreen</span>
                    <span className="absolute right-14 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Fullscreen
                    </span>
                </button>
                <button className="size-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group">
                    <span className="material-symbols-outlined text-[24px]">share</span>
                    <span className="absolute right-14 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Share Tour
                    </span>
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ThreeDViewer;
