import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class BookingPage implements OnInit {
  listing: any;
  
  checkIn: string = '';
  checkOut: string = '';
  guests: number = 2;
  
  promoCode: string | null = null;
  promoRate: number = 0;
  promoInput: string = '';
  promoError: string = '';
  showPromoForm: boolean = false;
  
  payMethod: string = 'qrph';
  currentStep: number = 1;
  highestUnlocked: number = 1;

  PROMO_CODES: any = { "TRIPMATE10": 0.10, "WELCOME05": 0.05 };

  guestForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    termsAccepted: false
  };
  formErrors: any = {};
  
  isPaying: boolean = false;
  bookingRef: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    const todayStr = new Date().toISOString().split("T")[0];
    const addDays = (dStr: string, days: number) => {
      const d = new Date(dStr + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    };
    
    this.checkIn = addDays(todayStr, 1);
    this.checkOut = addDays(this.checkIn, 3);
  }

  ngOnInit() {
    this.initListing();
    
    this.route.queryParams.subscribe(params => {
      if (params['checkin']) this.checkIn = params['checkin'];
      if (params['checkout']) this.checkOut = params['checkout'];
      if (params['guests']) this.guests = Number(params['guests']);
      
      const paymentState = params['payment'];
      if (paymentState) {
        this.resumePaymentReturn(paymentState, params['booking_id']);
      }
    });

    const currentUser = JSON.parse(localStorage.getItem("tripmate_user") || "null");
    if (currentUser) {
      const nameParts = (currentUser.name || "").trim().split(/\s+/);
      this.guestForm.firstName = nameParts.shift() || "";
      this.guestForm.lastName = nameParts.join(" ");
      this.guestForm.email = currentUser.email || "";
      this.guestForm.phone = (currentUser.phone || "").replace(/^\+63\s*/, "");
    }
  }

  initListing() {
    const storedStay = localStorage.getItem("selectedStay");
    const parsedStay = storedStay ? JSON.parse(storedStay) : null;

    this.listing = {
      id: parsedStay?.id || "pine-crest",
      name: parsedStay?.name || "Pine Crest Villa Retreat",
      location: parsedStay?.location || "Baguio City, Benguet, Luzon",
      rating: parsedStay?.rating || 4.92,
      reviews: parsedStay?.reviews || 128,
      img: parsedStay?.img || "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=800&auto=format&fit=crop",
      ratePerNight: parsedStay?.price || 4500,
      cleaningFee: 800,
      serviceFeeRate: 0.10,
      taxRate: 0.1125,
      maxGuests: parsedStay?.guests || 6
    };
    
    if (this.guests > this.listing.maxGuests) {
      this.guests = this.listing.maxGuests;
    }
  }

  get minCheckOut() {
    const d = new Date(this.checkIn + "T00:00:00");
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  
  get minCheckIn() {
    return new Date().toISOString().split("T")[0];
  }

  onCheckInChange() {
    if (this.checkOut <= this.checkIn) {
      this.checkOut = this.minCheckOut;
    }
  }

  nights() {
    const a = new Date(this.checkIn + "T00:00:00").getTime();
    const b = new Date(this.checkOut + "T00:00:00").getTime();
    const diff = Math.round((b - a) / 86400000);
    return diff > 0 ? diff : 1;
  }

  pricing() {
    const n = this.nights();
    const subtotal = this.listing.ratePerNight * n;
    const cleaning = this.listing.cleaningFee;
    const serviceFee = Math.round((subtotal + cleaning) * this.listing.serviceFeeRate);
    const taxes = Math.round(subtotal * this.listing.taxRate);
    const preDiscount = subtotal + cleaning + serviceFee + taxes;
    const discount = this.promoRate ? Math.round(preDiscount * this.promoRate) : 0;
    const total = preDiscount - discount;
    return { n, subtotal, cleaning, serviceFee, taxes, discount, total };
  }

  fmtDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-PH", { day: "numeric", month: "short" });
  }

  peso(n: number) {
    return "₱" + Math.round(n).toLocaleString("en-PH");
  }

  togglePromo() {
    this.showPromoForm = !this.showPromoForm;
  }

  applyPromo() {
    const code = this.promoInput.trim().toUpperCase();
    if (!code) {
      this.promoError = "Enter a code first.";
      return;
    }
    if (this.PROMO_CODES[code]) {
      this.promoCode = code;
      this.promoRate = this.PROMO_CODES[code];
      this.promoError = '';
    } else {
      this.promoError = "That code isn't valid.";
    }
  }

  removePromo() {
    this.promoCode = null;
    this.promoRate = 0;
  }

  setGuests(delta: number) {
    const next = this.guests + delta;
    if (next >= 1 && next <= this.listing.maxGuests) {
      this.guests = next;
    }
  }

  goToStep(step: number) {
    if (step <= this.highestUnlocked) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  validateDates() {
    if (new Date(this.checkOut) <= new Date(this.checkIn)) {
      alert("Please make sure your check-out date is after your check-in date.");
      return false;
    }
    return true;
  }

  toPayment() {
    if (!this.validateDates()) return;
    
    // Original js checked if listing id was a number and > 0, we can skip or adapt it
    const listingId = typeof this.listing.id === 'string' ? this.listing.id : Number(this.listing.id);
    if (!listingId || (typeof listingId === 'number' && listingId <= 0)) {
      alert("This stay is a demo listing. Choose a published Neon stay to continue.");
      return;
    }

    this.highestUnlocked = Math.max(this.highestUnlocked, 2);
    this.goToStep(2);
  }
  
  validateGuestForm() {
    let ok = true;
    this.formErrors = {};

    if (!this.guestForm.firstName.trim()) { this.formErrors.firstName = "Enter your first name."; ok = false; }
    if (!this.guestForm.lastName.trim()) { this.formErrors.lastName = "Enter your last name."; ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.guestForm.email.trim())) { this.formErrors.email = "Enter a valid email address."; ok = false; }
    
    const phoneDigits = this.guestForm.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) { this.formErrors.phone = "Enter a valid mobile number."; ok = false; }
    
    if (!this.guestForm.termsAccepted) { this.formErrors.terms = "Accept the booking terms to continue."; ok = false; }

    return ok;
  }

  async pay() {
    if (!this.validateGuestForm()) return;
    
    this.isPaying = true;
    
    setTimeout(() => {
      this.isPaying = false;
      this.completeBooking();
    }, 1100);
  }
  
  async completeBooking() {
    const currentUser = JSON.parse(localStorage.getItem("tripmate_user") || "null");
    if (!currentUser) {
      this.router.navigate(['/login'], { queryParams: { redirect: `booking?guests=${this.guests}` } });
      return;
    }
    
    const listingId = Number(this.listing.id);
    if (!Number.isInteger(listingId) || listingId <= 0) {
      alert("Choose a stay published from the Neon database before confirming payment.");
      return;
    }
    
    // Simulate API or skip
    this.bookingRef = "TM-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    this.highestUnlocked = 3;
    this.goToStep(3);
  }

  resumePaymentReturn(paymentState: string, bookingId: string) {
    if (paymentState === "cancelled") {
      alert("Payment was cancelled. Your booking was not confirmed.");
      return;
    }
    
    if (bookingId) {
      this.bookingRef = `TM-${String(bookingId).padStart(6, "0")}`;
      this.highestUnlocked = 3;
      this.goToStep(3);
    }
  }

  newBooking() {
    this.highestUnlocked = 1;
    this.currentStep = 1;
    this.promoCode = null;
    this.promoRate = 0;
    this.goToStep(1);
  }

  downloadCalendar() {
    const start = this.checkIn.replace(/-/g, "");
    const end = this.checkOut.replace(/-/g, "");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `UID:${this.bookingRef}@tripmate`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${this.listing.name}`, `LOCATION:${this.listing.location}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    link.download = `${this.bookingRef}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  
  async shareBooking() {
    const text = `${this.listing.name} - ${this.checkIn} to ${this.checkOut}`;
    if (navigator.share) await navigator.share({ title: "TripMate booking", text });
    else await navigator.clipboard?.writeText(text);
    alert("Booking details copied.");
  }
}


