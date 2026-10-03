import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BecomeHostPage } from './become-host.page';

describe('BecomeHostPage', () => {
  let component: BecomeHostPage;
  let fixture: ComponentFixture<BecomeHostPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BecomeHostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
