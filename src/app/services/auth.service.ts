import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  type: string;
  businessName?: string;
  phone?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private USERS_KEY = "tripmate_users";
  private USER_KEY = "tripmate_user";
  private SESSION_KEY = "tripmate_session";

  getUsers(): User[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveUsers(users: User[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  findUser(email: string): User | null {
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized) return null;
    return this.getUsers().find(u => (u.email || "").toLowerCase() === normalized) || null;
  }

  findUserById(id: string): User | null {
    if (!id) return null;
    return this.getUsers().find(u => u.id === id) || null;
  }

  generateId(): string {
    return "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  createUser(data: Partial<User>): User {
    const users = this.getUsers();
    const user: User = {
      id: this.generateId(),
      name: data.name || '',
      email: (data.email || '').trim(),
      password: data.password,
      type: data.type || 'guest',
      businessName: data.businessName || "",
      phone: "",
    };
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  loginUser(user: User) {
    const { password, ...safeUser } = user;
    localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(true));
  }

  logoutUser() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  getCurrentUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem(this.SESSION_KEY);
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const { password, id: _ignoredId, ...safeUpdates } = updates as any;
    users[index] = { ...users[index], ...safeUpdates };
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.id === id) {
      const { password: _pw, ...safeUser } = users[index];
      localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));
    }

    const { password: _pw2, ...result } = users[index];
    return result;
  }
}
