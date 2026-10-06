import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonContent, IonIcon } from '@ionic/angular';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, peopleOutline, compassOutline } from 'ionicons/icons';

@Component({
  selector: 'app-about-company',
  templateUrl: './about-company.page.html',
  styleUrls: ['./about-company.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, IonIcon, CommonModule, AuthButtonsComponent]
})
export class AboutCompanyPage implements OnInit {
  constructor() { addIcons({ shieldCheckmarkOutline, peopleOutline, compassOutline }); }
  ngOnInit() { }
}

