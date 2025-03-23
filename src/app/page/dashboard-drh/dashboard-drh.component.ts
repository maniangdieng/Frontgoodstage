import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { FooterComponent } from 'src/app/constantes/footer/footer.component';
import { HeaderComponent } from 'src/app/constantes/header/header.component';
import { CandidatureService } from '../../services/candidature.service';
import { HttpClient } from '@angular/common/http';


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
  arreteExiste: boolean;
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
      this.candidatures = Array.isArray(data) ? data : [];
      // Vérifier si un arrêté existe pour chaque candidature
      this.candidatures.forEach(candidature => {
        this.candidatureService.checkArreteExiste(candidature.id).subscribe(
          (arreteExiste) => {
            candidature.arreteExiste = arreteExiste;
          }
        );
      });
    },
    (error) => {
      console.error('Erreur lors de la récupération des candidatures', error);
    }
  );
}

etablirArrete(candidature: Candidature): void {
  this.candidatureService.etablirArrete(candidature.id).subscribe(
    (response) => {
      console.log(response); // Afficher la réponse du serveur
      alert('Arrêté établi avec succès !');
      this.loadCandidaturesValides(); // Recharger les candidatures
    },
    (error) => {
      console.error('Erreur lors de l\'établissement de l\'arrêté', error);
      alert('Erreur lors de l\'établissement de l\'arrêté : ' + error.message);
    }
  );
}

// Voir l'arrêté
voirArrete(candidature: Candidature): void {
  this.candidatureService.downloadArrete(candidature.id).subscribe(
    (response) => {
      // Ouvrir le PDF dans un nouvel onglet
      const fileURL = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    },
    (error) => {
      console.error('Erreur lors du téléchargement de l\'arrêté', error);
      alert('Erreur lors de l\'ouverture de l\'arrêté');
    }
  );
}
}