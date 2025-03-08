import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../constantes/header/header.component';
import { FooterComponent } from '../../constantes/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Importez HttpClientModule
import { CandidatureService } from '../../services/candidature.service.service'; // Importez le service


@Component({
  selector: 'app-dashboard-per',
  standalone: true,
  templateUrl: './dashboard-per.component.html',
  styleUrls: ['./dashboard-per.component.css'],
  imports: [RouterModule, HeaderComponent, FooterComponent, CommonModule, ReactiveFormsModule, HttpClientModule],
})
export class DashboardPerComponent implements OnInit {
  typeCandidat: string = ''; // Stocke le type de candidat sélectionné
  ancienForm: FormGroup; // Formulaire pour les anciens candidats
  nouveauForm: FormGroup; // Formulaire pour les nouveaux candidats

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private CandidatureService: CandidatureService // Injectez le service
  ) {
    // Initialisation du formulaire pour un ancien candidat
    this.ancienForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      justificatifs: [null, Validators.required], // Justificatifs du précédent voyage
      rapport: [null, Validators.required], // Rapport du dernier voyage
      lieu: ['', Validators.required], // Lieu du voyage
      periode: ['', Validators.required], // Période du voyage
    });

    // Initialisation du formulaire pour un nouveau candidat
    this.nouveauForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      titularisation: [null, Validators.required], // Arrêté de titularisation
      lieu: ['', Validators.required], // Lieu du voyage
      periode: ['', Validators.required], // Période du voyage
    });
  }

  ngOnInit() {

    // Écouter les événements de navigation
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
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

  // Méthode pour gérer le changement de type de candidat
  onTypeCandidatChange(event: any): void {
    this.typeCandidat = event.target.value;
  }

  // Méthode pour gérer la sélection de fichiers
  onFileSelected(event: any, field: string): void {
    const file = event.target.files[0];
    if (file) {
      if (this.typeCandidat === 'ancien') {
        this.ancienForm.get(field)?.setValue(file);
      } else if (this.typeCandidat === 'nouveau') {
        this.nouveauForm.get(field)?.setValue(file);
      }
    }
  }

  // Méthode pour soumettre le formulaire des anciens candidats
  onSubmitAncien(): void {
    if (this.ancienForm.valid) {
      const formData = new FormData();
      Object.keys(this.ancienForm.controls).forEach((key) => {
        formData.append(key, this.ancienForm.get(key)?.value);
      });

      // Envoyer les données au backend
      this.CandidatureService.soumettreAncienCandidature(formData).subscribe(
        (response) => {
          console.log('Réponse du backend :', response);
          alert('Candidature soumise avec succès !');
        },
        (error) => {
          console.error('Erreur lors de la soumission :', error);
          alert('Erreur lors de la soumission de la candidature.');
        }
      );
    } else {
      console.log('Formulaire ancien invalide');
    }
  }

  // Méthode pour soumettre le formulaire des nouveaux candidats
  onSubmitNouveau(): void {
    if (this.nouveauForm.valid) {
      const formData = new FormData();
      Object.keys(this.nouveauForm.controls).forEach((key) => {
        formData.append(key, this.nouveauForm.get(key)?.value);
      });

      // Envoyer les données au backend
      this.CandidatureService.soumettreNouveauCandidature(formData).subscribe(
        (response) => {
          console.log('Réponse du backend :', response);
          alert('Candidature soumise avec succès !');
        },
        (error) => {
          console.error('Erreur lors de la soumission :', error);
          alert('Erreur lors de la soumission de la candidature.');
        }
      );
    } else {
      console.log('Formulaire nouveau invalide');
    }
  }
}