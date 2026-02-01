import React, { useState } from 'react';
import { Header } from '../components/Header';
import { DottedSurface } from '../components/DottedSurface';
import { propertyService } from '../services/propertyService';
import { LiquidGlassFilters } from '../components/LiquidGlass';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';

interface PropertyData {
    propertyType: string;
    listingType: string;
    title: string;
    description: string;
    price: string;
    address: string;
    city: string;
    zipCode: string;
    beds: string;
    baths: string;
    sqft: string;
    lotSize: string;
    yearBuilt: string;
    floors: string;
    parking: string;
    features: string[];
    images: File[];
    documents: File[];
    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

export const SellPage: React.FC = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<PropertyData>({
        propertyType: '',
        listingType: 'sale',
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        zipCode: '',
        beds: '',
        baths: '',
        sqft: '',
        lotSize: '',
        yearBuilt: '',
        floors: '',
        parking: '',
        features: [],
        images: [],
        documents: [],
        contactName: user?.username || '',
        contactEmail: user?.email || '',
        contactPhone: '',
    });
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const propertyTypes = [
        { id: 'house', name: 'House', icon: 'home' },
        { id: 'apartment', name: 'Apartment', icon: 'apartment' },
        { id: 'condo', name: 'Condo', icon: 'domain' },
        { id: 'land', name: 'Land', icon: 'landscape' },
        { id: 'commercial', name: 'Commercial', icon: 'business' },
        { id: 'villa', name: 'Villa', icon: 'villa' },
    ];

    const availableFeatures = [
        'Swimming Pool', 'Gym', 'Garden', 'Garage', 'Balcony', 'Terrace',
        'Fireplace', 'Air Conditioning', 'Heating', 'Security System',
        'Elevator', 'Storage', 'Pet Friendly', 'Furnished', 'Smart Home',
        'Solar Panels', 'Walk-in Closet', 'Laundry Room'
    ];

