import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton, IonBackButton } from '@ionic/angular';
import { AuthService, AppUser } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    RouterLinkActive,
    AuthButtonsComponent,RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton, IonBackButton]
})
export class ProfilePage implements OnInit {
  user: AppUser | null = null;
  initials = '';
  userDropdownOpen = false;

  toastMessage = '';
  showToast = false;
  toastError = false;

  account = { firstName: '', lastName: '', email: '', phone: '', bio: '' };
  security = { currentPassword: '', newPassword: '', confirmPassword: '' };
  notifications = { booking: true, payment: true, reminders: true, promo: false };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
        if (!this.user) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'profile' } });
      return;
    }
    this.populateUserInfo();
  }

  populateUserInfo() {
    if (!this.user) return;
    const parts = (this.user.full_name || '').split(' ');
    this.account.firstName = parts[0] || '';
    this.account.lastName = parts.slice(1).join(' ') || '';
    this.account.email = this.user.email || '';
    this.account.phone = this.user.phone || '';
    this.initials = (this.user.full_name || 'Guest')
      .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const saved = localStorage.getItem(`tripmate_notifications_${this.user.id}`);
    if (saved) {
      try { this.notifications = { ...this.notifications, ...JSON.parse(saved) }; } catch {}
    }
  }

  displayToast(msg: string, isError = false) {
    this.toastMessage = msg;
    this.toastError = isError;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  
  triggerUpload() {
    const fileInput = document.getElementById('avatarUpload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64 = e.target.result;
      if (this.user) {
        this.user.avatar_url = base64;
        await this.auth.updateProfile({ avatar_url: base64 });
        this.displayToast('Profile photo updated!');
      }
    };
    reader.readAsDataURL(file);
  }

  onAccountSubmit() {
    const { firstName, lastName, email } = this.account;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      this.displayToast('Please fill in all required fields.', true); return;
    }
    if (!this.isValidEmail(email.trim())) {
      this.displayToast('Please enter a valid email address.', true); return;
    }
    // Update stored session
    if (this.user) {
      const updated = { ...this.user, full_name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim(), phone: this.account.phone };
      localStorage.setItem('tripmate_mock_session', JSON.stringify(updated));
      this.user = updated as AppUser;
    }
    this.displayToast('Profile updated successfully!');
    this.populateUserInfo();
  }

  onSecuritySubmit() {
    const { newPassword, confirmPassword } = this.security;
    if (!newPassword || !confirmPassword) { this.displayToast('Please fill in all password fields.', true); return; }
    if (newPassword.length < 8) { this.displayToast('New password must be at least 8 characters.', true); return; }
    if (newPassword !== confirmPassword) { this.displayToast('New passwords do not match.', true); return; }

    // Update password in mock store
    const users = JSON.parse(localStorage.getItem('tripmate_mock_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === this.user?.id);
    if (idx !== -1) { users[idx].password = newPassword; localStorage.setItem('tripmate_mock_users', JSON.stringify(users)); }

    this.displayToast('Password updated successfully!');
    this.security = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  onNotificationChange() {
    if (this.user) localStorage.setItem(`tripmate_notifications_${this.user.id}`, JSON.stringify(this.notifications));
  }

  deleteAccount() {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) return;
    if (this.user) {
      const users = JSON.parse(localStorage.getItem('tripmate_mock_users') || '[]');
      localStorage.setItem('tripmate_mock_users', JSON.stringify(users.filter((u: any) => u.id !== this.user!.id)));
    }
    this.auth.signOut();
  }

  toggleUserDropdown(event: Event) { event.stopPropagation(); this.userDropdownOpen = !this.userDropdownOpen; }
  closeUserDropdown() { this.userDropdownOpen = false; }
  async logout(event: Event) { event.preventDefault(); await this.auth.signOut(); }
}











