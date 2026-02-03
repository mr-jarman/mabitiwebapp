export interface PropertyStats {
  beds: number;
  baths: number;
  sqft: number;
  built: number;
  price: number;
  address: string;
}

export interface PropertyImages {
  hero: string;
  living: string;
  kitchen: string;
  bedroom: string;
  bathroom: string;
  balcony: string;
  map: string;
}

export interface PropertyAgent {
  name: string;
  image: string;
  phone: string;
  email: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  built: number;
  description: string;
  images: PropertyImages;
  agent: PropertyAgent;
  neighborhood: string;
  features: string[];
  panorama_images?: string[];
  listing_type: 'buy' | 'rent';
  has_online_lock: boolean;
}

export interface PropertiesData {
  properties: Property[];
}

export interface AIInsightsData {
  investment: {
    score: number;
    rating: string;
    prediction: string;
  };
  neighborhood: {
    tags: string[];
    description: string;
  };
  safety: {
    score: number;
    description: string;
  };
}

export interface Agent {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}
