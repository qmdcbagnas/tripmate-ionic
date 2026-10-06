import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutCompanyPage } from './about-company.page';

describe('AboutCompanyPage', () => {
  let component: AboutCompanyPage;
  let fixture: ComponentFixture<AboutCompanyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutCompanyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
