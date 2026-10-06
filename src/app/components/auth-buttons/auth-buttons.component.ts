import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService, AppUser } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline, heartOutline, mapOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-auth-buttons',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon],
  template: `
    <!-- Guest state -->
    <ng-container *ngIf="!user">
      <a routerLink="/signup" class="nav-cta btn-primary" style="background: var(--tm-color-primary, #FF6B4A); color: white; padding: 11px 22px; border-radius: 100px; font-size: 14.5px; font-weight: 500; text-decoration: none; border:none; cursor: pointer;">Get started</a>
      <a routerLink="/login" class="nav-login" style="color: inherit; font-size: 14.5px; font-weight: 500; text-decoration: none; margin-left: 12px; cursor: pointer;">Log in</a>
    </ng-container>

    <!-- Logged-in state -->
    <div class="user-menu-container" *ngIf="user" style="position: relative;" (click)="toggleDropdown($event)">
      <button class="user-avatar-btn" style="width: 44px; height: 44px; border-radius: 50%; border: none; background: var(--tm-color-primary, #FF6B4A); color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 0;">
        <img *ngIf="user.avatar_url" [src]="user.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" />
        <span *ngIf="!user.avatar_url">{{ initials }}</span>
      </button>

      <div class="user-dropdown" *ngIf="dropdownOpen" (click)="$event.stopPropagation()" style="position: absolute; top: 56px; right: 0; width: 260px; background: #0F2E25; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); z-index: 100; color: #FFFFFF; display: flex; flex-direction: column;">
        <div class="dropdown-header" style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 4px;">{{ user.full_name || 'Guest' }}</div>
          <div style="font-size: 0.85rem; color: #F8F5EE; opacity: 0.8;">{{ user.email }}</div>
        </div>
        <a routerLink="/profile" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
          <ion-icon name="person-circle-outline"></ion-icon> My Profile
        </a>
        <a routerLink="/dashboard" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
          <ion-icon name="calendar-outline"></ion-icon> My Trips
        </a>
        <a routerLink="/wishlist" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
          <ion-icon name="heart-outline"></ion-icon> Wishlist
        </a>
        <button (click)="logout()" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s; background: transparent; border: none; width: 100%; text-align: left; cursor: pointer; font-size: 1rem; font-family: inherit;">
          <ion-icon name="log-out-outline"></ion-icon> Log out
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-item:hover { background: rgba(255, 255, 255, 0.1); color: #FF6B4A !important; }
    .dropdown-item:hover ion-icon { color: #FF6B4A !important; }
  `]
})
export class AuthButtonsComponent implements OnInit, OnDestroy {
  user: AppUser | null = null;
  initials = '';
  dropdownOpen = false;
  private sub!: Subscription;
  private clickListener: any;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ logOutOutline, personCircleOutline, heartOutline, mapOutline, calendarOutline });
  }

  ngOnInit() {
    this.sub = this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u?.full_name) {
        this.initials = u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
    });

    this.clickListener = (e: MouseEvent) => {
      this.dropdownOpen = false;
    };
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    document.removeEventListener('click', this.clickListener);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  async logout() {
    await this.authService.signOut();
    this.dropdownOpen = false;
  }
}
