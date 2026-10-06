import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonMenuButton
} from '@ionic/angular';


@Component({
  selector: 'app-contactus',

  templateUrl: './contactus.page.html',

  styleUrls: ['./contactus.page.scss'],

  imports: [
    AuthButtonsComponent,
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonMenuButton
  ]
})

export class ContactusPage implements OnInit {


  /* =========================
     FORM DATA
  ========================== */

  formData = {
    name: '',
    email: '',
    topic: '',
    reference: '',
    message: ''
  };


  /* =========================
     ERRORS
  ========================== */

  errors = {
    name: '',
    email: '',
    topic: '',
    reference: '',
    message: ''
  };


  maxLength = 1000;

  isSending = false;

  isSent = false;

  ticketId = '';

  formAlert = '';


  /* =========================
     FAQ
  ========================== */

  faqs = [

    {
      question: 'How do I pay for a stay?',
      answer:
        'You can pay with GCash, Maya, or bank transfer. You do not need a credit card to book on TripMate.',
      open: false
    },

    {
      question: 'How do you check the hosts?',
      answer:
        'Every host submits a valid ID and proof of property before their first listing goes live.',
      open: false
    },

    {
      question: 'Who can leave a review?',
      answer:
        'Only guests with a completed, paid booking can review a stay.',
      open: false
    },

    {
      question: 'Where can I see my bookings?',
      answer:
        'Log in to your TripMate account and open My Trips to view your current and previous bookings.',
      open: false
    },

    {
      question: 'How do I list my place?',
      answer:
        'Create a host account, submit your ID and proof of property, then add your listing. Once it is verified, it can go live.',
      open: false
    }

  ];


  constructor(
    private route: ActivatedRoute,

    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {}


  /* =========================
     INITIALIZATION
  ========================== */

  ngOnInit(): void {

    this.prefill();

    this.route.queryParams.subscribe(params => {

      const topic = params['topic'];

      const validTopics = [
        'booking',
        'payments',
        'cancellations',
        'hosting',
        'report',
        'other'
      ];

      if (
        topic &&
        validTopics.includes(topic)
      ) {

        this.formData.topic = topic;

      }

    });

  }


  /* =========================
     PREFILL USER
  ========================== */

  prefill(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {

      const user = JSON.parse(
        localStorage.getItem('tripmate_user') || 'null'
      );

      const session = JSON.parse(
        localStorage.getItem('tripmate_session') || 'null'
      );


      if (user && session) {

        if (
          user.name &&
          !this.formData.name
        ) {

          this.formData.name = user.name;

        }


        if (
          user.email &&
          !this.formData.email
        ) {

          this.formData.email = user.email;

        }

      }

    } catch (error) {

      console.error(
        'Unable to prefill contact form:',
        error
      );

    }

  }


  /* =========================
     CLEAR ERROR
  ========================== */

  clearError(
    field: keyof typeof this.errors
  ): void {

    this.errors[field] = '';

    this.formAlert = '';

  }


  /* =========================
     VALIDATION
  ========================== */

  validate(): boolean {

    let isValid = true;


    /* NAME */

    if (!this.formData.name.trim()) {

      this.errors.name =
        'Enter your full name.';

      isValid = false;

    }

    else if (
      this.formData.name.trim().length < 2
    ) {

      this.errors.name =
        'Enter at least 2 characters.';

      isValid = false;

    }

    else {

      this.errors.name = '';

    }


    /* EMAIL */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


    if (!this.formData.email.trim()) {

      this.errors.email =
        'Enter your email so we can reply.';

      isValid = false;

    }

    else if (
      !emailPattern.test(
        this.formData.email.trim()
      )
    ) {

      this.errors.email =
        'Enter a valid email, like juan@example.com.';

      isValid = false;

    }

    else {

      this.errors.email = '';

    }


    /* TOPIC */

    if (!this.formData.topic) {

      this.errors.topic =
        'Choose a topic.';

      isValid = false;

    }

    else {

      this.errors.topic = '';

    }


    /* REFERENCE */

    if (
      this.formData.reference &&
      !/^[A-Za-z0-9-]{4,20}$/.test(
        this.formData.reference
      )
    ) {

      this.errors.reference =
        'Use 4 to 20 letters, numbers, or dashes.';

      isValid = false;

    }

    else {

      this.errors.reference = '';

    }


    /* MESSAGE */

    if (!this.formData.message.trim()) {

      this.errors.message =
        'Write a short message.';

      isValid = false;

    }

    else if (
      this.formData.message.trim().length < 10
    ) {

      this.errors.message =
        'Add a little more detail (at least 10 characters).';

      isValid = false;

    }

    else {

      this.errors.message = '';

    }


    return isValid;

  }


  /* =========================
     SUBMIT
  ========================== */

  async handleSubmit(): Promise<void> {

    if (this.isSending) {
      return;
    }


    this.formAlert = '';


    if (!this.validate()) {
      return;
    }


    this.isSending = true;


    try {

      /* Fake network delay */

      await new Promise<void>(
        resolve =>
          setTimeout(resolve, 700)
      );


      /* Generate ticket */

      this.ticketId =
        'TM-' +
        Date.now()
          .toString(36)
          .toUpperCase()
          .slice(-6);


      /* Save locally */

      if (
        isPlatformBrowser(
          this.platformId
        )
      ) {

        const messages =
          JSON.parse(
            localStorage.getItem(
              'tripmate_contact_messages'
            ) || '[]'
          );


        messages.push({

          ...this.formData,

          ticketId:
            this.ticketId,

          sentAt:
            new Date().toISOString()

        });


        localStorage.setItem(
          'tripmate_contact_messages',
          JSON.stringify(messages)
        );

      }


      this.isSent = true;


      setTimeout(() => {

        document
          .getElementById(
            'formSuccess'
          )
          ?.focus();


        document
          .getElementById(
            'contactCard'
          )
          ?.scrollIntoView({

            behavior: 'smooth',

            block: 'center'

          });

      }, 50);


    } catch (error) {

      console.error(
        'Contact form error:',
        error
      );


      this.formAlert =
        "We couldn't send your message. Please try again.";


    } finally {

      this.isSending = false;

    }

  }


  /* =========================
     RESET
  ========================== */

  reset(): void {

    this.formData = {

      name: '',

      email: '',

      topic: '',

      reference: '',

      message: ''

    };


    this.errors = {

      name: '',

      email: '',

      topic: '',

      reference: '',

      message: ''

    };


    this.formAlert = '';

    this.ticketId = '';

    this.isSent = false;


    this.prefill();

  }


  /* =========================
     FAQ TOGGLE
  ========================== */

  toggleFaq(index: number): void {

    this.faqs[index].open =
      !this.faqs[index].open;

  }


  /* =========================
     FIRST NAME
  ========================== */

  get firstName(): string {

    const name =
      this.formData.name.trim();


    if (!name) {
      return 'there';
    }


    return name.split(/\s+/)[0];

  }

}




