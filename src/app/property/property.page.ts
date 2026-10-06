import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
  imports: [
    AuthButtonsComponent,RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class PropertyPage implements OnInit {
  propertyData: any = {
      "happy-hut": {
          id: "happy-hut",
          name: "Happy Hut",
          type: "Cabin",
          location: "San Felipe, Zambales",
          price: 2000,
          rating: 4.92,
          reviewsCount: 86,
          guests: 4,
          amenities: ["Wifi", "Kitchen", "Beachfront", "Pet friendly"],
          images: [
              "https://cf.bstatic.com/xdata/images/hotel/max1024x768/630810990.jpg?k=f0a258fd952f19c7285f4e99e64664bc423cd779166b639a29d87037cb90b2ac&o=",
              "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=800&auto=format&fit=crop"
          ],
          description: "A charming beachfront cabin nestled in the coastal town of San Felipe, Zambales. Wake up to the sound of waves and enjoy stunning sunsets from your private patio. Perfect for couples or small families seeking a peaceful escape from the city.",
          host: {
              name: "Maria Santos",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
              joined: "2022",
              verified: true,
              responseRate: 98,
              responseTime: "within an hour"
          },
          houseRules: [
              "Check-in: 2:00 PM – 10:00 PM",
              "Check-out: 11:00 AM",
              "No smoking indoors",
              "No parties or events",
              "Pets allowed on request (additional fee may apply)",
              "Quiet hours: 10:00 PM – 7:00 AM"
          ],
          reviews: [
              {
                  id: 1,
                  author: "Juan Dela Cruz",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                  date: "2024-02-15",
                  rating: 5,
                  text: "Absolutely amazing stay! The cabin is exactly as pictured - clean, cozy, and right on the beach. Maria was an incredible host, very responsive and gave us great local recommendations for restaurants and hidden beaches. The sunset views from the patio were unforgettable. Will definitely return!"
              }
          ]
      }
  };

  property: any;
  mainImage: string = '';
  checkinDate: string = '';
  checkoutDate: string = '';
  guestCount: number = 1;
  minDate: string = '';
  minCheckoutDate: string = '';
  subtotal: number = 0;
  cleaningFee: number = 500;
  serviceFee: number = 0;
  total: number = 0;
  nights: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'] || 'happy-hut';
      this.property = this.propertyData[id] || this.propertyData['happy-hut'];
      this.mainImage = this.property.images[0];
      
      const today = new Date();
      this.minDate = today.toISOString().split("T")[0];
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.minCheckoutDate = tomorrow.toISOString().split("T")[0];
      
      if (params['checkin']) this.checkinDate = params['checkin'];
      if (params['checkout']) this.checkoutDate = params['checkout'];
      if (params['guests']) this.guestCount = Math.min(Math.max(parseInt(params['guests']), 1), this.property.guests);
      
      this.updateBreakdown();
    });
  }

  setMainImage(img: string) {
    this.mainImage = img;
  }

  getStarArray(rating: number) {
      return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 'full' : (i === Math.floor(rating) && rating % 1 >= 0.5 ? 'half' : 'empty'));
  }

  getRatingDistribution() {
      return [5, 4, 3, 2, 1].map(stars => {
          const count = this.property.reviews.filter((r:any) => r.rating === stars).length;
          const pct = this.property.reviews.length ? (count / this.property.reviews.length) * 100 : 0;
          return { stars, count, pct };
      });
  }

  onCheckinChange() {
      if (this.checkinDate) {
          const nextDay = new Date(this.checkinDate);
          nextDay.setDate(nextDay.getDate() + 1);
          this.minCheckoutDate = nextDay.toISOString().split("T")[0];
          if (this.checkoutDate && this.checkoutDate <= this.checkinDate) {
              this.checkoutDate = this.minCheckoutDate;
          }
      }
      this.updateBreakdown();
  }

  onCheckoutChange() {
      this.updateBreakdown();
  }

  updateBreakdown() {
      if (!this.checkinDate || !this.checkoutDate) {
          this.total = 0;
          return;
      }
      const start = new Date(this.checkinDate);
      const end = new Date(this.checkoutDate);
      this.nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      this.subtotal = this.property.price * this.nights;
      this.serviceFee = Math.round(this.subtotal * 0.08);
      this.total = this.subtotal + this.cleaningFee + this.serviceFee;
  }

  handleBooking() {
      if (!this.checkinDate || !this.checkoutDate) {
          alert("Please select dates.");
          return;
      }
      const currentUser = JSON.parse(localStorage.getItem("tripmate_user") || "null");
      if (!currentUser) {
          this.router.navigate(['/login'], { queryParams: { redirect: `/property?id=${this.property.id}&checkin=${this.checkinDate}&checkout=${this.checkoutDate}&guests=${this.guestCount}` } });
          return;
      }
      
      localStorage.setItem("trip_checkin", this.checkinDate);
      localStorage.setItem("trip_checkout", this.checkoutDate);
      this.router.navigate(['/booking'], { queryParams: { id: this.property.id, guests: this.guestCount } });
  }
}






