import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton, IonButtons, IonButton, IonIcon, IonAccordionGroup, IonAccordion, IonList, IonItem, IonLabel } from '@ionic/angular';

@Component({
  selector: 'app-itinerary',
  templateUrl: './itinerary.page.html',
  styleUrls: ['./itinerary.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton, IonButtons, IonButton, IonIcon, IonAccordionGroup, IonAccordion, IonList, IonItem, IonLabel]
})
export class ItineraryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}



