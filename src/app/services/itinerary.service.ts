import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Itinerary {
  id: string;
  user_id?: string;
  title: string;
  destination?: string;
  trip_start_date?: string;
  trip_end_date?: string;
  total_budget?: number;
  activities?: Activity[];
  created_at?: string;
}

export interface Activity {
  id: string;
  itinerary_id: string;
  day_number: number;
  activity_name: string;
  time?: string;
  location?: string;
  notes?: string;
}

const MOCK_ITINERARIES_KEY = 'tripmate_mock_itineraries';

const MOCK_ITINERARIES_SEED: Itinerary[] = [
  {
    id: 'itin-1',
    user_id: 'demo-guest',
    title: 'Batanes Adventure',
    destination: 'Batanes',
    trip_start_date: '2025-12-20',
    trip_end_date: '2025-12-25',
    total_budget: 15000,
    activities: [
      { id: 'act-1', itinerary_id: 'itin-1', day_number: 1, activity_name: 'Arrive at Basco Airport', time: '10:00 AM', location: 'Basco, Batanes', notes: 'Book Batanes Dugout shuttle' },
      { id: 'act-2', itinerary_id: 'itin-1', day_number: 1, activity_name: 'Check-in at Batan Island Villa', time: '01:00 PM', location: 'Basco', notes: '' },
      { id: 'act-3', itinerary_id: 'itin-1', day_number: 2, activity_name: 'Vayang Rolling Hills Sunrise', time: '05:30 AM', location: 'Vayang, Batan', notes: 'Bring jacket — very cold at dawn' },
      { id: 'act-4', itinerary_id: 'itin-1', day_number: 2, activity_name: 'Basco Lighthouse & Naidi Hills', time: '09:00 AM', location: 'Naidi, Basco', notes: '' },
    ],
    created_at: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  private getMockItineraries(): Itinerary[] {
    try { return JSON.parse(localStorage.getItem(MOCK_ITINERARIES_KEY) || 'null') ?? MOCK_ITINERARIES_SEED; }
    catch { return MOCK_ITINERARIES_SEED; }
  }

  private saveMockItineraries(data: Itinerary[]) {
    localStorage.setItem(MOCK_ITINERARIES_KEY, JSON.stringify(data));
  }

  async getUserItineraries(): Promise<Itinerary[]> {
    if (environment.USE_MOCK_DATA) return this.getMockItineraries();

    const user = this.auth.getCurrentUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('itineraries')
      .select('*, activities:itinerary_activities(*)')
      .eq('user_id', user.id)
      .order('trip_start_date', { ascending: true });

    if (error) { console.error('ItineraryService.getAll:', error); return this.getMockItineraries(); }
    return data ?? [];
  }

  async createItinerary(itinerary: Partial<Itinerary>): Promise<Itinerary | null> {
    if (environment.USE_MOCK_DATA) {
      const n: Itinerary = {
        id: 'itin-' + Date.now(),
        title: itinerary.title || 'New Trip',
        activities: [],
        ...itinerary,
        created_at: new Date().toISOString(),
      };
      const all = this.getMockItineraries();
      all.push(n);
      this.saveMockItineraries(all);
      return n;
    }

    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Must be logged in.');

    const { data, error } = await this.supabase
      .from('itineraries')
      .insert({ ...itinerary, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async addActivity(activity: Partial<Activity>): Promise<Activity | null> {
    if (environment.USE_MOCK_DATA) {
      const act: Activity = { id: 'act-' + Date.now(), ...activity as Activity };
      const all = this.getMockItineraries();
      const itin = all.find(i => i.id === activity.itinerary_id);
      if (itin) {
        if (!itin.activities) itin.activities = [];
        itin.activities.push(act);
        this.saveMockItineraries(all);
      }
      return act;
    }

    const { data, error } = await this.supabase
      .from('itinerary_activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteActivity(activityId: string): Promise<void> {
    if (environment.USE_MOCK_DATA) {
      const all = this.getMockItineraries();
      for (const itin of all) {
        if (itin.activities) {
          itin.activities = itin.activities.filter(a => a.id !== activityId);
        }
      }
      this.saveMockItineraries(all);
      return;
    }

    const { error } = await this.supabase
      .from('itinerary_activities')
      .delete()
      .eq('id', activityId);

    if (error) throw new Error(error.message);
  }

  async deleteItinerary(itineraryId: string): Promise<void> {
    if (environment.USE_MOCK_DATA) {
      const all = this.getMockItineraries().filter(i => i.id !== itineraryId);
      this.saveMockItineraries(all);
      return;
    }

    const { error } = await this.supabase
      .from('itineraries')
      .delete()
      .eq('id', itineraryId);

    if (error) throw new Error(error.message);
  }
}
