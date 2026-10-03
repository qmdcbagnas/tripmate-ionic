import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class AboutPage implements OnInit, AfterViewInit {
  @ViewChildren('factFigure') factFigures!: QueryList<ElementRef>;
  formatter = new Intl.NumberFormat("en-PH");
  duration = 1400;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initFactsCounter();
    }
  }

  initFactsCounter() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;
    
    if (this.factFigures.length === 0) return;

    this.factFigures.forEach(elRef => {
        this.renderFact(elRef.nativeElement, 0);
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            this.factFigures.forEach(elRef => this.animateFact(elRef.nativeElement));
            obs.disconnect();
        });
    }, { threshold: 0.4 });

    const container = document.getElementById('facts');
    if (container) observer.observe(container);
  }

  renderFact(el: HTMLElement, value: number) {
      const suffix = el.dataset['suffix'] || "";
      el.textContent = this.formatter.format(Math.round(value)) + suffix;
  }

  animateFact(el: HTMLElement) {
      const target = Number(el.dataset['count']);
      const start = performance.now();

      const tick = (now: number) => {
          const progress = Math.min((now - start) / this.duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          this.renderFact(el, target * eased);
          if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
  }
}


