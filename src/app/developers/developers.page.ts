import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons
} from '@ionic/angular';

@Component({
  selector: 'app-developers',
  templateUrl: './developers.page.html',
  styleUrls: ['./developers.page.scss'],
  imports: [
    AuthButtonsComponent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonMenuButton,
    IonButtons
  ]
})
export class DevelopersPage implements OnInit {

  constructor() {}

  ngOnInit() {}

}
