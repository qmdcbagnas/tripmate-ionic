import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class ProfilePage implements OnInit {
  user: any = null;
  initials: string = '';
  isAdmin: boolean = false;

  account = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  };

  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  notifications = {
    booking: true,
    payment: true,
    reminders: true,
    promo: false
  };

  userDropdownOpen = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkAuth();
    this.populateUserInfo();
  }

  checkAuth() {
    try {
      this.user = JSON.parse(localStorage.getItem('tripmate_user') || 'null');
    } catch {
      this.user = null;
    }
    
    if (!this.user || !localStorage.getItem('tripmate_session')) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'profile' } });
    }
  }

  populateUserInfo() {
    if (!this.user) return;
    
    const nameParts = (this.user.name || '').split(' ');
    this.account.firstName = nameParts[0] || '';
    this.account.lastName = nameParts.slice(1).join(' ') || '';
    this.account.email = this.user.email || '';
    this.account.phone = this.user.phone || '';
    this.account.bio = this.user.bio || '';

    this.initials = (this.user.name || 'Guest').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    this.isAdmin = (this.user.role || this.user.type || 'guest') === 'admin';

    const savedNotifs = JSON.parse(localStorage.getItem(`tripmate_notifications_${this.user.id}`) || 'null');
    if (savedNotifs) {
      this.notifications = { ...this.notifications, ...savedNotifs };
    }
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

  showToast(message: string, isError = false) {
    alert((isError ? "Error: " : "") + message); // Simple fallback for now
  }

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onAccountSubmit() {
    const { firstName, lastName, email, phone, bio } = this.account;
    const fName = firstName.trim();
    const lName = lastName.trim();
    const e = email.trim();

    if (!fName || !lName || !e) {
      this.showToast('Please fill in all required fields.', true);
      return;
    }

    if (!this.isValidEmail(e)) {
      this.showToast('Please enter a valid email address.', true);
      return;
    }

    // Update users array
    const users = JSON.parse(localStorage.getItem('tripmate_users') || '[]');
    const index = users.findIndex((u: any) => u.id === this.user.id);
    if (index === -1) {
      this.showToast('Unable to save your profile.', true);
      return;
    }

    users[index] = {
      ...users[index],
      name: `${fName} ${lName}`.trim(),
      email: e,
      phone,
      bio
    };
    localStorage.setItem('tripmate_users', JSON.stringify(users));

    // Update current user
    const { password, ...safeUser } = users[index];
    localStorage.setItem('tripmate_user', JSON.stringify(safeUser));
    this.user = safeUser;
    
    this.showToast('Profile updated successfully!');
    this.populateUserInfo();
  }

  onSecuritySubmit() {
    const { currentPassword, newPassword, confirmPassword } = this.security;

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.showToast('Please fill in all password fields.', true);
      return;
    }

    if (newPassword.length < 8) {
      this.showToast('New password must be at least 8 characters.', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showToast('New passwords do not match.', true);
      return;
    }

    const users = JSON.parse(localStorage.getItem('tripmate_users') || '[]');
    const index = users.findIndex((u: any) => u.id === this.user.id);
    
    if (index === -1) {
      this.showToast('User not found.', true);
      return;
    }
    
    if (users[index].password !== currentPassword) {
      this.showToast('Current password is incorrect.', true);
      return;
    }

    users[index].password = newPassword;
    localStorage.setItem('tripmate_users', JSON.stringify(users));

    this.showToast('Password updated successfully!');
    this.security = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  onNotificationChange() {
    localStorage.setItem(`tripmate_notifications_${this.user.id}`, JSON.stringify(this.notifications));
    // Toast logic could go here
  }

  deleteAccount() {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;

    const users = JSON.parse(localStorage.getItem("tripmate_users") || "[]");
    const filteredUsers = users.filter((item: any) => item.id !== this.user.id);
    localStorage.setItem("tripmate_users", JSON.stringify(filteredUsers));
    
    localStorage.removeItem("tripmate_user");
    localStorage.removeItem("tripmate_session");

    const bookings = JSON.parse(localStorage.getItem("tripmate_bookings") || "[]");
    localStorage.setItem("tripmate_bookings", JSON.stringify(bookings.filter((item: any) => item.userId !== this.user.id)));

    const wishlist = JSON.parse(localStorage.getItem("tripmate_wishlist") || "[]");
    localStorage.setItem("tripmate_wishlist", JSON.stringify(wishlist.filter((item: any) => item.userId !== this.user.id)));

    this.showToast("Account deleted successfully.");
    setTimeout(() => {
        this.router.navigate(['/homepage']);
    }, 1500);
  }
}


