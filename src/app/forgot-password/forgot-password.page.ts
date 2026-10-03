import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class ForgotPasswordPage implements OnInit {
  email = '';
  emailError = '';
  isSubmitting = false;
  showConfirmPanel = false;
  sentEmail = '';
  
  toastMessage = '';
  showToast = false;
  toastError = false;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
  }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async sendResetLink() {
    this.emailError = '';
    
    if (!this.isValidEmail(this.email.trim())) {
      this.emailError = 'Enter a valid email address.';
      return;
    }
    
    this.isSubmitting = true;
    try {
      await this.api.request('/auth/forgot', { method: 'POST', body: JSON.stringify({ email: this.email.trim() }) });
      this.sentEmail = this.email.trim();
      this.showConfirmPanel = true;
    } catch (error: any) {
      this.emailError = error.message || 'Unable to request a reset link.';
      this.isSubmitting = false;
    }
  }
  
  backToLogin() {
    this.router.navigateByUrl('/login');
  }

  resendLink() {
    this.displayToast(`Reset link re-sent to ${this.sentEmail}.`);
  }
  
  displayToast(msg: string, isError = false) {
    this.toastMessage = msg;
    this.toastError = isError;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3200);
  }
}


