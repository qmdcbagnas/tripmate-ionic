import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.page.html',
  styleUrls: ['./how-it-works.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class HowItWorksPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}




