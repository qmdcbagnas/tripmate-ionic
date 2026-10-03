import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class WishlistPage implements OnInit {
  propertyData: any = {
      "happy-hut": {
          id: "happy-hut", name: "Happy Hut", type: "Cabin",
          location: "San Felipe, Zambales", price: 2000, rating: 4.92, reviews: 86, guests: 4,
          img: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/630810990.jpg?k=f0a258fd952f19c7285f4e99e64664bc423cd779166b639a29d87037cb90b2ac&o="
      }
  };
  wishlist: any[] = [];
  currentSort: string = 'recent';
  currentView: string = 'grid';

  constructor() {}

  ngOnInit() {
      // Mock data for test
      this.wishlist = [
          { propertyId: 'happy-hut', savedAt: new Date().toISOString() }
      ];
      this.sortWishlist();
  }

  getProperty(id: string) {
      return this.propertyData[id];
  }

  sortWishlist() {
      this.wishlist.sort((a, b) => {
          const propA = this.propertyData[a.propertyId] || { price: 0, rating: 0 };
          const propB = this.propertyData[b.propertyId] || { price: 0, rating: 0 };
          
          if (this.currentSort === 'price-asc') return propA.price - propB.price;
          if (this.currentSort === 'price-desc') return propB.price - propA.price;
          if (this.currentSort === 'rating') return propB.rating - propA.rating;
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
  }

  onSortChange() {
      this.sortWishlist();
  }

  setView(view: string) {
      this.currentView = view;
  }

  removeFromWishlist(id: string) {
      this.wishlist = this.wishlist.filter(w => w.propertyId !== id);
  }
}


