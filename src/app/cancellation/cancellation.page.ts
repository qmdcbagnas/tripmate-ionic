import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-cancellation',
  templateUrl: './cancellation.page.html',
  styleUrls: ['./cancellation.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class CancellationPage implements OnInit {
  checkinDate: string = '';
  hasError: boolean = false;
  errorMessage: string = '';

  isEligible: boolean = false;
  deadlineText: string = '';
  showResult: boolean = false;

  openFaq: number | null = null;

  constructor() { }

  ngOnInit() {
  }

  toggleFaq(index: number) {
    if (this.openFaq === index) {
      this.openFaq = null;
    } else {
      this.openFaq = index;
    }
  }

  onDateChange() {
    this.hasError = false;
    this.errorMessage = '';
    
    if (!this.checkinDate) {
      this.showResult = false;
      return;
    }

    const value = this.checkinDate;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) {
        this.showResult = false;
        return;
    }
    const checkin = new Date(year, month - 1, day);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (isNaN(checkin.getTime())) {
        this.hasError = true;
        this.errorMessage = "Enter a valid date.";
        this.showResult = false;
        return;
    }

    if (checkin < today) {
        this.hasError = true;
        this.errorMessage = "Pick a check-in date that hasn't passed yet.";
        this.showResult = false;
        return;
    }

    const FREE_CANCEL_DAYS = 7;
    const deadline = new Date(checkin);
    deadline.setDate(deadline.getDate() - FREE_CANCEL_DAYS);
    
    this.isEligible = today <= deadline;
    this.deadlineText = deadline.toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    this.showResult = true;
  }
}


