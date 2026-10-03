import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaysPage } from './stays.page';

describe('StaysPage', () => {
  let component: StaysPage;
  let fixture: ComponentFixture<StaysPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StaysPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
