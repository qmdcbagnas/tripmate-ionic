import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  avatar_url?: string;
  phone?: string;
  businessName?: string;
}

// ── Mock user store (used when USE_MOCK_DATA = true) ──────────────────────────
interface MockUser extends AppUser { password: string; }
const MOCK_USERS_KEY = 'tripmate_mock_users';
const MOCK_SESSION_KEY = 'tripmate_mock_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = new BehaviorSubject<AppUser | null>(null);
  currentUser$ = this._currentUser.asObservable();

  constructor(private supabase: SupabaseService, private router: Router) {
    this.restoreSession();
  }

  // ── Session restore ─────────────────────────────────────────────────────────
  private async restoreSession() {
    if (environment.USE_MOCK_DATA) {
      const stored = localStorage.getItem(MOCK_SESSION_KEY);
      if (stored) {
        try { this._currentUser.next(JSON.parse(stored)); } catch {}
      }
      return;
    }

    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      const profile = await this.fetchProfile(data.session.user.id);
      this._currentUser.next(profile);
    }

    // Listen for auth state changes (token refresh, sign-out, etc.)
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.fetchProfile(session.user.id);
        this._currentUser.next(profile);
      } else {
        this._currentUser.next(null);
      }
    });
  }

  private async fetchProfile(userId: string): Promise<AppUser | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      avatar_url: data.avatar_url,
      phone: data.phone,
    };
  }

  // ── SIGN UP ─────────────────────────────────────────────────────────────────
  async signUp(payload: {
    full_name: string;
    email: string;
    password: string;
    role: 'guest' | 'host';
    businessName?: string;
  }): Promise<AppUser> {
    // ── Mock mode ──
    if (environment.USE_MOCK_DATA) {
      const existing = this.getMockUsers().find(u => u.email === payload.email);
      if (existing) throw new Error('An account with this email already exists.');

      const newUser: MockUser = {
        id: 'mock_' + Date.now(),
        full_name: payload.full_name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        businessName: payload.businessName,
      };
      this.saveMockUser(newUser);
      const { password: _, ...safe } = newUser;
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(safe));
      this._currentUser.next(safe);
      return safe;
    }

    // ── Supabase mode ──
    const { data, error } = await this.supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.full_name,
          role: payload.role,
        },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Signup failed — no user returned.');

    // If host, upsert into profiles with business name
    if (payload.role === 'host' && payload.businessName) {
      await this.supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: payload.full_name,
        email: payload.email,
        role: 'host',
      });
    }

    const profile = await this.fetchProfile(data.user.id);
    this._currentUser.next(profile);
    return profile!;
  }

  // ── SIGN IN ─────────────────────────────────────────────────────────────────
  async signIn(email: string, password: string): Promise<AppUser> {
    // ── Mock mode ──
    if (environment.USE_MOCK_DATA) {
      const user = this.getMockUsers().find(
        u => u.email === email && u.password === password
      );
      if (!user) throw new Error('Invalid email or password.');
      const { password: _, ...safe } = user;
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(safe));
      this._currentUser.next(safe);
      return safe;
    }

    // ── Supabase mode ──
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed.');

    const profile = await this.fetchProfile(data.user.id);
    this._currentUser.next(profile);
    return profile!;
  }

  // ── SIGN OUT ────────────────────────────────────────────────────────────────
    // ?? Update Profile Data (including Avatar)
  async updateProfile(updates: Partial<AppUser>) {
    const user = this._currentUser.getValue();
    if (!user) return;

    const updatedUser = { ...user, ...updates };

    if (environment.USE_MOCK_DATA) {
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      }
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
      this._currentUser.next(updatedUser);
      return;
    }

    // Real Supabase Update
    await this.supabase.client.from('profiles').update(updates).eq('id', user.id);
    this._currentUser.next(updatedUser);
  }

  async signOut() {
    if (environment.USE_MOCK_DATA) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      this._currentUser.next(null);
      this.router.navigateByUrl('/homepage');
      return;
    }

    await this.supabase.auth.signOut();
    this._currentUser.next(null);
    this.router.navigateByUrl('/homepage');
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  getCurrentUser(): AppUser | null {
    return this._currentUser.value;
  }

  isLoggedIn(): boolean {
    return !!this._currentUser.value;
  }

  isHost(): boolean {
    return this._currentUser.value?.role === 'host';
  }

  // ── Mock user store ──────────────────────────────────────────────────────────
  private getMockUsers(): MockUser[] {
    try { return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]'); } catch { return []; }
  }

  private saveMockUser(user: MockUser) {
    const users = this.getMockUsers();
    users.push(user);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  // ── Legacy compat (for pages still using old ApiService.register/login) ─────
  /** @deprecated Use signUp() instead */
  async register(payload: any): Promise<AppUser> {
    return this.signUp({
      full_name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'guest',
      businessName: payload.businessName,
    });
  }

  /** @deprecated Use signIn() instead */
  async login(payload: any): Promise<AppUser> {
    return this.signIn(payload.email || payload.identifier, payload.password);
  }
}

