import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { generateAIInsights } from '../services/geminiService';
import { AIInsightsData, Property } from '../types';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Header } from '../components/Header';
import { PanoramaViewer } from '../components/PanoramaViewer';
import { LiquidGlass, LiquidGlassFilters } from '../components/LiquidGlass';

import { propertyService } from '../services/propertyService';
import { rentalService } from '../services/rentalService';

const MemoizedFilters = memo(LiquidGlassFilters);
const MemoizedHeader = memo(Header);

import { useAuth } from '../services/AuthContext';

export const PropertyDetailPage: React.FC = () => {
    const { id: propertyId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState<Property | null>(null);
    const [insights, setInsights] = useState<AIInsightsData | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places']
    });

    // Define map styles for dark mode
    const mapStyles = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
    ];

    // Load property data
    useEffect(() => {
        const loadProperty = async () => {
            if (!propertyId) return;
            try {
                const foundProperty = await propertyService.getById(propertyId);
                setProperty(foundProperty);
                // Reset insights when property changes
                setInsights(null);
            } catch (error) {
                console.error('Error loading property:', error);
            }
        };
        loadProperty();
        window.scrollTo(0, 0); // Scroll to top on navigation
    }, [propertyId]);

    const [show360, setShow360] = useState(false);

    const fetchInsights = useCallback(async () => {
        if (!property) return;
        setIsAiLoading(true);
        const data = await generateAIInsights(property.description, property.neighborhood);
        setInsights(data);
        setIsAiLoading(false);
    }, [property]);

    useEffect(() => {
        if (property && !insights) {
            fetchInsights();
        }
    }, [property, insights, fetchInsights]);

    if (!property) return <div className="h-screen flex items-center justify-center text-white">Property not found</div>;

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-zinc-50 dark:bg-black/90 transition-colors duration-500">
            <MemoizedFilters />

            {/* Background Layer */}
            <div className="fixed inset-0 z-[-1] select-none pointer-events-none">
                {/* Dark overlay for dark mode only */}
                <div className="absolute inset-0 bg-white/60 dark:bg-[#050505]/85 backdrop-blur-[2px] z-10 transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#050505] z-10 transition-colors duration-500"></div>
                <img alt="Backdrop" className="w-full h-full object-cover opacity-30 dark:opacity-60 scale-[1.02]" src={property.images.hero} />
            </div>

            <MemoizedHeader />

            <main className="layout-container flex h-full grow flex-col pt-6 pb-12">
                <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col max-w-[1280px] flex-1">

                        <Breadcrumbs neighborhood={property.neighborhood} />

                        <Gallery
                            images={property.images}
                            panorama_images={property.panorama_images}
                            onOpen360={() => setShow360(true)}
                        />

                        {show360 && property.panorama_images && property.panorama_images.length > 0 && (
                            <PanoramaViewer
                                imageUrl={property.panorama_images[0]}
                                onClose={() => setShow360(false)}
                            />
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
                            {/* Main Content Area */}
                            <div className="lg:col-span-8 flex flex-col gap-8">

                                {/* Property Detail Panel */}
                                <div className="glass-panel rounded-3xl p-8 flex flex-col gap-8 bg-white dark:bg-black/40 border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-xl backdrop-blur-md">
                                    <div className="flex flex-col gap-2 border-b border-zinc-100 dark:border-white/5 pb-8">
                                        <div className="flex justify-between items-start flex-wrap gap-4">
                                            <div>
                                                <h1 className="text-black dark:text-white text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-3">
                                                    ${property.price.toLocaleString()}
                                                    {property.listing_type === 'rent' && <span className="text-xl font-medium ml-2 opacity-60">/mo</span>}
                                                </h1>
                                                <p className="text-zinc-600 dark:text-zinc-400 text-lg font-normal flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-zinc-500">location_on</span>
                                                    {property.address}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {user && (user.is_admin || user.is_staff) && (
                                                    <button
                                                        onClick={async () => {
                                                            if (property) {
                                                                const result = await propertyService.toggleVisibility(property.id);
                                                                setProperty({ ...property, is_visible: result.is_visible });
                                                            }
                                                        }}
                                                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${property.is_visible
                                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                            : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30 hover:bg-yellow-200 dark:hover:bg-yellow-500/30'
                                                            }`}
                                                    >
                                                        {property.is_visible ? 'Hide from Store' : 'Show in Store'}
                                                    </button>
                                                )}
                                                {user && user.is_superuser && (
                                                    <button
                                                        onClick={async () => {
                                                            if (property && window.confirm('Are you sure you want to PERMANENTLY delete this property?')) {
                                                                await propertyService.deletePermanently(property.id);
                                                                navigate('/home');
                                                            }
                                                        }}
                                                        className="px-4 py-1.5 rounded-full text-sm font-semibold border bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30 transition-all"
                                                    >
                                                        Delete Permanently
                                                    </button>
                                                )}
                                                <span className={`px-4 py-1.5 text-sm font-semibold rounded-full tracking-wide uppercase shrink-0 border ${property.listing_type === 'buy'
                                                    ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30'
                                                    : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30'
                                                    }`}>
                                                    For {property.listing_type === 'buy' ? 'Buy' : 'Rent'}
                                                </span>
                                                {property.has_online_lock && (
                                                    <span className="px-4 py-1.5 text-sm font-semibold rounded-full tracking-wide uppercase shrink-0 border bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                                                        Digital Key Supported
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6">
                                            <StatItem icon="bed" value={property.beds} label="Beds" />
                                            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 hidden sm:block"></div>
                                            <StatItem icon="bathtub" value={property.baths} label="Baths" />
                                            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 hidden sm:block"></div>
                                            <StatItem icon="square_foot" value={property.sqft.toLocaleString()} label="Sqft" />
                                            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 hidden sm:block"></div>
                                            <StatItem icon="calendar_month" value={property.built} label="Built" />
                                        </div>
                                    </div>

                                    <div className="border-b border-zinc-100 dark:border-white/5 pb-8">
                                        <h2 className="text-xl font-bold text-black dark:text-white mb-4">About This Home</h2>
                                        <p className={`text - zinc - 700 dark: text - zinc - 300 text - base leading - relaxed ${!showFullDesc ? 'line-clamp-3' : ''} `}>
                                            {property.description}
                                        </p>
                                        <button
                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                            className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                        >
                                            {showFullDesc ? 'Show Less' : 'Read More'}
                                            <span className="material-symbols-outlined text-[18px]">{showFullDesc ? 'expand_less' : 'expand_more'}</span>
                                        </button>
                                    </div>

                                    <div className="border-b border-zinc-100 dark:border-white/5 pb-8">
                                        <h2 className="text-xl font-bold text-black dark:text-white mb-4">Features & Amenities</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {property.features.map((feature, index) => (
                                                <Amenity key={index} icon="check_circle" label={feature} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Insights Section */}
                                <div className="glass-panel rounded-3xl p-8 bg-white dark:bg-black/40 border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-black dark:text-white mb-1 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-2xl filled text-blue-600 dark:text-blue-400">auto_awesome</span>
                                                AI-Powered Insights
                                            </h2>
                                            <p className="text-sm text-zinc-500">Intelligent analysis powered by Gemini</p>
                                        </div>
                                        <button onClick={fetchInsights} className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                            Refresh
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {isAiLoading ? (
                                            <SkeletonCards count={3} />
                                        ) : insights && (
                                            <>
                                                <AICard title="Investment Score" icon="trending_up" accent="green" gradient="from-green-400 via-emerald-500 to-teal-500">
                                                    <div>
                                                        <div className="text-4xl font-black text-black dark:text-white mb-2 text-glow">{insights.investment.score}/10</div>
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{insights.investment.rating}</p>
                                                        <p className="text-xs text-zinc-500 mt-2 leading-tight">{insights.investment.prediction}</p>
                                                    </div>
                                                </AICard>

                                                <AICard title="Neighborhood" icon="location_city" accent="purple" gradient="from-purple-400 via-pink-500 to-red-500">
                                                    <div>
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            {insights.neighborhood.tags.map(tag => (
                                                                <span key={tag} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-medium">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-zinc-500 leading-tight">{insights.neighborhood.description}</p>
                                                    </div>
                                                </AICard>

                                                <AICard title="Safety Score" icon="shield" accent="blue" gradient="from-blue-400 via-indigo-500 to-violet-500">
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="relative size-14 flex items-center justify-center">
                                                            <svg className="size-full -rotate-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" viewBox="0 0 36 36">
                                                                <path className="text-zinc-200 dark:text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                                                <path className="text-blue-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${insights.safety.score * 10}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                                                            </svg>
                                                            <span className="absolute text-lg font-bold text-black dark:text-white">{insights.safety.score}</span>
                                                        </div>
                                                        <div className="text-xs text-zinc-500 font-medium leading-tight">
                                                            {insights.safety.description}
                                                        </div>
                                                    </div>
                                                </AICard>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Location Map Section */}
                                <div className="glass-panel rounded-3xl p-8 mb-10 bg-white dark:bg-black/40 border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-xl">
                                    <h3 className="text-xl font-bold text-black dark:text-white mb-6">Location</h3>
                                    <div className="w-full h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden relative group ring-1 ring-black/5 dark:ring-white/10">
                                        {isLoaded && property.latitude && property.longitude ? (
                                            <GoogleMap
                                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                                center={{ lat: property.latitude, lng: property.longitude }}
                                                zoom={15}
                                                options={{
                                                    styles: mapStyles,
                                                    disableDefaultUI: true,
                                                    zoomControl: true,
                                                }}
                                            >
                                                <Marker position={{ lat: property.latitude, lng: property.longitude }} />
                                            </GoogleMap>
                                        ) : (
                                            <>
                                                <img className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300 grayscale hover:grayscale-0" alt="Map View" src={property.images.map} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-black/80 to-transparent pointer-events-none"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <button className="bg-white/90 dark:bg-white/10 backdrop-blur-md text-black dark:text-white border border-black/5 dark:border-white/20 px-6 py-3 rounded-full font-bold shadow-xl transform group-hover:scale-105 transition-all flex items-center gap-2 hover:bg-white hover:text-black">
                                                        <span className="material-symbols-outlined">map</span> Explore Area
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                        <div className="absolute bottom-4 left-4 flex gap-2">
                                            <div className="bg-white dark:bg-black/80 backdrop-blur text-xs text-black dark:text-zinc-300 px-3 py-1 rounded-full border border-black/5 dark:border-white/10 font-bold shadow-sm">
                                                Walk Score: <span className="text-blue-600 dark:text-white font-bold ml-1">98</span>
                                            </div>
                                            <div className="bg-white dark:bg-black/80 backdrop-blur text-xs text-black dark:text-zinc-300 px-3 py-1 rounded-full border border-black/5 dark:border-white/10 font-bold shadow-sm">
                                                Transit Score: <span className="text-blue-600 dark:text-white font-bold ml-1">100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Area */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-28 flex flex-col gap-6">
                                    {property.listing_type === 'rent' && (
                                        <RentalBooking property={property} />
                                    )}

                                    {/* Agent Card */}
                                    <AgentCard agent={property.agent} />

                                    {/* Payment Estimate */}
                                    <div className="glass-panel rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors bg-white/40 dark:bg-black/40 border-black/5 dark:border-white/10 shadow-sm">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Est. Payment</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-glow transition-all duration-300">${Math.round(property.price * 0.005).toLocaleString()}<span className="text-sm font-normal text-zinc-500 ml-1">/mo</span></p>
                                        </div>
                                        <div className="bg-blue-500/10 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">calculate</span>
                                        </div>
                                    </div>

                                    {/* Similar Homes */}
                                    <div className="mt-4">
                                        <h5 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">Similar Homes</h5>
                                        <div className="flex flex-col gap-3">
                                            <SimilarHomeItem price="$1,100,000" stats="2bd, 2ba • Mission" image={property.images.kitchen} />
                                            <SimilarHomeItem price="$1,450,000" stats="3bd, 2ba • Potrero" image={property.images.bedroom} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Sub-components ---

const Breadcrumbs: React.FC<{ neighborhood: string }> = ({ neighborhood }) => (
    <div className="flex flex-wrap gap-2 px-1 py-4 mb-2 items-center">
        <Link className="text-zinc-500 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors" to="/home">Home</Link>
        <span className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">/</span>
        <a className="text-zinc-500 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors" href="#">San Francisco</a>
        <span className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">/</span>
        <span className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{neighborhood.split(' ').slice(-2).join(' ')}</span>
    </div>
);

const Gallery: React.FC<{ images: any, panorama_images?: string[], onOpen360: () => void }> = ({ images, panorama_images, onOpen360 }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[300px] md:h-[500px] mb-10 rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-2xl relative bg-zinc-100 dark:bg-zinc-900">
        <div className="md:col-span-2 h-full w-full bg-center bg-no-repeat bg-cover relative group cursor-pointer" style={{ backgroundImage: `url(${images.living})` }}>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
            {panorama_images && panorama_images.length > 0 && (
                <div className="absolute top-4 left-4 z-20">
                    <LiquidGlass
                        variant="clear"
                        onClick={() => onOpen360()}
                        className="!p-0 !bg-black/20 dark:!bg-black/50 backdrop-blur-md border border-white/20 hover:!bg-white/40 transition-all !rounded-full shadow-xl"
                    >
                        <div className="px-5 py-2.5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-white text-xl">360</span>
                            <span className="text-white text-sm font-bold uppercase tracking-wider">360° View</span>
                        </div>
                    </LiquidGlass>
                </div>
            )}
        </div>
        <div className="hidden md:flex flex-col gap-3 h-full">
            <div className="h-1/2 w-full bg-center bg-no-repeat bg-cover relative group cursor-pointer" style={{ backgroundImage: `url(${images.kitchen})` }}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
            </div>
            <div className="h-1/2 w-full bg-center bg-no-repeat bg-cover relative group cursor-pointer" style={{ backgroundImage: `url(${images.bedroom})` }}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
            </div>
        </div>
        <div className="hidden md:flex flex-col gap-3 h-full">
            <div className="h-1/2 w-full bg-center bg-no-repeat bg-cover relative group cursor-pointer" style={{ backgroundImage: `url(${images.bathroom})` }}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
                <div className="absolute inset-y-0 right-2 flex items-center z-20">
                    <button className="bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-sm text-zinc-900 dark:text-white p-2 rounded-full border border-white/20 dark:border-white/10 transition-all shadow-md">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            <div className="h-1/2 w-full bg-center bg-no-repeat bg-cover relative group cursor-pointer" style={{ backgroundImage: `url(${images.balcony})` }}>
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40 group-hover:bg-black/30 dark:group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white font-semibold flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all shadow-lg">
                        <span className="material-symbols-outlined">grid_view</span> View All Photos
                    </span>
                </div>
            </div>
        </div>
    </div>
);

const StatItem: React.FC<{ icon: string, value: string | number, label: string }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500 text-2xl">{icon}</span>
        <span className="font-bold text-zinc-900 dark:text-white text-xl">{value} <span className="font-normal text-zinc-500 text-base ml-1">{label}</span></span>
    </div>
);

const Amenity: React.FC<{ icon: string, label: string }> = ({ icon, label }) => (
    <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
        <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">{icon}</span>
        {label}
    </div>
);

const AICard: React.FC<{ title: string, icon: string, accent: string, gradient: string, children: React.ReactNode }> = ({ title, icon, accent, gradient, children }) => (
    <div className="group relative rounded-3xl ai-card-glow">
        <div className={`absolute inset - 0 rounded - 3xl bg - gradient - to - br ${gradient} opacity - 40 dark: opacity - 60 group - hover: opacity - 80 dark: group - hover: opacity - 100 transition - opacity`}></div>
        <div className="relative h-full m-[1px] bg-white/90 dark:bg-zinc-900 rounded-[23px] p-6 flex flex-col justify-between overflow-hidden">
            <div className={`absolute top - 0 right - 0 w - 24 h - 24 bg - ${accent} -500 / 10 blur - 2xl - mr - 6 - mt - 6`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{title}</span>
                <span className={`material - symbols - outlined text - ${accent} -500 dark: text - ${accent} -400`}>{icon}</span>
            </div>
            {children}
        </div>
    </div>
);

const AgentCard: React.FC<{ agent: any }> = ({ agent }) => (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-white/40 dark:bg-black/40 border-black/5 dark:border-white/10 shadow-sm dark:shadow-xl backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="size-16 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/20 shadow-lg ring-2 ring-black/5 dark:ring-white/5">
                <img className="w-full h-full object-cover" alt={agent.name} src={agent.image} />
            </div>
            <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{agent.name}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Senior Agent, Mabiti</p>
                <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-yellow-500 dark:text-yellow-400 text-[16px] filled">star</span>)}
                    <span className="material-symbols-outlined text-yellow-500 dark:text-yellow-400 text-[16px] filled">star_half</span>
                    <span className="text-xs text-zinc-500 ml-1 font-medium">(48 reviews)</span>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-3 relative z-10">
            <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-primary hover:bg-blue-600 text-white font-bold tracking-tight transition-all shadow-lg dark:shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]">
                Schedule a Tour
            </button>
            <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold tracking-tight transition-colors">
                Contact Agent
            </button>
        </div>
    </div>
);

const RentalBooking: React.FC<{ property: Property }> = ({ property }) => {
    const [days, setDays] = useState(1);
    const [pricePerDay, setPricePerDay] = useState(Math.round(property.price / 30));
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const totalPrice = days * pricePerDay;

    const handleRent = async () => {
        setIsLoading(true);
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + days);

            await rentalService.create({
                property: property.id,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                days: days,
                total_price: totalPrice
            });
            alert('Rental successful!');
            navigate('/my-rentals');
        } catch (error) {
            console.error('Error creating rental:', error);
            alert('Failed to create rental. Please log in first.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 border-black/5 dark:border-white/10 shadow-xl backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-6">Rent this Home</h3>

            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Number of Days</label>
                    <input
                        type="number"
                        min="1"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                        className="glass-input w-full rounded-xl p-3 bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/10 text-black dark:text-white"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Price per Day ($)</label>
                    <input
                        type="number"
                        min="1"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(parseInt(e.target.value) || 1)}
                        className="glass-input w-full rounded-xl p-3 bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/10 text-black dark:text-white"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-black/5 dark:border-white/5">
                <span className="text-zinc-500 font-medium">Total Price</span>
                <span className="text-2xl font-bold text-black dark:text-white">${totalPrice.toLocaleString()}</span>
            </div>

            <button
                onClick={handleRent}
                disabled={isLoading}
                className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-green-600 hover:bg-green-700 text-white font-bold tracking-tight transition-all shadow-lg disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : 'Rent Now'}
            </button>
        </div>
    );
};

const SimilarHomeItem: React.FC<{ price: string, stats: string, image: string }> = ({ price, stats, image }) => (
    <div className="glass-panel p-3 rounded-xl flex gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group bg-white/40 dark:bg-black/40 border-black/5 dark:border-white/10 shadow-sm">
        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={image} alt="Home" />
        </div>
        <div className="flex flex-col justify-center">
            <p className="text-zinc-900 dark:text-white font-bold text-sm">{price}</p>
            <p className="text-zinc-500 text-xs">{stats}</p>
        </div>
    </div>
);

const SkeletonCards: React.FC<{ count: number }> = ({ count }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse glass-panel rounded-3xl p-6 h-48 bg-zinc-900/50 flex flex-col justify-between">
                <div className="flex justify-between">
                    <div className="h-4 w-20 bg-zinc-800 rounded"></div>
                    <div className="h-6 w-6 bg-zinc-800 rounded-full"></div>
                </div>
                <div className="h-8 w-3/4 bg-zinc-800 rounded"></div>
                <div className="h-3 w-full bg-zinc-800 rounded"></div>
            </div>
        ))}
    </>
);
