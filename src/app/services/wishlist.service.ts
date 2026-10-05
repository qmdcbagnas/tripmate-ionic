import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface WishlistItem {
  id: string;
  user_id?: string;
  property_id: string;
  property?: any;
  created_at?: string;
}

const MOCK_WISHLIST_KEY = 'tripmate_mock_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  private getMockWishlist(): WishlistItem[] {
    try { return JSON.parse(localStorage.getItem(MOCK_WISHLIST_KEY) || '[]'); }
    catch { return []; }
  }

  private saveMockWishlist(items: WishlistItem[]) {
    localStorage.setItem(MOCK_WISHLIST_KEY, JSON.stringify(items));
  }

  async getWishlist(): Promise<WishlistItem[]> {
    if (environment.USE_MOCK_DATA) return this.getMockWishlist();

    const user = this.auth.getCurrentUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('wishlists')
      .select('*, property:properties(id, name, location, price_per_night, images, average_rating)')
      .eq('user_id', user.id);

    if (error) { console.error('WishlistService.getWishlist:', error); return []; }
    return data ?? [];
  }

  async addToWishlist(propertyId: string): Promise<void> {
    if (environment.USE_MOCK_DATA) {
      const items = this.getMockWishlist();
      const already = items.some(i => i.property_id === propertyId);
      if (!already) {
        items.push({ id: 'wl-' + Date.now(), property_id: propertyId, created_at: new Date().toISOString() });
        this.saveMockWishlist(items);
      }
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Must be logged in to save to wishlist.');

    const { error } = await this.supabase
      .from('wishlists')
      .insert({ user_id: user.id, property_id: propertyId });

    if (error && !error.message.includes('duplicate')) throw new Error(error.message);
  }

  async removeFromWishlist(propertyId: string): Promise<void> {
    if (environment.USE_MOCK_DATA) {
      this.saveMockWishlist(this.getMockWishlist().filter(i => i.property_id !== propertyId));
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) return;

    const { error } = await this.supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);

    if (error) throw new Error(error.message);
  }

  async isInWishlist(propertyId: string): Promise<boolean> {
    if (environment.USE_MOCK_DATA) {
      return this.getMockWishlist().some(i => i.property_id === propertyId);
    }

    const user = this.auth.getCurrentUser();
    if (!user) return false;

    const { data } = await this.supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single();

    return !!data;
  }
}
