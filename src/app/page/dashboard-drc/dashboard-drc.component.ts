import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/constantes/header/header.component';
import { CohorteService } from '../../services/cohorte.service';
import { CandidatureService } from '../../services/candidature.service';
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
  selector: 'app-dashboard-drc',
  imports: [CommonModule, RouterLink, HeaderComponent, ReactiveFormsModule],
  templateUrl: './dashboard-drc.component.html',
  styleUrls: ['./dashboard-drc.component.css'],
})
export class DashboardDrcComponent implements OnInit {
  cohortes: any[] = []; // Liste des cohortes
  candidatures: any[] = []; // Liste des candidatures
  cohorteForm: FormGroup; // Formulaire pour les cohortes
  isEditMode = false; // Mode édition pour les cohortes
  selectedCohorteId: number | null = null; // ID de la cohorte sélectionnée

  constructor(
    private cohorteService: CohorteService,
    private candidatureService: CandidatureService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Formulaire pour les cohortes avec validateur personnalisé
    this.cohorteForm = this.fb.group(
      {
        annee: ['', Validators.required],
        dateOuverture: ['', Validators.required],
        dateSemiCloture: ['', Validators.required],
        dateClotureDef: ['', Validators.required],
      },
      { validators: this.dateOrderValidator }
    );
  }

  ngOnInit(): void {
    this.loadCohortes(); // Chargez les cohortes au démarrage
    this.loadCandidatures(); // Chargez les candidatures au démarrage
    this.handleFragment(); // Gérez les fragments d'URL
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleFragment();
      }
    });
  }

  // Gérer les fragments d'URL pour afficher les sections appropriées
  handleFragment(): void {
    const fragment = this.route.snapshot.fragment;
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

  // Charger les cohortes
  loadCohortes(): void {
    this.cohorteService.getAllCohortes().subscribe((data) => {
      this.cohortes = data;
    });
  }

  // Charger les candidatures
  loadCandidatures(): void {
    this.candidatureService.getAllCandidatures().subscribe((data) => {
      this.candidatures = data;
    });
  }

  // Validateur personnalisé pour vérifier l'ordre des dates
  dateOrderValidator(form: FormGroup) {
    const dateOuverture = form.get('dateOuverture')?.value;
    const dateSemiCloture = form.get('dateSemiCloture')?.value;
    const dateClotureDef = form.get('dateClotureDef')?.value;

    if (dateOuverture && dateSemiCloture && dateOuverture > dateSemiCloture) {
      return { dateOrder: 'La date d\'ouverture doit être antérieure à la date de semi-clôture.' };
    }
    if (dateSemiCloture && dateClotureDef && dateSemiCloture > dateClotureDef) {
      return { dateOrder: 'La date de semi-clôture doit être antérieure à la date de clôture définitive.' };
    }
    return null;
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

  // Soumettre le formulaire des cohortes
  onSubmit(): void {
    if (this.cohorteForm.valid) {
      const cohorte = this.cohorteForm.value;
  
      // Vérifier si une cohorte existe déjà pour cette année
      this.cohorteService.checkCohorteExistsByAnnee(cohorte.annee).subscribe((exists) => {
        if (exists && !this.isEditMode) {
          alert('Une cohorte existe déjà pour cette année.');
          return;
        }
  
        if (this.isEditMode && this.selectedCohorteId) {
          this.cohorteService.updateCohorte(this.selectedCohorteId, cohorte).subscribe(
            () => {
              alert('Cohorte mise à jour avec succès !');
              this.loadCohortes();
              this.resetForm();
              // Fermer la modale
              const modal = document.getElementById('cohorteModal');
              if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                  backdrop.remove();
                }
              }
            },
            (error) => {
              alert('Erreur : ' + error.error);
            }
          );
        } else {
          this.cohorteService.createCohorte(cohorte).subscribe(
            () => {
              alert('Cohorte créée avec succès !');
              this.loadCohortes();
              this.resetForm();
              // Fermer la modale
              const modal = document.getElementById('cohorteModal');
              if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                  backdrop.remove();
                }
              }
            },
            (error) => {
              alert('Erreur : ' + error.error);
            }
          );
        }
      });
    }
  }

  // Éditer une cohorte
  editCohorte(cohorte: any): void {
    this.isEditMode = true;
    this.selectedCohorteId = cohorte.id;
    this.cohorteForm.patchValue({
      annee: cohorte.annee,
      dateOuverture: cohorte.dateOuverture,
      dateSemiCloture: cohorte.dateSemiCloture,
      dateClotureDef: cohorte.dateClotureDef,
    });
  }

  // Supprimer une cohorte
  deleteCohorte(id: number): void {
    this.cohorteService.deleteCohorte(id).subscribe(() => {
      this.loadCohortes();
    });
  }

  // Supprimer une candidature
  deleteCandidature(id: number): void {
    this.candidatureService.deleteCandidature(id).subscribe(() => {
      this.loadCandidatures();
    });
  }

  // Réinitialiser le formulaire des cohortes
  resetForm(): void {
    this.cohorteForm.reset();
    this.isEditMode = false;
    this.selectedCohorteId = null;
  }
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