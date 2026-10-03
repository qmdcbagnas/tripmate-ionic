import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class LoginPage implements OnInit {
  mode: 'guest' | 'host' = 'guest';
  email = '';
  password = '';
  
  emailError = '';
  passwordError = '';
  isSubmitting = false;
  showPassword = false;
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
    this.mode = mode;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async login() {
    this.emailError = '';
    this.passwordError = '';
    
    let hasError = false;
    if (!this.email || (this.email.includes('@') && !this.isValidEmail(this.email))) {
      this.emailError = 'Enter a valid email or username.';
      hasError = true;
    }
    if (!this.password) {
      this.passwordError = 'Password is required.';
      hasError = true;
    }
    
    if (hasError) return;
    
    this.isSubmitting = true;
    try {
      const user = await this.api.login({ identifier: this.email, password: this.password, role: this.mode });
      this.displayToast(`Welcome back, ${user.name.split(" ")[0]}!`);
      const redirectParam = this.route.snapshot.queryParams['redirect'];
      const destination = redirectParam || (user.role === 'admin' ? '/admin' : user.role === 'host' ? '/host/dashboard' : '/dashboard');
      setTimeout(() => { this.router.navigateByUrl(destination); }, 700);
    } catch (error: any) {
      this.emailError = error.message || 'Unable to log in.';
      this.isSubmitting = false;
    }
  }
  
  displayToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3200);
  }
}


