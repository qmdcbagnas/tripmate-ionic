import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, bedOutline, informationCircleOutline, keyOutline, mapOutline, walletOutline, calendarOutline, businessOutline, codeSlashOutline, mailOutline, addOutline, createOutline, trashOutline, airplaneOutline, restaurantOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, RouterLink],
})
export class AppComponent {
  constructor() {
    addIcons({ homeOutline, bedOutline, informationCircleOutline, keyOutline, mapOutline, walletOutline, calendarOutline, businessOutline, codeSlashOutline, mailOutline, addOutline, createOutline, trashOutline, airplaneOutline, restaurantOutline });
  }
}

