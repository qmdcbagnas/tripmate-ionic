import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class SignupPage implements OnInit {
  mode: 'guest' | 'host' = 'guest';
  fullName = '';
  email = '';
  businessName = '';
  password = '';
  confirmPassword = '';
  agreed = false;
  
  nameError = '';
  emailError = '';
  passwordError = '';
  confirmError = '';
  termsError = false;

  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  toastMessage = '';
  showToast = false;
  toastError = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'host') {
        this.setMode('host');
      }
    });
  }

  setMode(mode: 'guest' | 'host') {
    if (this.mode === mode) return;
    if (mode === 'host') this.router.navigate(['/become-host']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async signup() {
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmError = '';
    this.termsError = false;
    
    let hasError = false;
    
    if (!this.fullName.trim()) {
      this.nameError = 'Enter your full name.';
      hasError = true;
    }
    if (!this.isValidEmail(this.email.trim())) {
      this.emailError = 'Enter a valid email address.';
      hasError = true;
    }
    if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters.';
      hasError = true;
    }
    if (this.confirmPassword !== this.password || !this.confirmPassword) {
      this.confirmError = "Passwords don't match.";
      hasError = true;
    }
    if (!this.agreed) {
      this.displayToast("Please agree to the Terms of Service to continue.", true);
      hasError = true;
      this.termsError = true;
    }
    
    if (hasError) return;
    
    this.isSubmitting = true;
    try {
      const bName = this.mode === 'host' ? this.businessName.trim() : '';
      const newUser = await this.api.register({ name: this.fullName.trim(), email: this.email.trim(), password: this.password, role: this.mode, businessName: bName });
      localStorage.setItem("tripmate_session", "true");
      this.displayToast(`Welcome to TripMate, ${this.fullName.split(" ")[0]}!`, false);
      const destination = this.mode === "host" ? "/host/dashboard" : "/dashboard";
      setTimeout(() => { this.router.navigateByUrl(destination); }, 800);
    } catch (error: any) {
      const message = error.message || "Unable to create account.";
      this.emailError = message.includes("API service unavailable") 
        ? "Signup service is offline. Check the Netlify Function deployment and Neon environment variables."
        : message;
      this.isSubmitting = false;
    }
  }
  
  displayToast(msg: string, isError = false) {
    this.toastMessage = msg;
    this.toastError = isError;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3200);
  }
}



