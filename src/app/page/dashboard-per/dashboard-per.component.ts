import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs/operators';

// Assurez-vous que HeaderComponent et FooterComponent sont standalone avant de les importer ici
import { HeaderComponent } from '../../constantes/header/header.component';
import { FooterComponent } from '../../constantes/footer/footer.component';

@Component({
  selector: 'app-dashboard-per',
  standalone: true,
  templateUrl: './dashboard-per.component.html',
  styleUrls: ['./dashboard-per.component.css'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderComponent, FooterComponent,RouterLink],
})
export class DashboardPerComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.handleFragment();
    
    // Écoute des changements d'URL pour détecter les fragments dynamiquement
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleFragment();
      });
  }

  // Gestion du fragment pour afficher la bonne section
  handleFragment() {
    const fragment = this.router.parseUrl(this.router.url).fragment;
    const allSections = document.querySelectorAll('.content-section');

    // Masquer toutes les sections par défaut
    allSections.forEach((section) => {
      (section as HTMLElement).style.display = 'none';
    });

    // Afficher la section correspondant au fragment
    if (fragment) {
      const targetSection = document.getElementById(fragment);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    }
  }
}
