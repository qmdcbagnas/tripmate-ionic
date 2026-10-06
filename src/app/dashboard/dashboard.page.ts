import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton, IonBackButton } from '@ionic/angular';
import { AuthService, AppUser } from '../services/auth.service';
import { BookingsService, Booking } from '../services/bookings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    RouterLinkActive,
    AuthButtonsComponent,RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton, IonBackButton]
})
export class DashboardPage implements OnInit {
  user: AppUser | null = null;
  initials: string = '';

  allBookings: Booking[] = [];
  currentFilter: string = 'upcoming';

  categories: { [key: string]: Booking[] } = {
    upcoming: [], past: [], pending: [], cancelled: []
  };

  userDropdownOpen = false;
  sidebarOpen = false;
  isLoading = true;

  constructor(private auth: AuthService, private bookingsService: BookingsService, private router: Router) {}

  async ngOnInit() {
    
    if (!this.user) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'dashboard' } });
      return;
    }

    this.auth.currentUser$.subscribe(async (u) => {
      if (u === 'loading') return;
      this.user = (u as any) as AppUser | null;
      if (u) {
        this.initials = ((u as any)?.full_name || 'Guest').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        await this.loadBookings();
      }
    });
  }

  async loadBookings() {
    this.isLoading = true;
    try {
      this.allBookings = await this.bookingsService.getUserBookings();
      this.categorizeBookings();
    } catch (e) {
      console.error('loadBookings error:', e);
    } finally {
      this.isLoading = false;
    }
  }

  categorizeBookings() {
    const now = new Date();
    this.categories = { upcoming: [], past: [], pending: [], cancelled: [] };

    this.allBookings.forEach(booking => {
      const checkout = new Date(booking.check_out);
      if (booking.status === 'cancelled') {
        this.categories['cancelled'].push(booking);
      } else if (booking.status === 'pending') {
        this.categories['pending'].push(booking);
      } else if (!isNaN(checkout.getTime()) && checkout < now) {
        this.categories['past'].push(booking);
      } else {
        this.categories['upcoming'].push(booking);
      }
    });
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.sidebarOpen = false;
  }

  getFilterTitle() {
    const titles: any = {
      upcoming: 'Upcoming Trips',
      past: 'Past Trips',
      pending: 'Pending Requests',
      cancelled: 'Cancelled Trips'
    };
    return titles[this.currentFilter] || '';
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    await this.bookingsService.cancelBooking(bookingId);
    await this.loadBookings();
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() { this.userDropdownOpen = false; }
  peso(n: number) { return "?" + Math.round(Number(n) || 0).toLocaleString("en-PH"); }
  writeReview(bookingId: string) { alert("Reviews coming soon!"); }



  async logout(event: Event) {
    event.preventDefault();
    await this.auth.signOut();
  }
}












