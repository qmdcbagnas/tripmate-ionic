import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Expense {
  id: string;
  itinerary_id: string;
  category: 'Accommodation' | 'Food' | 'Transport' | 'Activities' | 'Shopping' | 'Other';
  amount: number;
  description?: string;
  date: string;
  created_at?: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  remaining: number;
  by_category: Record<string, number>;
}

const MOCK_EXPENSES_KEY = 'tripmate_mock_expenses';

const MOCK_EXPENSES_SEED: Expense[] = [
  { id: 'exp-1', itinerary_id: 'itin-1', category: 'Accommodation', amount: 12500, description: 'Batan Island Villa (5 nights)', date: '2025-12-20' },
  { id: 'exp-2', itinerary_id: 'itin-1', category: 'Transport', amount: 2800, description: 'Round-trip flights', date: '2025-12-20' },
  { id: 'exp-3', itinerary_id: 'itin-1', category: 'Food', amount: 1500, description: 'Local restaurants & cafes', date: '2025-12-21' },
  { id: 'exp-4', itinerary_id: 'itin-1', category: 'Activities', amount: 800, description: 'Island tour', date: '2025-12-22' },
  { id: 'exp-5', itinerary_id: 'itin-1', category: 'Shopping', amount: 400, description: 'Souvenirs', date: '2025-12-23' },
];

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  private getMockExpenses(): Expense[] {
    try { return JSON.parse(localStorage.getItem(MOCK_EXPENSES_KEY) || 'null') ?? MOCK_EXPENSES_SEED; }
    catch { return MOCK_EXPENSES_SEED; }
  }

  private saveMockExpenses(expenses: Expense[]) {
    localStorage.setItem(MOCK_EXPENSES_KEY, JSON.stringify(expenses));
  }

  async getExpensesByItinerary(itineraryId: string): Promise<Expense[]> {
    if (environment.USE_MOCK_DATA) {
      return this.getMockExpenses().filter(e => e.itinerary_id === itineraryId);
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('date', { ascending: false });

    if (error) { console.error('BudgetService.getExpenses:', error); return []; }
    return data ?? [];
  }

  async addExpense(expense: Partial<Expense>): Promise<Expense | null> {
    if (environment.USE_MOCK_DATA) {
      const n: Expense = {
        id: 'exp-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        ...expense as Expense,
      };
      const all = this.getMockExpenses();
      all.push(n);
      this.saveMockExpenses(all);
      return n;
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    if (environment.USE_MOCK_DATA) {
      this.saveMockExpenses(this.getMockExpenses().filter(e => e.id !== expenseId));
      return;
    }

    const { error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw new Error(error.message);
  }

  async getBudgetSummary(itineraryId: string, totalBudget: number): Promise<BudgetSummary> {
    const expenses = await this.getExpensesByItinerary(itineraryId);
    const by_category: Record<string, number> = {};
    let total_spent = 0;

    for (const e of expenses) {
      total_spent += e.amount;
      by_category[e.category] = (by_category[e.category] || 0) + e.amount;
    }

    return {
      total_budget: totalBudget,
      total_spent,
      remaining: totalBudget - total_spent,
      by_category,
    };
  }
}
