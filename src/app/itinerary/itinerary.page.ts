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
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  addOutline,
  calendarOutline,
  locationOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-itinerary',
  templateUrl: './itinerary.page.html',
  styleUrls: ['./itinerary.page.scss'],

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule
  ]
})

export class ItineraryPage implements OnInit {

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      locationOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit() {
  }

}