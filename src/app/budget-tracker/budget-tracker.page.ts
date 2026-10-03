import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  addOutline,
  walletOutline,
  cardOutline,
  cashOutline,
  bedOutline,
  airplaneOutline,
  restaurantOutline,
  mapOutline
} from 'ionicons/icons';


@Component({
  selector: 'app-budget-tracker',
  templateUrl: './budget-tracker.page.html',
  styleUrls: ['./budget-tracker.page.scss'],

  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonButton,
    IonIcon
  ]
})

export class BudgetTrackerPage implements OnInit {

  constructor() {

    addIcons({
      addOutline,
      walletOutline,
      cardOutline,
      cashOutline,
      bedOutline,
      airplaneOutline,
      restaurantOutline,
      mapOutline
    });

  }

  ngOnInit() {
  }

}