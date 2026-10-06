import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService, AppUser } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { IonIcon, IonMenuButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline, heartOutline, mapOutline, calendarOutline, businessOutline, arrowBackOutline } from 'ionicons/icons';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-buttons',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, IonMenuButton],
  template: `
    <header class="main-top-nav" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 15px clamp(20px, 5vw, 64px); box-sizing: border-box;">
      
      <!-- LEFT: Hamburger + Logo -->
      <div class="nav-left" style="display: flex; align-items: center; gap: 16px; flex: 1;">
        <ion-menu-button style="color: white;"></ion-menu-button>
        <a routerLink="/homepage" class="logo" style="display: flex; align-items: center; gap: 9px; text-decoration: none;">
          <img src="assets/images/tripmate.svg" alt="TripMate" style="height: 36px;">
        </a>
      </div>

      <!-- CENTER: Navigation Links -->
      <div class="nav-center hide-mobile" style="display: flex; align-items: center; justify-content: center; gap: 36px; flex: 2;">
        <a routerLink="/stays" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Stays</a>
        <a routerLink="/how-it-works" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">How it works</a>
        <!-- Become a Host: Show only for visitors -->
        <a *ngIf="!user" routerLink="/become-host" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Become a Host</a>
        <!-- Host Dashboard: Show only for hosts -->
        <a *ngIf="user?.role === 'host'" routerLink="/admin" style="color: white; text-decoration: none; font-size: 14.5px; font-weight: 500;">Host Dashboard</a>
      </div>

      <!-- RIGHT: Auth / Profile -->
      <div class="nav-right" style="display: flex; align-items: center; justify-content: flex-end; gap: 16px; flex: 1;">
        
        <!-- Back to Home Link (Visible on all pages except Homepage) -->
        <a *ngIf="!isHomepage" routerLink="/homepage" class="hide-mobile" style="display: flex; align-items: center; gap: 6px; color: white; text-decoration: none; font-size: 13.5px; font-weight: 500; margin-right: 8px;">
          <ion-icon name="arrow-back-outline"></ion-icon> Back to home
        </a>

        <!-- Guest state buttons -->
        <ng-container *ngIf="!user">
          <a routerLink="/login" class="hide-mobile" style="color: white; font-size: 14.5px; font-weight: 500; text-decoration: none; cursor: pointer; margin-right: 8px;">Log in</a>
          <a routerLink="/signup" class="btn-primary" style="background: var(--tm-color-primary, #FF6B4A); color: white; padding: 10px 22px; border-radius: 100px; font-size: 14.5px; font-weight: 600; text-decoration: none; border:none; cursor: pointer;">Get started</a>
        </ng-container>

        <!-- Logged-in state dropdown -->
        <div class="user-menu-container" *ngIf="user" style="position: relative;" (click)="toggleDropdown($event)">
          <button class="user-avatar-btn" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); background: var(--tm-color-primary, #FF6B4A); color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img *ngIf="user.avatar_url" [src]="user.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" />
            <span *ngIf="!user.avatar_url">{{ initials }}</span>
          </button>

          <div class="user-dropdown" *ngIf="dropdownOpen" (click)="$event.stopPropagation()" style="position: absolute; top: 56px; right: 0; width: 260px; background: #0F2E25; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); z-index: 9999; color: #FFFFFF; display: flex; flex-direction: column; overflow: hidden;">
            <div class="dropdown-header" style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: rgba(0,0,0,0.2);">
              <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 4px;">{{ user.full_name || 'Guest' }}</div>
              <div style="font-size: 0.85rem; color: #F8F5EE; opacity: 0.8;">{{ user.email }}</div>
            </div>
            
            <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <a routerLink="/profile" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="person-circle-outline"></ion-icon> My Profile
              </a>
              <a routerLink="/dashboard" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="calendar-outline"></ion-icon> My Trips
              </a>
              <a routerLink="/wishlist" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="heart-outline"></ion-icon> Wishlist
              </a>
            </div>

            <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <a *ngIf="user.role !== 'host'" routerLink="/become-host" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="business-outline"></ion-icon> Switch to Hosting
              </a>
              <a *ngIf="user.role === 'host'" routerLink="/admin" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                <ion-icon name="business-outline"></ion-icon> Host Dashboard
              </a>
            </div>

            <div style="padding: 8px 0;">
              <button (click)="logout()" class="dropdown-item" style="padding: 12px 20px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: 0.2s; background: transparent; border: none; width: 100%; text-align: left; cursor: pointer; font-size: 1rem; font-family: inherit;">
                <ion-icon name="log-out-outline"></ion-icon> Log out
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  `,
  styles: [`
    .dropdown-item:hover { background: rgba(255, 255, 255, 0.1); color: #FF6B4A !important; }
    .dropdown-item:hover ion-icon { color: #FF6B4A !important; }
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }
  `]
})
export class AuthButtonsComponent implements OnInit, OnDestroy {
  user: AppUser | null = null;
  initials = '';
  dropdownOpen = false;
  isHomepage = false;
  private sub!: Subscription;
  private routerSub!: Subscription;
  private clickListener: any;

  constructor(private authService: AuthService, private router: Router, private location: Location) {
    addIcons({ logOutOutline, personCircleOutline, heartOutline, mapOutline, calendarOutline, businessOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.sub = this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u?.full_name) {
        this.initials = u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
    });

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomepage = event.url === '/' || event.url === '/homepage' || event.urlAfterRedirects === '/homepage';
    });
    
    this.isHomepage = this.router.url === '/' || this.router.url === '/homepage';

    this.clickListener = (e: MouseEvent) => {
      this.dropdownOpen = false;
    };
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
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