    const steps = [
        { number: 1, title: 'Property Type', icon: 'home_work' },
        { number: 2, title: 'Property Details', icon: 'description' },
        { number: 3, title: 'Media Upload', icon: 'photo_library' },
        { number: 4, title: 'Contact Info', icon: 'contact_phone' },
    ];

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));

        files.forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
        setDocumentPreviews(prev => [...prev, ...files.map((f: File) => f.name)]);
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeDocument = (index: number) => {
        setDocumentPreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const propertyPayload = {
                title: formData.title,
                address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
                price: parseFloat(formData.price),
                beds: parseInt(formData.beds) || 0,
                baths: parseFloat(formData.baths) || 0,
                sqft: parseInt(formData.sqft) || 0,
                built: parseInt(formData.yearBuilt) || new Date().getFullYear(),
                description: formData.description,
                images: {
                    hero: imagePreviews[0] || '',
                    living: imagePreviews[1] || imagePreviews[0] || '',
                    kitchen: imagePreviews[2] || imagePreviews[0] || '',
                    bedroom: imagePreviews[3] || imagePreviews[0] || '',
                    bathroom: imagePreviews[4] || imagePreviews[0] || '',
                    balcony: imagePreviews[5] || imagePreviews[0] || '',
                    map: '/Images/map.png' // Placeholder map
                },
                agent: {
                    name: formData.contactName,
                    image: '/Images/agent1.jpg' // Placeholder agent image
                },
                neighborhood: formData.city || 'Unknown Neighborhood',
                features: formData.features,
                is_visible: true
            };

            await propertyService.create(propertyPayload);

            setIsSubmitting(false);
            alert('🎉 Property submitted successfully! It is now live in the store.');

            // Reset form
            setCurrentStep(1);
            setFormData({
                propertyType: '',
                listingType: 'sale',
                title: '',
                description: '',
                price: '',
                address: '',
                city: '',
                zipCode: '',
                beds: '',
                baths: '',
                sqft: '',
                lotSize: '',
                yearBuilt: '',
                floors: '',
                parking: '',
                features: [],
                images: [],
                documents: [],
                contactName: '',
                contactEmail: '',
                contactPhone: '',
            });
            setImagePreviews([]);
            setDocumentPreviews([]);
        } catch (error) {
            console.error('Failed to submit property:', error);
            setIsSubmitting(false);
            alert('❌ Failed to submit property. Please check your connection and try again.');
        }
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return formData.propertyType !== '';
            case 2:
                return formData.title && formData.description && formData.price && formData.address;
            case 3:
                return imagePreviews.length > 0;
            case 4:
                return formData.contactName && formData.contactEmail && formData.contactPhone;
            default:
                return false;
        }
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-500 overflow-hidden">
            <LiquidGlassFilters />
            <DottedSurface />
            <Header />

            <main className="flex-1 px-4 md:px-8 lg:px-12 xl:px-16 pt-24 pb-16 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                            List Your Property
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                            Follow our simple steps to list your property with professional presentation
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-6 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 -z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                ></div>
                            </div>

                            {steps.map((step) => (
                                <div key={step.number} className="flex flex-col items-center flex-1">
                                    <div
                                        className={`size-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step.number
                                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-400 border-2 border-zinc-200 dark:border-zinc-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[24px]">{step.icon}</span>
                                    </div>
                                    <p className={`mt-2 text-xs md:text-sm font-semibold text-center ${currentStep >= step.number ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                                        }`}>
                                        {step.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 dark:border-white/10 shadow-2xl">
                        {/* Step 1: Property Type */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Select Property Type
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {propertyTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleInputChange('propertyType', type.id)}
                                            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${formData.propertyType === type.id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10 scale-105 shadow-lg'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:scale-105'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[48px] text-blue-600 dark:text-blue-400 mb-2">
                                                {type.icon}
                                            </span>
                                            <p className="font-semibold text-zinc-900 dark:text-white">{type.name}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                        Listing Type
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleInputChange('listingType', 'sale')}
                                            className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 ${formData.listingType === 'sale'
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            For Sale
                                        </button>
                                        <button
                                            onClick={() => handleInputChange('listingType', 'rent')}
                                            className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 ${formData.listingType === 'rent'
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            For Rent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Property Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Property Details
                                </h2>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                        Property Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., Modern Downtown Apartment with City Views"
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe your property in detail..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Price * ({formData.listingType === 'rent' ? 'per month' : 'total'})
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange('price', e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Square Footage
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.sqft}
                                            onChange={(e) => handleInputChange('sqft', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="123 Main Street"
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            placeholder="San Francisco"
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                            placeholder="94103"
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {formData.propertyType !== 'land' && (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Bedrooms
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.beds}
                                                    onChange={(e) => handleInputChange('beds', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Bathrooms
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.baths}
                                                    onChange={(e) => handleInputChange('baths', e.target.value)}
                                                    placeholder="0"
                                                    step="0.5"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Floors
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.floors}
                                                    onChange={(e) => handleInputChange('floors', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Parking
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.parking}
                                                    onChange={(e) => handleInputChange('parking', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Year Built
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.yearBuilt}
                                                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                                                    placeholder="2020"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Lot Size (sq ft)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.lotSize}
                                                    onChange={(e) => handleInputChange('lotSize', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                        Features & Amenities
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availableFeatures.map((feature) => (
                                            <button
                                                key={feature}
                                                onClick={() => toggleFeature(feature)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${formData.features.includes(feature)
                                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {feature}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Media Upload */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Upload Photos & Documents
                                </h2>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                        Property Photos * (Min 1, Max 20)
                                    </label>
                                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <span className="material-symbols-outlined text-[64px] text-blue-600 dark:text-blue-400 mb-4 block">
                                                add_photo_alternate
                                            </span>
                                            <p className="text-zinc-700 dark:text-zinc-300 font-semibold mb-2">
                                                Click to upload images
                                            </p>
                                            <p className="text-zinc-500 text-sm">
                                                PNG, JPG, WEBP up to 10MB each
                                            </p>
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-xl"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                    {index === 0 && (
                                                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-lg font-semibold">
                                                            Main Photo
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                        Documents (Optional)
                                        <span className="text-xs font-normal text-zinc-500 ml-2">
                                            Floor plans, deeds, certificates, etc.
                                        </span>
                                    </label>
                                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            multiple
                                            onChange={handleDocumentUpload}
                                            className="hidden"
                                            id="document-upload"
                                        />
                                        <label htmlFor="document-upload" className="cursor-pointer">
                                            <span className="material-symbols-outlined text-[64px] text-purple-600 dark:text-purple-400 mb-4 block">
                                                upload_file
                                            </span>
                                            <p className="text-zinc-700 dark:text-zinc-300 font-semibold mb-2">
                                                Click to upload documents
                                            </p>
                                            <p className="text-zinc-500 text-sm">
                                                PDF, DOC, DOCX up to 5MB each
                                            </p>
                                        </label>
                                    </div>

                                    {/* Document Previews */}
                                    {documentPreviews.length > 0 && (
                                        <div className="space-y-2 mt-6">
                                            {documentPreviews.map((name, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                                                            description
                                                        </span>
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeDocument(index)}
                                                        className="size-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Contact Information */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Contact Information
                                </h2>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
                                            person
                                        </span>
                                        <input
                                            type="text"
                                            value={formData.contactName}
                                            onChange={(e) => handleInputChange('contactName', e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
                                            email
                                        </span>
                                        <input
                                            type="email"
                                            value={formData.contactEmail}
                                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                            placeholder="john.doe@example.com"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
                                            phone
                                        </span>
                                        <input
                                            type="tel"
                                            value={formData.contactPhone}
                                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">
                                        Listing Summary
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-blue-800 dark:text-blue-200">
                                            <span className="font-semibold">Type:</span> {propertyTypes.find(t => t.id === formData.propertyType)?.name}
                                        </p>
                                        <p className="text-blue-800 dark:text-blue-200">
                                            <span className="font-semibold">Title:</span> {formData.title}
                                        </p>
                                        <p className="text-blue-800 dark:text-blue-200">
                                            <span className="font-semibold">Price:</span> ${parseFloat(formData.price || '0').toLocaleString()}
                                            {formData.listingType === 'rent' && '/mo'}
                                        </p>
                                        <p className="text-blue-800 dark:text-blue-200">
                                            <span className="font-semibold">Photos:</span> {imagePreviews.length}
                                        </p>
                                        <p className="text-blue-800 dark:text-blue-200">
                                            <span className="font-semibold">Features:</span> {formData.features.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                                className="px-6 py-3 rounded-xl font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={!canProceedToNextStep()}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    Next Step
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canProceedToNextStep() || isSubmitting}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin material-symbols-outlined">refresh</span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Submit Listing
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};
