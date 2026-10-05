import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular';
import { AuthService, AppUser } from '../services/auth.service';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { PropertiesService, Property } from '../services/properties.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class WishlistPage implements OnInit {
  user: AppUser | null = null;
  initials = '';
  wishlist: WishlistItem[] = [];
  propertiesMap: Record<string, Property> = {};
  currentSort = 'recent';
  currentView = 'grid';
  userDropdownOpen = false;
  isLoading = true;

  constructor(
    private auth: AuthService,
    private wishlistService: WishlistService,
    private propertiesService: PropertiesService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'wishlist' } });
      return;
    }
    this.initials = (this.user.full_name || 'Guest')
      .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    await this.loadWishlist();
  }

  async loadWishlist() {
    this.isLoading = true;
    try {
      // Load all properties to build a lookup map
      const allProps = await this.propertiesService.getAllProperties();
      this.propertiesMap = {};
      allProps.forEach(p => { this.propertiesMap[p.id] = p; });

      this.wishlist = await this.wishlistService.getWishlist();
      this.sortWishlist();
    } catch (e) {
      console.error('loadWishlist error:', e);
    } finally {
      this.isLoading = false;
    }
  }

  getProperty(propertyId: string): Property | null {
    return this.propertiesMap[propertyId] ?? null;
  }

  sortWishlist() {
    this.wishlist.sort((a, b) => {
      const pA = this.propertiesMap[a.property_id];
      const pB = this.propertiesMap[b.property_id];
      if (!pA || !pB) return 0;
      if (this.currentSort === 'price-asc') return (pA.price_per_night) - (pB.price_per_night);
      if (this.currentSort === 'price-desc') return (pB.price_per_night) - (pA.price_per_night);
      if (this.currentSort === 'rating') return (pB.average_rating ?? 0) - (pA.average_rating ?? 0);
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
  }

  onSortChange() { this.sortWishlist(); }
  setView(view: string) { this.currentView = view; }

  async removeFromWishlist(propertyId: string) {
    await this.wishlistService.removeFromWishlist(propertyId);
    this.wishlist = this.wishlist.filter(w => w.property_id !== propertyId);
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() { this.userDropdownOpen = false; }

  async logout(event: Event) {
    event.preventDefault();
    await this.auth.signOut();
  }
}
