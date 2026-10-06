import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton
} from '@ionic/angular';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],

  imports: [
    AuthButtonsComponent,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonMenuButton
  ]
})


export class BookingPage implements OnInit {

  /* =========================================================
     LISTING
  ========================================================= */

  listing: any = null;


  /* =========================================================
     BOOKING DETAILS
  ========================================================= */

  checkIn: string = '';
  checkOut: string = '';

  guests: number = 2;


  /* =========================================================
     PROMO
  ========================================================= */

  promoCode: string | null = null;

  promoRate: number = 0;

  promoInput: string = '';

  promoError: string = '';

  showPromoForm: boolean = false;


  readonly PROMO_CODES: Record<string, number> = {
    TRIPMATE10: 0.10,
    WELCOME05: 0.05
  };


  /* =========================================================
     PAYMENT
  ========================================================= */

  payMethod: string = 'qrph';

  isPaying: boolean = false;


  /* =========================================================
     BOOKING STEPS
  ========================================================= */

  currentStep: number = 1;

  highestUnlocked: number = 1;


  /* =========================================================
     GUEST FORM
  ========================================================= */

  guestForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    termsAccepted: false
  };


  formErrors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    terms?: string;
  } = {};


  /* =========================================================
     BOOKING CONFIRMATION
  ========================================================= */

  bookingRef: string = '';


  /* =========================================================
     CONSTRUCTOR
  ========================================================= */

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

    const today = new Date();

    const tomorrow = new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );


    const checkout = new Date(tomorrow);

    checkout.setDate(
      checkout.getDate() + 3
    );


    this.checkIn =
      this.formatDateForInput(tomorrow);

    this.checkOut =
      this.formatDateForInput(checkout);
  }


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {

    this.initListing();

    this.loadCurrentUser();


    /* ---------------------------------------------------------
       URL QUERY PARAMETERS
    --------------------------------------------------------- */

    this.route.queryParams.subscribe(params => {

      if (params['checkin']) {

        this.checkIn =
          params['checkin'];

      }


      if (params['checkout']) {

        this.checkOut =
          params['checkout'];

      }


      if (params['guests']) {

        const guestCount =
          Number(params['guests']);

        if (
          Number.isFinite(guestCount) &&
          guestCount >= 1
        ) {

          this.guests =
            Math.min(
              guestCount,
              this.listing?.maxGuests || guestCount
            );

        }

      }


      const paymentState =
        params['payment'];


      if (paymentState) {

        this.resumePaymentReturn(
          paymentState,
          params['booking_id']
        );

      }

    });

  }


  /* =========================================================
     DATE HELPER
  ========================================================= */

  private formatDateForInput(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;
  }


  /* =========================================================
     LOAD CURRENT USER
  ========================================================= */

  private loadCurrentUser(): void {

    try {

      const storedUser =
        localStorage.getItem(
          'tripmate_user'
        );


      if (!storedUser) {

        return;

      }


      const currentUser =
        JSON.parse(storedUser);


      if (!currentUser) {

        return;

      }


      /* -------------------------------------------------------
         NAME
      ------------------------------------------------------- */

      const nameParts =
        String(
          currentUser.name || ''
        )
          .trim()
          .split(/\s+/)
          .filter(Boolean);


      this.guestForm.firstName =
        nameParts.shift() || '';


      this.guestForm.lastName =
        nameParts.join(' ');


      /* -------------------------------------------------------
         EMAIL
      ------------------------------------------------------- */

      this.guestForm.email =
        currentUser.email || '';


      /* -------------------------------------------------------
         PHONE

         Removes:
         +63
         63
         spaces
      ------------------------------------------------------- */

      this.guestForm.phone =
        String(
          currentUser.phone || ''
        )
          .replace(/^\+63\s*/, '')
          .replace(/^63\s*/, '');

    }

    catch (error) {

      console.warn(
        'Could not load TripMate user.',
        error
      );

    }

  }


  /* =========================================================
     LISTING
  ========================================================= */

  initListing(): void {

    let parsedStay: any = null;


    try {

      const storedStay =
        localStorage.getItem(
          'selectedStay'
        );


      parsedStay =
        storedStay
          ? JSON.parse(storedStay)
          : null;

    }

    catch (error) {

      console.warn(
        'Could not load selected stay.',
        error
      );

    }


    this.listing = {

      id:
        parsedStay?.id ||
        'pine-crest',

      name:
        parsedStay?.name ||
        'Pine Crest Villa Retreat',

      location:
        parsedStay?.location ||
        'Baguio City, Benguet, Luzon',

      rating:
        Number(
          parsedStay?.rating
        ) || 4.92,

      reviews:
        Number(
          parsedStay?.reviews
        ) || 128,

      img:
        parsedStay?.img ||
        'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=800&auto=format&fit=crop',

      ratePerNight:
        Number(
          parsedStay?.price
        ) || 4500,

      cleaningFee: 800,

      serviceFeeRate: 0.10,

      taxRate: 0.1125,

      maxGuests:
        Number(
          parsedStay?.guests
        ) || 6

    };


    if (
      this.guests >
      this.listing.maxGuests
    ) {

      this.guests =
        this.listing.maxGuests;

    }

  }


  /* =========================================================
     MINIMUM CHECK-IN
  ========================================================= */

  get minCheckIn(): string {

    return this.formatDateForInput(
      new Date()
    );

  }


  /* =========================================================
     MINIMUM CHECK-OUT
  ========================================================= */

  get minCheckOut(): string {

    if (!this.checkIn) {

      return this.minCheckIn;

    }


    const date =
      new Date(
        this.checkIn +
        'T00:00:00'
      );


    date.setDate(
      date.getDate() + 1
    );


    return this.formatDateForInput(
      date
    );

  }


  /* =========================================================
     CHECK-IN CHANGE
  ========================================================= */

  onCheckInChange(): void {

    if (!this.checkIn) {

      return;

    }


    if (
      !this.checkOut ||
      this.checkOut <= this.checkIn
    ) {

      this.checkOut =
        this.minCheckOut;

    }

  }


  /* =========================================================
     NUMBER OF NIGHTS
  ========================================================= */

  nights(): number {

    if (
      !this.checkIn ||
      !this.checkOut
    ) {

      return 1;

    }


    const checkInTime =
      new Date(
        this.checkIn +
        'T00:00:00'
      ).getTime();


    const checkOutTime =
      new Date(
        this.checkOut +
        'T00:00:00'
      ).getTime();


    const difference =
      Math.round(
        (
          checkOutTime -
          checkInTime
        ) /
        86400000
      );


    return difference > 0
      ? difference
      : 1;

  }


  /* =========================================================
     PRICING
  ========================================================= */

  pricing() {

    if (!this.listing) {

      return {
        n: 0,
        subtotal: 0,
        cleaning: 0,
        serviceFee: 0,
        taxes: 0,
        discount: 0,
        total: 0
      };

    }


    const n =
      this.nights();


    const subtotal =
      this.listing.ratePerNight *
      n;


    const cleaning =
      this.listing.cleaningFee;


    const serviceFee =
      Math.round(
        (
          subtotal +
          cleaning
        ) *
        this.listing.serviceFeeRate
      );


    const taxes =
      Math.round(
        subtotal *
        this.listing.taxRate
      );


    const preDiscount =
      subtotal +
      cleaning +
      serviceFee +
      taxes;


    const discount =
      this.promoRate
        ? Math.round(
            preDiscount *
            this.promoRate
          )
        : 0;


    const total =
      Math.max(
        0,
        preDiscount -
        discount
      );


    return {

      n,

      subtotal,

      cleaning,

      serviceFee,

      taxes,

      discount,

      total

    };

  }


  /* =========================================================
     FORMAT DISPLAY DATE
  ========================================================= */

  fmtDate(
    dateStr: string
  ): string {

    if (!dateStr) {

      return '';

    }


    const date =
      new Date(
        dateStr +
        'T00:00:00'
      );


    return date.toLocaleDateString(
      'en-PH',
      {
        day: 'numeric',
        month: 'short'
      }
    );

  }


  /* =========================================================
     PESO FORMAT
  ========================================================= */

  peso(
    amount: number
  ): string {

    const safeAmount =
      Number.isFinite(amount)
        ? amount
        : 0;


    return (
      '₱' +
      Math.round(
        safeAmount
      ).toLocaleString(
        'en-PH'
      )
    );

  }


  /* =========================================================
     PROMO
  ========================================================= */

  togglePromo(): void {

    this.showPromoForm =
      !this.showPromoForm;


    this.promoError = '';

  }


  applyPromo(): void {

    const code =
      this.promoInput
        .trim()
        .toUpperCase();


    if (!code) {

      this.promoError =
        'Enter a code first.';

      return;

    }


    const rate =
      this.PROMO_CODES[code];


    if (rate) {

      this.promoCode =
        code;

      this.promoRate =
        rate;

      this.promoError =
        '';

      this.showPromoForm =
        false;

    }

    else {

      this.promoCode =
        null;

      this.promoRate =
        0;

      this.promoError =
        "That code isn't valid.";

    }

  }


  removePromo(): void {

    this.promoCode =
      null;

    this.promoRate =
      0;

    this.promoInput =
      '';

    this.promoError =
      '';

  }


  /* =========================================================
     GUEST CONTROLS
  ========================================================= */

  setGuests(
    delta: number
  ): void {

    if (!this.listing) {

      return;

    }


    const next =
      this.guests +
      delta;


    if (
      next >= 1 &&
      next <=
        this.listing.maxGuests
    ) {

      this.guests =
        next;

    }

  }


  /* =========================================================
     CHANGE STEP
  ========================================================= */

  goToStep(
    step: number
  ): void {

    if (
      step < 1 ||
      step > 3
    ) {

      return;

    }


    if (
      step <=
      this.highestUnlocked
    ) {

      this.currentStep =
        step;


      window.scrollTo({

        top: 0,

        behavior: 'smooth'

      });

    }

  }


  /* =========================================================
     DATE VALIDATION
  ========================================================= */

  validateDates(): boolean {

    if (
      !this.checkIn ||
      !this.checkOut
    ) {

      alert(
        'Please select your check-in and check-out dates.'
      );

      return false;

    }


    const checkIn =
      new Date(
        this.checkIn +
        'T00:00:00'
      );


    const checkOut =
      new Date(
        this.checkOut +
        'T00:00:00'
      );


    if (
      checkOut <=
      checkIn
    ) {

      alert(
        'Please make sure your check-out date is after your check-in date.'
      );

      return false;

    }


    return true;

  }


  /* =========================================================
     CONTINUE TO PAYMENT
  ========================================================= */

  toPayment(): void {

    if (
      !this.validateDates()
    ) {

      return;

    }


    if (!this.listing) {

      alert(
        'No stay selected.'
      );

      return;

    }


    /*
      Allows both:
      - numeric database IDs
      - string demo IDs such as "pine-crest"
    */

    const listingId =
      this.listing.id;


    if (
      listingId === null ||
      listingId === undefined ||
      listingId === ''
    ) {

      alert(
        'Please choose a valid stay.'
      );

      return;

    }


    this.highestUnlocked =
      Math.max(
        this.highestUnlocked,
        2
      );


    this.goToStep(2);

  }


  /* =========================================================
     VALIDATE GUEST FORM
  ========================================================= */

  validateGuestForm(): boolean {

    let valid =
      true;


    this.formErrors =
      {};


    /* FIRST NAME */

    if (
      !this.guestForm
        .firstName
        .trim()
    ) {

      this.formErrors.firstName =
        'Enter your first name.';

      valid =
        false;

    }


    /* LAST NAME */

    if (
      !this.guestForm
        .lastName
        .trim()
    ) {

      this.formErrors.lastName =
        'Enter your last name.';

      valid =
        false;

    }


    /* EMAIL */

    const email =
      this.guestForm
        .email
        .trim();


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


    if (
      !emailPattern.test(
        email
      )
    ) {

      this.formErrors.email =
        'Enter a valid email address.';

      valid =
        false;

    }


    /* PHONE */

    const phoneDigits =
      this.guestForm.phone
        .replace(
          /\D/g,
          ''
        );


    if (
      phoneDigits.length <
      10
    ) {

      this.formErrors.phone =
        'Enter a valid mobile number.';

      valid =
        false;

    }


    /* TERMS */

    if (
      !this.guestForm
        .termsAccepted
    ) {

      this.formErrors.terms =
        'Accept the booking terms to continue.';

      valid =
        false;

    }


    return valid;

  }


  /* =========================================================
     PAY
  ========================================================= */

  async pay(): Promise<void> {

    if (
      !this.validateGuestForm()
    ) {

      return;

    }


    if (
      !this.validateDates()
    ) {

      return;

    }


    if (
      this.isPaying
    ) {

      return;

    }


    this.isPaying =
      true;


    /*
      Temporary payment simulation.

      Later this can be replaced with
      your PayMongo API call.
    */

    setTimeout(
      async () => {

        try {

          await this.completeBooking();

        }

        finally {

          this.isPaying =
            false;

        }

      },

      1100
    );

  }


  /* =========================================================
     COMPLETE BOOKING
  ========================================================= */

  async completeBooking(): Promise<void> {

    let currentUser: any =
      null;


    try {

      currentUser =
        JSON.parse(
          localStorage.getItem(
            'tripmate_user'
          ) || 'null'
        );

    }

    catch {

      currentUser =
        null;

    }


    /* ---------------------------------------------------------
       REQUIRE LOGIN
    --------------------------------------------------------- */

    if (!currentUser) {

      this.router.navigate(
        ['/login'],
        {
          queryParams: {

            redirect:
              `/booking?checkin=${this.checkIn}&checkout=${this.checkOut}&guests=${this.guests}`

          }
        }
      );


      return;

    }


    /*
      For now this works with your front-end/demo stays.

      When your backend is connected,
      replace this section with the actual
      booking/payment API response.
    */


    this.bookingRef =
      'TM-' +
      Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase();


    /* SAVE BOOKING LOCALLY */

    const booking = {

      reference:
        this.bookingRef,

      listing:
        this.listing,

      checkIn:
        this.checkIn,

      checkOut:
        this.checkOut,

      guests:
        this.guests,

      guest:
        this.guestForm,

      promoCode:
        this.promoCode,

      pricing:
        this.pricing(),

      paymentMethod:
        this.payMethod,

      status:
        'confirmed',

      createdAt:
        new Date()
          .toISOString()

    };


    this.saveBookingLocally(
      booking
    );


    /* OPEN CONFIRMATION STEP */

    this.highestUnlocked =
      3;


    this.goToStep(3);

  }


  /* =========================================================
     SAVE BOOKING LOCALLY
  ========================================================= */

  private saveBookingLocally(
    booking: any
  ): void {

    try {

      const storedBookings =
        JSON.parse(
          localStorage.getItem(
            'tripmate_bookings'
          ) || '[]'
        );


      const bookings =
        Array.isArray(
          storedBookings
        )
          ? storedBookings
          : [];


      bookings.unshift(
        booking
      );


      localStorage.setItem(
        'tripmate_bookings',
        JSON.stringify(
          bookings
        )
      );

    }

    catch (error) {

      console.warn(
        'Could not save booking locally.',
        error
      );

    }

  }


  /* =========================================================
     PAYMENT RETURN
  ========================================================= */

  resumePaymentReturn(
    paymentState: string,
    bookingId: string
  ): void {

    if (
      paymentState ===
      'cancelled'
    ) {

      alert(
        'Payment was cancelled. Your booking was not confirmed.'
      );

      return;

    }


    if (
      paymentState ===
      'failed'
    ) {

      alert(
        'Payment was unsuccessful. Please try again.'
      );

      return;

    }


    if (bookingId) {

      this.bookingRef =
        `TM-${String(
          bookingId
        ).padStart(
          6,
          '0'
        )}`;


      this.highestUnlocked =
        3;


      this.goToStep(3);

    }

  }


  /* =========================================================
     NEW BOOKING
  ========================================================= */

  newBooking(): void {

    this.highestUnlocked =
      1;


    this.currentStep =
      1;


    this.bookingRef =
      '';


    this.promoCode =
      null;


    this.promoRate =
      0;


    this.promoInput =
      '';


    this.promoError =
      '';


    this.showPromoForm =
      false;


    this.guestForm.specialRequests =
      '';


    this.guestForm.termsAccepted =
      false;


    this.goToStep(1);

  }


  /* =========================================================
     DOWNLOAD CALENDAR
  ========================================================= */

  downloadCalendar(): void {

    if (
      !this.bookingRef ||
      !this.listing
    ) {

      return;

    }


    const start =
      this.checkIn.replace(
        /-/g,
        ''
      );


    const end =
      this.checkOut.replace(
        /-/g,
        ''
      );


    const ics = [

      'BEGIN:VCALENDAR',

      'VERSION:2.0',

      'PRODID:-//TripMate//Booking//EN',

      'BEGIN:VEVENT',

      `UID:${this.bookingRef}@tripmate`,

      `DTSTART;VALUE=DATE:${start}`,

      `DTEND;VALUE=DATE:${end}`,

      `SUMMARY:${this.escapeICS(
        this.listing.name
      )}`,

      `LOCATION:${this.escapeICS(
        this.listing.location
      )}`,

      `DESCRIPTION:TripMate booking ${this.bookingRef}`,

      'END:VEVENT',

      'END:VCALENDAR'

    ].join('\r\n');


    const blob =
      new Blob(
        [ics],
        {
          type:
            'text/calendar;charset=utf-8'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;


    link.download =
      `${this.bookingRef}.ics`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );

  }


  /* =========================================================
     ESCAPE CALENDAR TEXT
  ========================================================= */

  private escapeICS(
    value: string
  ): string {

    return String(
      value || ''
    )
      .replace(
        /\\/g,
        '\\\\'
      )
      .replace(
        /;/g,
        '\\;'
      )
      .replace(
        /,/g,
        '\\,'
      )
      .replace(
        /\n/g,
        '\\n'
      );

  }


  /* =========================================================
     SHARE BOOKING
  ========================================================= */

  async shareBooking(): Promise<void> {

    if (!this.listing) {

      return;

    }


    const text =
      `${this.listing.name}\n` +
      `${this.fmtDate(this.checkIn)} – ${this.fmtDate(this.checkOut)}\n` +
      `${this.guests} guest${this.guests > 1 ? 's' : ''}\n` +
      `Total: ${this.peso(this.pricing().total)}\n` +
      `Booking reference: ${this.bookingRef}`;


    try {

      if (
        navigator.share
      ) {

        await navigator.share({

          title:
            'TripMate booking',

          text

        });

      }

      else if (
        navigator.clipboard
      ) {

        await navigator.clipboard.writeText(
          text
        );


        alert(
          'Booking details copied.'
        );

      }

    }

    catch (error) {

      console.warn(
        'Sharing was cancelled or unavailable.',
        error
      );

    }

  }

}
