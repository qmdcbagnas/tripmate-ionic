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
  calendarOutline,
  locationOutline,
  peopleOutline,
  moonOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  starOutline
} from 'ionicons/icons';


@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],

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

export class ReservationsPage implements OnInit {

  constructor() {

    addIcons({
      calendarOutline,
      locationOutline,
      peopleOutline,
      moonOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      checkmarkOutline,
      starOutline
    });

  }

  ngOnInit() {
  }

}