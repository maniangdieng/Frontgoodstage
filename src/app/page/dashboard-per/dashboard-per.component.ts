import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Importer FormsModule pour ngModel
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CandidatureService } from '../../services/candidature.service';
import { HeaderComponent } from '../../constantes/header/header.component';
import { FooterComponent } from '../../constantes/footer/footer.component';

interface Cohorte {
  id: number;
  annee: number;
  dateOuverture: string;
  dateSemiCloture: string;
  dateClotureDef: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface Candidature {
  id: number;
  dateDepot: string;
  dateDebut: string;
  dateFin: string;
  destination: string;
  statut: string; // EN_ATTENTE, VALIDÉ, REFUSÉ
  commentaire: string;
  cohorteId: number;
  voyageEtude?: {
    statut: string; // EN_ATTENTE, EN_COURS, TERMINÉ
  };
}

@Component({
  selector: 'app-dashboard-per',
  standalone: true,
  templateUrl: './dashboard-per.component.html',
  styleUrls: ['./dashboard-per.component.css'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderComponent, FooterComponent, RouterLink, FormsModule], // Ajouter FormsModule ici
})
export class DashboardPerComponent implements OnInit {
  candidatureForm: FormGroup;
  selectedFiles: { [key: string]: File } = {};
  cohortes: Cohorte[] = [];
  utilisateurs: Utilisateur[] = [];
  errorMessage: string | null = null;
  user: any;
  candidatures: Candidature[] = [];
  candidaturesVoyagesEnCours: Candidature[] = [];
  selectedCandidatureId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private candidatureService: CandidatureService,
    private authService: AuthService
  ) {
    this.candidatureForm = this.fb.group({
      cohorteId: ['', Validators.required],
      personnelId: [this.authService.getUser()?.id, Validators.required],
      dateDepot: [''],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      destination: ['', Validators.required],
      typeCandidature: [this.isEnseignantNouveau() ? 'nouveau' : 'ancien', Validators.required],
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }

    this.user = this.authService.getUser();
    console.log('Utilisateur connecté :', this.user);

    this.handleFragment();
    this.loadCohortes();
    this.loadUtilisateurs();
    this.loadCandidatures();

    const currentYear = new Date().getFullYear();
    this.loadCurrentCohorte(currentYear);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.handleFragment());
  }

  loadCandidatures() {
    if (this.user && this.user.id) {
      this.candidatureService.getMesCandidatures(this.user.id).subscribe(
        (data: Candidature[]) => {
          console.log('Détails des candidatures reçus :', data);
          this.candidatures = data;
          this.candidaturesVoyagesEnCours = data.filter(c => c.voyageEtude && c.voyageEtude.statut === 'EN_COURS');
        },
        (error) => console.error('Erreur lors de la récupération des candidatures', error)
      );
    } else {
      console.error('Utilisateur non connecté ou ID non disponible');
    }
  }

  isCohorteCloturee(cohorteId: number): boolean {
    const cohorte = this.cohortes.find(c => c.id === cohorteId);
    if (!cohorte) return true;
    const dateCloture = new Date(cohorte.dateClotureDef);
    const aujourdHui = new Date();
    return aujourdHui > dateCloture;
  }

