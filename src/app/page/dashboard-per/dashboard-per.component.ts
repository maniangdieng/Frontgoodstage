import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs/operators';

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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialisation du formulaire réactif
    this.candidatureForm = this.fb.group({
      typeCandidature: ['nouveau', Validators.required],
      cohorteId: ['', Validators.required],
      personnelId: ['', Validators.required],
      dateDepot: [''], // La date de dépôt sera automatiquement définie
      dateDebut: ['', Validators.required], // Nouveau champ
      dateFin: ['', Validators.required], // Nouveau champ
      destination: ['', Validators.required],
      informationsVoyage: [''],
      reglesCohorte: [false],
    });
  }

  ngOnInit() {
    this.handleFragment();
    this.loadCohortes(); // Charger les cohortes au démarrage
    this.loadUtilisateurs(); // Charger tous les utilisateurs au démarrage

    // Écoute des changements d'URL pour détecter les fragments dynamiquement
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleFragment();
      });
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

  // Gestion du changement de type de candidature
  onTypeChange() {
    const type = this.candidatureForm.get('typeCandidature')?.value;
    if (type === 'nouveau') {
      this.candidatureForm.get('informationsVoyage')?.setValidators([Validators.required]);
      this.candidatureForm.get('reglesCohorte')?.clearValidators();
    } else if (type === 'ancien') {
      this.candidatureForm.get('reglesCohorte')?.setValidators([Validators.requiredTrue]);
      this.candidatureForm.get('informationsVoyage')?.clearValidators();
    }
    this.candidatureForm.get('informationsVoyage')?.updateValueAndValidity();
    this.candidatureForm.get('reglesCohorte')?.updateValueAndValidity();
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
    if (this.candidatureForm.invalid) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
  
    // Convertir le formulaire en JSON
    const candidatureJson = JSON.stringify(this.candidatureForm.value);
    console.log('JSON envoyé :', candidatureJson); // Afficher le JSON dans la console
  
    // Créer un objet FormData pour envoyer les fichiers
    const formData = new FormData();
  
    // Ajouter les données de la candidature
    formData.append('candidature', new Blob([candidatureJson], {
      type: 'application/json', // Indiquer que cette partie est du JSON
    }));
  
    // Ajouter les fichiers PDF sélectionnés
    for (const key in this.selectedFiles) {
      if (this.selectedFiles.hasOwnProperty(key)) {
        formData.append('files', this.selectedFiles[key], this.selectedFiles[key].name);
      }
    }
  
    // Envoi des données au back-end
    this.http.post('http://localhost:8080/api/candidatures', formData, {
      headers: { 'Accept': 'application/json' } // Définir explicitement les en-têtes
    }).subscribe(
      (response) => {
        alert('Candidature soumise avec succès !');
        this.router.navigate(['/suivi-candidatures']);
      },
      (error) => {
        console.error('Erreur lors de la soumission :', error);
        if (error.error && error.error.message) {
          alert(error.error.message); // Afficher le message d'erreur structuré
        } else {
          alert('Une erreur s\'est produite lors de la soumission de la candidature.');
        }
      }
    );
  }
}