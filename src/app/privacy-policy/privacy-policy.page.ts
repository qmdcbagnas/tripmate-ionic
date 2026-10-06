import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonContent, IonIcon } from '@ionic/angular';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, IonIcon, CommonModule, AuthButtonsComponent]
})
export class PrivacyPolicyPage implements OnInit {
  constructor() {}
  ngOnInit() { }
}