  supprimerCandidature(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      this.candidatureService.deleteCandidature(id).subscribe(
        () => this.loadCandidatures(),
        (error) => console.error('Erreur lors de la suppression', error)
      );
    }
  }

  modifierCandidature(id: number) {
    const candidature = this.candidatures.find(c => c.id === id);
    if (!candidature) {
      console.error('Candidature non trouvée');
      return;
    }
    if (this.isCohorteCloturee(candidature.cohorteId)) {
      alert('La date de clôture de la cohorte est passée.');
      return;
    }
    this.router.navigate(['/modifier-candidature', id]);
  }

  loadCohortes() {
    this.http.get<Cohorte[]>('http://localhost:8080/api/cohortes').subscribe(
      (data) => this.cohortes = data,
      (error) => console.error('Erreur lors du chargement des cohortes :', error)
    );
  }

  loadUtilisateurs() {
    this.http.get<Utilisateur[]>('http://localhost:8080/api/utilisateurs').subscribe(
      (data) => this.utilisateurs = data,
      (error) => console.error('Erreur lors du chargement des utilisateurs :', error)
    );
  }

  loadCurrentCohorte(annee: number) {
    this.http.get<Cohorte[]>(`http://localhost:8080/api/cohortes?annee=${annee}`).subscribe(
      (data) => {
        if (data.length > 0) {
          this.candidatureForm.get('cohorteId')?.setValue(data[0].id);
        } else {
          console.warn(`Aucune cohorte trouvée pour l'année ${annee}.`);
        }
      },
      (error) => console.error('Erreur lors du chargement de la cohorte en cours :', error)
    );
  }

  handleFragment() {
    const fragment = this.router.parseUrl(this.router.url).fragment;
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach((section) => (section as HTMLElement).style.display = 'none');
    if (fragment) {
      const targetSection = document.getElementById(fragment);
      if (targetSection) targetSection.style.display = 'block';
    }
  }

  onFileChange(event: any, fieldName: string) {
    if (event.target.files.length > 0) {
      this.selectedFiles[fieldName] = event.target.files[0];
    }
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.candidatureForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    this.candidatureForm.get('dateDepot')?.setValue(today);

    const selectedCohorteId = this.candidatureForm.get('cohorteId')?.value;
    const selectedCohorte = this.cohortes.find((c) => c.id === selectedCohorteId);

    if (!selectedCohorte) {
      this.errorMessage = 'Veuillez sélectionner une cohorte valide.';
      return;
    }

    const dateDepot = new Date(this.candidatureForm.get('dateDepot')?.value);
    const dateOuverture = new Date(selectedCohorte.dateOuverture);
    const dateClotureDef = new Date(selectedCohorte.dateClotureDef);

    if (dateDepot < dateOuverture || dateDepot > dateClotureDef) {
      this.errorMessage = 'La date de dépôt est hors de la période de la cohorte.';
      return;
    }

    if (this.isEnseignantNouveau() && !this.selectedFiles['arreteTitularisation']) {
      this.errorMessage = 'Un arrêté de titularisation est requis pour les nouveaux enseignants.';
      return;
    }
    if (this.isEnseignantAncien() && !this.selectedFiles['justificatifPrecedentVoyage']) {
      this.errorMessage = 'Un justificatif du précédent voyage est requis pour les anciens enseignants.';
      return;
    }

    const candidatureData = {
      cohorteId: selectedCohorteId,
      personnelId: this.user.id,
      dateDepot: today,
      dateDebut: this.candidatureForm.get('dateDebut')?.value,
      dateFin: this.candidatureForm.get('dateFin')?.value,
      destination: this.candidatureForm.get('destination')?.value,
    };

    const candidatureJson = JSON.stringify(candidatureData);
    console.log('JSON envoyé :', candidatureJson);

    const formData = new FormData();
    formData.append('candidature', new Blob([candidatureJson], { type: 'application/json' }));
    if (this.isEnseignantNouveau() && this.selectedFiles['arreteTitularisation']) {
      formData.append('arreteTitularisation', this.selectedFiles['arreteTitularisation']);
    }
    if (this.isEnseignantAncien() && this.selectedFiles['justificatifPrecedentVoyage']) {
      formData.append('justificatifPrecedentVoyage', this.selectedFiles['justificatifPrecedentVoyage']);
    }

    this.http.post('http://localhost:8080/api/candidatures', formData, { headers: { 'Accept': 'application/json' } }).subscribe(
      (response) => {
        alert('Candidature soumise avec succès !');
        this.router.navigate(['/suivi-candidatures']);
        this.loadCandidatures();
      },
      (error) => {
        console.error('Erreur lors de la soumission :', error);
        this.errorMessage = error.error || 'Une erreur s’est produite lors de la soumission.';
      }
    );
  }

  onCandidatureChange(event: Event) { // Ajouter un paramètre typé Event
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCandidatureId = selectElement.value ? Number(selectElement.value) : null;
    this.selectedFiles = {};
  }

  onSubmitRapportVoyage() {
    if (!this.selectedCandidatureId) {
      this.errorMessage = 'Veuillez sélectionner une candidature.';
      return;
    }

    if (!this.selectedFiles['carteEmbarquement'] || !this.selectedFiles['rapportVoyage']) {
      this.errorMessage = 'La carte d’embarquement et le rapport du voyage sont requis.';
      return;
    }

    const formData = new FormData();
    formData.append('candidatureId', this.selectedCandidatureId.toString());
    formData.append('carteEmbarquement', this.selectedFiles['carteEmbarquement']);
    if (this.selectedFiles['justificatifDestination']) {
      formData.append('justificatifDestination', this.selectedFiles['justificatifDestination']);
    }
    formData.append('rapportVoyage', this.selectedFiles['rapportVoyage']);

    this.http.post('http://localhost:8080/api/candidatures/rapport-voyage', formData).subscribe(
      (response) => {
        alert('Justificatifs et rapport soumis avec succès !');
        this.selectedCandidatureId = null;
        this.selectedFiles = {};
        this.loadCandidatures();
      },
      (error) => {
        console.error('Erreur lors de la soumission du rapport :', error);
        this.errorMessage = error.error || 'Une erreur s’est produite lors de la soumission.';
      }
    );
  }

  logout() {
    this.authService.logout();
  }

  isEnseignantNouveau(): boolean {
    return !this.candidatures.some(c => c.voyageEtude && c.voyageEtude.statut === 'TERMINÉ');
  }

  isEnseignantAncien(): boolean {
    return !this.isEnseignantNouveau();
  }
}