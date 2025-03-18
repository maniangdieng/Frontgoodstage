import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CandidatureService } from '../../services/candidature.service';

// Assurez-vous que HeaderComponent et FooterComponent sont standalone avant de les importer ici
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

@Component({
  selector: 'app-dashboard-per',
  standalone: true,
  templateUrl: './dashboard-per.component.html',
  styleUrls: ['./dashboard-per.component.css'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderComponent, FooterComponent, RouterLink],
})
export class DashboardPerComponent implements OnInit {
  candidatureForm: FormGroup;
  selectedFiles: { [key: string]: File } = {};
  cohortes: Cohorte[] = []; // Liste des cohortes disponibles
  utilisateurs: Utilisateur[] = []; // Liste de tous les utilisateurs
  errorMessage: string | null = null; // Pour afficher les messages d'erreur
  user: any;
  candidatures: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private candidatureService: CandidatureService,
    private authService: AuthService // Injection du service d'authentification
  ) {
    // Initialisation du formulaire réactif
    this.candidatureForm = this.fb.group({
      cohorteId: ['', Validators.required],
      personnelId: [this.authService.getUser()?.id, Validators.required], // Utiliser l'ID de l'utilisateur connecté
      dateDepot: [''], // La date de dépôt sera automatiquement définie
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      destination: ['', Validators.required],
    });
  }

  ngOnInit() {

      // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.authService.logout(); // Rediriger vers la page de connexion
      return;
    }

      // Récupérer l'utilisateur connecté
    this.user = this.authService.getUser();
    console.log('Utilisateur connecté :', this.user);


    // Charger les données nécessaires
    this.handleFragment();
    this.loadCohortes(); // Charger les cohortes au démarrage
    this.loadUtilisateurs(); // Charger tous les utilisateurs au démarrage
    this.loadCandidatures(); // Charger les candidatures de l'utilisateur connecté

    // Charger la cohorte en cours (année en cours)
    const currentYear = new Date().getFullYear();
    this.loadCurrentCohorte(currentYear);

    // Afficher les informations de l'utilisateur dans la console pour le débogage
    console.log('Utilisateur connecté :', this.user);

    // Écoute des changements d'URL pour détecter les fragments dynamiquement
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleFragment();
      });
  }

  // Charger les candidatures de l'utilisateur connecté
  loadCandidatures() {
    if (this.user && this.user.id) {
      this.candidatureService.getMesCandidatures(this.user.id).subscribe(
        (data) => {
          this.candidatures = data;
        },
        (error) => {
          console.error('Erreur lors de la récupération des candidatures', error);
        }
      );
    } else {
      console.error('Utilisateur non connecté ou ID non disponible');
    }
  }

  // Supprimer une candidature
  supprimerCandidature(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      this.candidatureService.deleteCandidature(id).subscribe(
        () => {
          this.loadCandidatures(); // Recharger la liste après suppression
        },
        (error) => {
          console.error('Erreur lors de la suppression de la candidature', error);
        }
      );
    }
  }

  // Modifier une candidature
  modifierCandidature(id: number) {
    this.router.navigate(['/modifier-candidature', id]);
  }

  // Charger les cohortes depuis le back-end
  loadCohortes() {
    this.http.get<Cohorte[]>('http://localhost:8080/api/cohortes').subscribe(
      (data) => {
        this.cohortes = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des cohortes :', error);
      }
    );
  }

  // Charger tous les utilisateurs depuis le back-end
  loadUtilisateurs() {
    this.http.get<Utilisateur[]>('http://localhost:8080/api/utilisateurs').subscribe(
      (data) => {
        this.utilisateurs = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs :', error);
      }
    );
  }

  // Charger la cohorte en cours
  loadCurrentCohorte(annee: number) {
    this.http.get<Cohorte[]>(`http://localhost:8080/api/cohortes?annee=${annee}`).subscribe(
      (data) => {
        if (data.length > 0) {
          this.candidatureForm.get('cohorteId')?.setValue(data[0].id); // Sélectionner la cohorte en cours
        } else {
          console.warn(`Aucune cohorte trouvée pour l'année ${annee}.`);
        }
      },
      (error) => {
        console.error('Erreur lors du chargement de la cohorte en cours :', error);
      }
    );
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

  // Gestion de la sélection des fichiers
  onFileChange(event: any, fieldName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFiles[fieldName] = file;
    }
  }

  // Soumission du formulaire
  onSubmit() {
    this.errorMessage = null; // Réinitialiser le message d'erreur
  
    if (this.candidatureForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
  
    // Définir la date de dépôt automatiquement
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.candidatureForm.get('dateDepot')?.setValue(today);
  
    // Récupérer la cohorte sélectionnée
    const selectedCohorteId = this.candidatureForm.get('cohorteId')?.value;
    const selectedCohorte = this.cohortes.find((c) => c.id === selectedCohorteId);
  
    if (!selectedCohorte) {
      this.errorMessage = 'Veuillez sélectionner une cohorte valide.';
      return;
    }
  
    // Vérifier que la date de dépôt est dans la période de la cohorte
    const dateDepot = new Date(this.candidatureForm.get('dateDepot')?.value);
    const dateOuverture = new Date(selectedCohorte.dateOuverture);
    const dateClotureDef = new Date(selectedCohorte.dateClotureDef);
  
    if (dateDepot < dateOuverture) {
      this.errorMessage = 'La date de dépôt est antérieure à la date d\'ouverture de la cohorte.';
      return;
    }
    if (dateDepot > dateClotureDef) {
      this.errorMessage = 'La date de dépôt est postérieure à la date de clôture définitive de la cohorte.';
      return;
    }
  
    // Vérifier les documents requis en fonction du statut de l'enseignant
    if (this.isEnseignantNouveau() && !this.selectedFiles['arreteTitularisation']) {
      this.errorMessage = 'Un arrêté de titularisation est requis pour les nouveaux enseignants.';
      return;
    }
    if (this.isEnseignantAncien() && !this.selectedFiles['justificatifPrecedentVoyage']) {
      this.errorMessage = 'Un justificatif du précédent voyage est requis pour les anciens enseignants.';
      return;
    }
  
    // Créer un objet JSON avec les données du formulaire
    const candidatureData = {
      cohorteId: selectedCohorteId,
      personnelId: this.user.id, // Utiliser l'ID de l'utilisateur connecté
      dateDepot: today,
      dateDebut: this.candidatureForm.get('dateDebut')?.value,
      dateFin: this.candidatureForm.get('dateFin')?.value,
      destination: this.candidatureForm.get('destination')?.value,
    };
  
    // Convertir le formulaire en JSON
    const candidatureJson = JSON.stringify(candidatureData);
    console.log('JSON envoyé :', candidatureJson); // Afficher le JSON dans la console
  
    // Créer un objet FormData pour envoyer les fichiers
    const formData = new FormData();
    formData.append('candidature', new Blob([candidatureJson], { type: 'application/json' }));
  
    // Ajouter les fichiers avec les clés attendues par le backend
    if (this.isEnseignantNouveau() && this.selectedFiles['arreteTitularisation']) {
      formData.append('arreteTitularisation', this.selectedFiles['arreteTitularisation']);
    }
    if (this.isEnseignantAncien() && this.selectedFiles['justificatifPrecedentVoyage']) {
      formData.append('justificatifPrecedentVoyage', this.selectedFiles['justificatifPrecedentVoyage']);
    }
  
    // Envoi des données au back-end
    this.http.post('http://localhost:8080/api/candidatures', formData, {
      headers: { 'Accept': 'application/json' }
    }).subscribe(
      (response) => {
        alert('Candidature soumise avec succès !');
        this.router.navigate(['/suivi-candidatures']);
      },
      (error) => {
        console.error('Erreur lors de la soumission :', error);
        if (error.error) {
          this.errorMessage = error.error; // Afficher le message d'erreur
        } else {
          this.errorMessage = 'Une erreur s\'est produite lors de la soumission de la candidature.';
        }
      }
    );
  }
  logout() {
    this.authService.logout();
  }
// Méthode pour vérifier si l'enseignant est nouveau
isEnseignantNouveau(): boolean {
  // Supposons que vous avez une méthode dans le backend pour vérifier si l'enseignant a déjà effectué un voyage
  // Ici, nous simulons cette vérification en utilisant une propriété de l'utilisateur connecté
  return !this.user?.hasVoyageValide; // Si l'utilisateur n'a pas de voyage validé, il est nouveau
}

// Méthode pour vérifier si l'enseignant est ancien
isEnseignantAncien(): boolean {
  return !this.isEnseignantNouveau(); // Si l'utilisateur a déjà effectué un voyage, il est ancien
}
}