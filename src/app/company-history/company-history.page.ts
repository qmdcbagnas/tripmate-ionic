import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonContent, IonIcon } from '@ionic/angular';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';

@Component({
  selector: 'app-company-history',
  templateUrl: './company-history.page.html',
  styleUrls: ['./company-history.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, IonIcon, CommonModule, AuthButtonsComponent]
})
export class CompanyHistoryPage implements OnInit {
  constructor() { }
  ngOnInit() { }
}

