import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonContent, IonIcon } from '@ionic/angular';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.page.html',
  styleUrls: ['./terms-of-service.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, IonIcon, CommonModule, AuthButtonsComponent]
})
export class TermsOfServicePage implements OnInit {
  constructor() {}
  ngOnInit() { }
}

