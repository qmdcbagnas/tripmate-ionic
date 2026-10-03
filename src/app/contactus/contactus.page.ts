import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class ContactusPage implements OnInit {
  formData = {
    name: '',
    email: '',
    topic: '',
    reference: '',
    message: ''
  };

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
  
  faqs = [
    { question: 'How do I pay for a stay?', answer: 'You can pay with GCash, Maya, or bank transfer. You don\'t need a credit card to book on TripMate.', open: false },
    { question: 'How do you check the hosts?', answer: 'Every host submits a valid ID and proof of property before their first listing goes live.', open: false },
    { question: 'Who can leave a review?', answer: 'Only guests with a completed, paid booking can review a stay. If you think a review is fake, choose "Report a listing or review" in the form above.', open: false },
    { question: 'Where can I see my bookings?', answer: 'Log in and open My Trips from the menu at the top right of any page.', open: false },
    { question: 'How do I list my place?', answer: 'Create a host account, submit your ID and proof of property, then add your listing. Once it\'s verified, it goes live.', open: false }
  ];

  constructor(private route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.prefill();
    this.route.queryParams.subscribe(params => {
      if (params['topic']) {
        const validTopics = ['booking', 'payments', 'cancellations', 'hosting', 'report', 'other'];
        if (validTopics.includes(params['topic'])) {
          this.formData.topic = params['topic'];
        }
      }
    });
  }

  prefill() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const user = JSON.parse(localStorage.getItem("tripmate_user") || "null");
        const session = JSON.parse(localStorage.getItem("tripmate_session") || "null");
        if (user && session) {
          if (user.name && !this.formData.name) this.formData.name = user.name;
          if (user.email && !this.formData.email) this.formData.email = user.email;
        }
      } catch (error) {}
    }
  }

  clearError(field: keyof typeof this.errors) {
    this.errors[field] = '';
    this.formAlert = '';
  }

  validate(): boolean {
    let isValid = true;
    
    if (!this.formData.name) { this.errors.name = "Enter your full name."; isValid = false; }
    else if (this.formData.name.length < 2) { this.errors.name = "Enter at least 2 characters."; isValid = false; }
    else { this.errors.name = ''; }

    if (!this.formData.email) { this.errors.email = "Enter your email so we can reply."; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.formData.email)) { this.errors.email = "Enter a valid email, like juan@example.com."; isValid = false; }
    else { this.errors.email = ''; }

    if (!this.formData.topic) { this.errors.topic = "Choose a topic so we can send your message to the right person."; isValid = false; }
    else { this.errors.topic = ''; }

    if (this.formData.reference && !/^[A-Za-z0-9-]{4,20}$/.test(this.formData.reference)) {
      this.errors.reference = "Use 4 to 20 letters, numbers, or dashes."; isValid = false;
    } else { this.errors.reference = ''; }

    if (!this.formData.message) { this.errors.message = "Write a short message."; isValid = false; }
    else if (this.formData.message.length < 10) { this.errors.message = "Add a little more detail (at least 10 characters)."; isValid = false; }
    else { this.errors.message = ''; }

    return isValid;
  }

  async handleSubmit() {
    if (this.isSending) return;
    this.formAlert = '';
    if (!this.validate()) return;

    this.isSending = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      this.ticketId = "TM-" + Date.now().toString(36).toUpperCase().slice(-6);
      
      if (isPlatformBrowser(this.platformId)) {
        const messages = JSON.parse(localStorage.getItem('tripmate_contact_messages') || '[]');
        messages.push({ ...this.formData, ticketId: this.ticketId, sentAt: new Date().toISOString() });
        localStorage.setItem('tripmate_contact_messages', JSON.stringify(messages));
      }
      
      this.isSent = true;
      setTimeout(() => {
        document.getElementById('formSuccess')?.focus();
        document.getElementById('contactCard')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } catch (error) {
      this.formAlert = "We couldn't send your message. Check your connection and try again.";
    } finally {
      this.isSending = false;
    }
  }

  reset() {
    this.formData = {
      name: '',
      email: '',
      topic: '',
      reference: '',
      message: ''
    };
    Object.keys(this.errors).forEach(k => this.errors[k as keyof typeof this.errors] = '');
    this.formAlert = '';
    this.isSent = false;
    this.prefill();
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  get firstName(): string {
    return this.formData.name.split(/\s+/)[0];
  }
}


