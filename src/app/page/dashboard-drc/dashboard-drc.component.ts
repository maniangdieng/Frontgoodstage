import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/constantes/header/header.component';
import { CohorteService } from '../../services/cohorte.service';
import { CandidatureService } from '../../services/candidature.service';

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
}