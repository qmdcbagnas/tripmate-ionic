import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

export interface Property {
  id: string;
  host_id?: string;
  name: string;
  description?: string;
  price_per_night: number;
  location?: string;
  city?: string;
  province?: string;
  images?: string[];
  property_type?: string;
  amenities?: string[];
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  average_rating?: number;
  total_reviews?: number;
  is_active?: boolean;
}

// ── Placeholder data used when USE_MOCK_DATA = true ───────────────────────────
const MOCK_PROPERTIES: Property[] = [
  {
    id: 'mock-1',
    host_id: 'host-1',
    name: 'Batan Island Villa',
    description: 'Breathtaking cliffside villa overlooking the Pacific Ocean in Batanes.',
    price_per_night: 2500,
    location: 'Basco, Batanes',
    city: 'Basco',
    province: 'Batanes',
    images: ['assets/images/batanes.jpg'],
    property_type: 'villa',
    amenities: ['WiFi', 'Kitchen', 'Ocean View', 'Air Conditioning'],
    max_guests: 4, bedrooms: 2, bathrooms: 1,
    average_rating: 4.9, total_reviews: 24,
  },
  {
    id: 'mock-2',
    host_id: 'host-1',
    name: 'Siargao Surf House',
    description: 'Steps from Cloud 9, perfect for surfers and beach lovers.',
    price_per_night: 1800,
    location: 'General Luna, Siargao',
    city: 'General Luna',
    province: 'Surigao del Norte',
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'],
    property_type: 'house',
    amenities: ['WiFi', 'Surfboard Rental', 'Pool', 'Beach Access'],
    max_guests: 6, bedrooms: 3, bathrooms: 2,
    average_rating: 4.7, total_reviews: 61,
  },
  {
    id: 'mock-3',
    host_id: 'host-2',
    name: 'Palawan Overwater Cottage',
    description: 'Private overwater cottage in El Nido with crystal-clear lagoon views.',
    price_per_night: 3800,
    location: 'El Nido, Palawan',
    city: 'El Nido',
    province: 'Palawan',
    images: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=800&auto=format&fit=crop'],
    property_type: 'resort',
    amenities: ['WiFi', 'Kayak', 'Breakfast Included', 'Snorkeling Gear'],
    max_guests: 2, bedrooms: 1, bathrooms: 1,
    average_rating: 5.0, total_reviews: 18,
  },
  {
    id: 'mock-4',
    host_id: 'host-2',
    name: 'Baguio Pine Forest Cabin',
    description: 'Cozy mountain cabin surrounded by towering pine trees in Baguio.',
    price_per_night: 1200,
    location: 'Camp John Hay, Baguio',
    city: 'Baguio City',
    province: 'Benguet',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop'],
    property_type: 'cabin',
    amenities: ['Fireplace', 'Kitchen', 'Parking', 'Garden'],
    max_guests: 4, bedrooms: 2, bathrooms: 1,
    average_rating: 4.6, total_reviews: 43,
  },
  {
    id: 'mock-5',
    host_id: 'host-3',
    name: 'Boracay Beach Studio',
    description: 'Modern studio steps from White Beach, Station 2.',
    price_per_night: 2200,
    location: 'White Beach, Boracay',
    city: 'Malay',
    province: 'Aklan',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop'],
    property_type: 'apartment',
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Air Conditioning'],
    max_guests: 2, bedrooms: 1, bathrooms: 1,
    average_rating: 4.5, total_reviews: 89,
  },
  {
    id: 'mock-6',
    host_id: 'host-3',
    name: 'Cebu Heritage House',
    description: 'Charming ancestral house in the heart of historic Cebu City.',
    price_per_night: 1500,
    location: 'Downtown, Cebu City',
    city: 'Cebu City',
    province: 'Cebu',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop'],
    property_type: 'house',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Air Conditioning'],
    max_guests: 5, bedrooms: 3, bathrooms: 2,
    average_rating: 4.4, total_reviews: 37,
  },
];

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  constructor(private supabase: SupabaseService) {}

  async getAllProperties(): Promise<Property[]> {
    if (environment.USE_MOCK_DATA) return MOCK_PROPERTIES;

    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) { console.error('PropertiesService.getAll:', error); return MOCK_PROPERTIES; }
    return data ?? [];
  }

  async getPropertyById(id: string): Promise<Property | null> {
    if (environment.USE_MOCK_DATA) return MOCK_PROPERTIES.find(p => p.id === id) ?? null;

    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) { console.error('PropertiesService.getById:', error); return null; }
    return data;
  }

  async searchProperties(query: string, filters?: {
    property_type?: string;
    min_price?: number;
    max_price?: number;
    city?: string;
  }): Promise<Property[]> {
    if (environment.USE_MOCK_DATA) {
      let results = MOCK_PROPERTIES;
      if (query) {
        const q = query.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.province?.toLowerCase().includes(q)
        );
      }
      if (filters?.property_type && filters.property_type !== 'all') {
        results = results.filter(p => p.property_type === filters.property_type);
      }
      if (filters?.min_price !== undefined) {
        results = results.filter(p => p.price_per_night >= filters.min_price!);
      }
      if (filters?.max_price !== undefined) {
        results = results.filter(p => p.price_per_night <= filters.max_price!);
      }
      return results;
    }

    let q = this.supabase.from('properties').select('*').eq('is_active', true);

    if (query) {
      q = q.or(`name.ilike.%${query}%,location.ilike.%${query}%,city.ilike.%${query}%,province.ilike.%${query}%`);
    }
    if (filters?.property_type && filters.property_type !== 'all') {
      q = q.eq('property_type', filters.property_type);
    }
    if (filters?.min_price !== undefined) q = q.gte('price_per_night', filters.min_price);
    if (filters?.max_price !== undefined) q = q.lte('price_per_night', filters.max_price);

    const { data, error } = await q.order('average_rating', { ascending: false });
    if (error) { console.error('PropertiesService.search:', error); return MOCK_PROPERTIES; }
    return data ?? [];
  }

  async createProperty(property: Partial<Property>): Promise<Property | null> {
    if (environment.USE_MOCK_DATA) {
      const newProp: Property = {
        ...property as Property,
        id: 'mock-' + Date.now(),
      };
      MOCK_PROPERTIES.push(newProp);
      return newProp;
    }

    const { data, error } = await this.supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) { console.error('PropertiesService.create:', error); return null; }
    return data;
  }
}
