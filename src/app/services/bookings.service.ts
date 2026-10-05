import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Booking {
  id: string;
  guest_id?: string;
  property_id: string;
  property?: any;
  check_in: string;
  check_out: string;
  total_price: number;
  num_guests?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
}

const MOCK_BOOKINGS_KEY = 'tripmate_mock_bookings';

const MOCK_BOOKINGS_SEED: Booking[] = [
  {
    id: 'bk-1',
    guest_id: 'demo-guest',
    property_id: 'mock-1',
    property: {
      name: 'Batan Island Villa',
      location: 'Basco, Batanes',
      images: ['assets/images/batanes.jpg'],
    },
    check_in: '2025-12-20',
    check_out: '2025-12-25',
    total_price: 12500,
    num_guests: 2,
    status: 'confirmed',
    created_at: new Date().toISOString(),
  },
  {
    id: 'bk-2',
    guest_id: 'demo-guest',
    property_id: 'mock-2',
    property: {
      name: 'Siargao Surf House',
      location: 'General Luna, Siargao',
      images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'],
    },
    check_in: '2025-10-10',
    check_out: '2025-10-15',
    total_price: 9000,
    num_guests: 3,
    status: 'completed',
    created_at: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class BookingsService {
  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  private getMockBookings(): Booking[] {
    try { return JSON.parse(localStorage.getItem(MOCK_BOOKINGS_KEY) || 'null') ?? MOCK_BOOKINGS_SEED; }
    catch { return MOCK_BOOKINGS_SEED; }
  }

  private saveMockBookings(bookings: Booking[]) {
    localStorage.setItem(MOCK_BOOKINGS_KEY, JSON.stringify(bookings));
  }

  async getUserBookings(): Promise<Booking[]> {
    if (environment.USE_MOCK_DATA) return this.getMockBookings();

    const user = this.auth.getCurrentUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('bookings')
      .select('*, property:properties(name, location, images)')
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false });

    if (error) { console.error('BookingsService.getUserBookings:', error); return this.getMockBookings(); }
    return data ?? [];
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking | null> {
    if (environment.USE_MOCK_DATA) {
      const newBooking: Booking = {
        ...booking as Booking,
        id: 'bk-' + Date.now(),
        status: (booking.status || 'pending') as any,
        created_at: new Date().toISOString(),
      };
      const bookings = this.getMockBookings();
      bookings.push(newBooking);
      this.saveMockBookings(bookings);
      return newBooking;
    }

    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('You must be logged in to make a booking.');

    const { data, error } = await this.supabase
      .from('bookings')
      .insert({ ...booking, guest_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    if (environment.USE_MOCK_DATA) {
      const bookings = this.getMockBookings();
      const b = bookings.find(b => b.id === bookingId);
      if (b) b.status = 'cancelled';
      this.saveMockBookings(bookings);
      return;
    }

    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) throw new Error(error.message);
  }
}

