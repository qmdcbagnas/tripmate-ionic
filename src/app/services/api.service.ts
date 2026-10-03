import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private TRIPMATE_TOKEN_KEY = "tripmate_access_token";
  private TRIPMATE_API_BASE = (window as any).TRIPMATE_API_BASE || "/api";

  isLocalDemoMode(): boolean {
    return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  }

  async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers: any = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = localStorage.getItem(this.TRIPMATE_TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(`${this.TRIPMATE_API_BASE}${path}`, { ...options, headers, signal: controller.signal });
    } catch (error: any) {
      if (error.name === "AbortError") throw new Error("API request timed out. Check the Netlify Function and Neon configuration.");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
    if (!response.ok) {
      const isHTML = /^\s*<!doctype html|^\s*<html/i.test(text);
      throw new Error(isHTML
        ? `API service unavailable (${response.status}). Check the Netlify Function deployment and API environment variables.`
        : data?.error || data?.message || `Request failed (${response.status})`);
    }
    return data;
  }

  async register(payload: any): Promise<any> {
    const health = await this.request("/health");
    if (!health?.databaseConfigured) {
      throw new Error(health?.databaseError || "Backend database is not configured. Set NETLIFY_DATABASE_URL or DATABASE_URL on the server.");
    }
    const result = await this.request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    if (!result?.token || !result?.user) throw new Error("The API returned an incomplete registration response.");
    localStorage.setItem(this.TRIPMATE_TOKEN_KEY, result.token);
    localStorage.setItem("tripmate_user", JSON.stringify(result.user));
    return result.user;
  }

  async login(payload: any): Promise<any> {
    let result;
    try {
      result = await this.request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
    } catch (error) {
      const identifier = String(payload?.identifier || payload?.email || "").trim().toLowerCase();
      if (!this.isLocalDemoMode() || identifier !== "admin" || payload?.password !== "admin1234") throw error;

      result = {
        token: "local-demo-admin",
        user: {
          id: "local-admin",
          name: "Administrator",
          username: "admin",
          email: "admin@tripmate.local",
          role: "admin",
          type: "guest"
        }
      };
    }
    if (!result?.token || !result?.user) throw new Error("The API returned an incomplete login response.");
    localStorage.setItem(this.TRIPMATE_TOKEN_KEY, result.token);
    localStorage.setItem("tripmate_user", JSON.stringify(result.user));
    localStorage.setItem("tripmate_session", "true");
    return result.user;
  }

  logout(): void {
    localStorage.removeItem(this.TRIPMATE_TOKEN_KEY);
    localStorage.removeItem("tripmate_user");
    localStorage.removeItem("tripmate_session");
  }
}
