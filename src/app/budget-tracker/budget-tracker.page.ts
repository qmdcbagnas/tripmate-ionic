import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote } from '@ionic/angular';

@Component({
  selector: 'app-budget-tracker',
  templateUrl: './budget-tracker.page.html',
  styleUrls: ['./budget-tracker.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote]
})
export class BudgetTrackerPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}



