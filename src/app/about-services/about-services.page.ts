import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonContent, IonIcon } from '@ionic/angular';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { addIcons } from 'ionicons';
import { homeOutline, mapOutline, walletOutline, shieldCheckmarkOutline, cashOutline, heartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-about-services',
  templateUrl: './about-services.page.html',
  styleUrls: ['./about-services.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, IonIcon, CommonModule, AuthButtonsComponent]
})
export class AboutServicesPage implements OnInit {
  constructor() { addIcons({ homeOutline, mapOutline, walletOutline, shieldCheckmarkOutline, cashOutline, heartOutline }); }
  ngOnInit() { }
}

