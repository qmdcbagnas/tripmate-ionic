import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class DashboardPage implements OnInit {
  user: any = null;
  initials: string = '';
  
  allBookingsRaw: any[] = [];
  myBookings: any[] = [];
  currentFilter: string = 'upcoming';

  categories: { [key: string]: any[] } = {
    upcoming: [],
    past: [],
    pending: [],
    cancelled: []
  };

  userDropdownOpen = false;
  sidebarOpen = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkAuth();
    this.loadBookings();
  }

  checkAuth() {
    try {
      this.user = JSON.parse(localStorage.getItem('tripmate_user') || 'null');
    } catch {
      this.user = null;
    }
    
    if (!this.user || !localStorage.getItem('tripmate_session')) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'dashboard' } });
      return;
    }

    this.initials = (this.user.name || 'Guest').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  readAllBookings() {
    try {
      const parsed = JSON.parse(localStorage.getItem('tripmate_bookings') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  loadBookings() {
    if (!this.user) return;
    this.allBookingsRaw = this.readAllBookings();
    this.myBookings = this.allBookingsRaw.filter(b => b.userId === this.user.id);
    this.categorizeBookings();
  }

  categorizeBookings() {
    const now = new Date();
    this.categories = { upcoming: [], past: [], pending: [], cancelled: [] };

    this.myBookings.forEach(booking => {
      const checkout = new Date(booking.checkout);

      if (booking.status === "cancelled") {
        this.categories['cancelled'].push(booking);
      } else if (booking.status === "pending") {
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
      upcoming: "Upcoming Trips",
      past: "Past Trips",
      pending: "Pending Requests",
      cancelled: "Cancelled Trips"
    };
    return titles[this.currentFilter] || "";
  }

  peso(n: number) {
    return "₱" + Math.round(Number(n) || 0).toLocaleString("en-PH");
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
  }

  cancelBooking(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    const fullBookings = this.readAllBookings();
    const index = fullBookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      fullBookings[index].status = "cancelled";
      fullBookings[index].cancelledAt = new Date().toISOString();
      localStorage.setItem('tripmate_bookings', JSON.stringify(fullBookings));
    }
    this.loadBookings();
  }

  writeReview(bookingId: string) {
    const rating = Number(prompt("Rate your stay from 1 to 5:", "5"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    const comment = prompt("Write a short review:", "Great stay!") || "";
    alert("Review submitted. Thank you!");
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  logout(event: Event) {
    event.preventDefault();
    localStorage.removeItem('tripmate_user');
    localStorage.removeItem('tripmate_session');
    this.router.navigate(['/homepage']);
  }
}


