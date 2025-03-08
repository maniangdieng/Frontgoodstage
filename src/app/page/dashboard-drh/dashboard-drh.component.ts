import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { FooterComponent } from 'src/app/constantes/footer/footer.component';
import { HeaderComponent } from 'src/app/constantes/header/header.component';

@Component({
  standalone: true,
  selector: 'app-dashboard-drh',
  imports: [CommonModule, RouterModule,FooterComponent,HeaderComponent],
  templateUrl: './dashboard-drh.component.html',
  styleUrls: ['./dashboard-drh.component.css']
})
export class DashboardDrhComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.handleFragment();
      }
    });
  }

  handleFragment(): void {
    const fragment = this.router.parseUrl(this.router.url).fragment;
    if (fragment) {
      document.querySelectorAll('.content-section').forEach((section) => {
        (section as HTMLElement).style.display = 'none';
      });

      const targetSection = document.getElementById(fragment);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    }
  }
}
