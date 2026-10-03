import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetTrackerPage } from './budget-tracker.page';

describe('BudgetTrackerPage', () => {
  let component: BudgetTrackerPage;
  let fixture: ComponentFixture<BudgetTrackerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetTrackerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
