import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { FooterComponent } from 'src/app/constantes/footer/footer.component';
import { HeaderComponent } from 'src/app/constantes/header/header.component';
import { CandidatureService } from '../../services/candidature.service';

// Définir une interface pour les candidatures
interface Candidature {
  id: number;
  dateDepot: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  destination: string;
  cohorteAnnee: string;
  personnelNom: string;
  personnelPrenom: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-drh',
  imports: [CommonModule, RouterModule, FooterComponent, HeaderComponent],
  templateUrl: './dashboard-drh.component.html',
  styleUrls: ['./dashboard-drh.component.css']
})
export class DashboardDrhComponent implements OnInit {
  candidatures: Candidature[] = []; // Utilisation de l'interface Candidature

  constructor(private router: Router, private candidatureService: CandidatureService) {}

  ngOnInit(): void {
    // Gestion des fragments dans l'URL
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.handleFragment();
      }
    });

    // Charger les candidatures validées
    this.loadCandidaturesValides();
  }

  // Gestion des fragments pour afficher la section correspondante
  handleFragment(): void {
    const fragment = this.router.parseUrl(this.router.url).fragment;
    if (fragment) {
      // Masquer toutes les sections
      document.querySelectorAll('.content-section').forEach((section) => {
        (section as HTMLElement).style.display = 'none';
      });

      // Afficher la section cible
      const targetSection = document.getElementById(fragment);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    }
  }

  // Charger les candidatures avec le statut "VALIDE"
  loadCandidaturesValides(): void {
    this.candidatureService.getCandidaturesByStatut('VALIDE').subscribe(
      (data) => {
        console.log('Données reçues :', data); // Inspectez les données
        this.candidatures = Array.isArray(data) ? data : []; // Assurez-vous que c'est un tableau
      },
      (error) => {
        console.error('Erreur lors de la récupération des candidatures', error);
      }
    );
  }
}