import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidatureService } from '../../services/candidature.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-modifier-candidature',
  templateUrl: './modifier-candidature.component.html',
  styleUrls: ['./modifier-candidature.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class ModifierCandidatureComponent implements OnInit {
  candidatureForm: FormGroup;
  candidatureId: number = 0; // Initialisation par défaut
  candidature: any;
  selectedFiles: { [key: string]: File } = {};

  constructor(
    private route: ActivatedRoute,
    private candidatureService: CandidatureService,
    private fb: FormBuilder
  ) {
    // Initialisation du formulaire réactif
    this.candidatureForm = this.fb.group({
      typeCandidature: ['', Validators.required],
      cohorteId: ['', Validators.required],
      personnelId: ['', Validators.required],
      dateDepot: [''],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      destination: ['', Validators.required],
      informationsVoyage: [''],
      reglesCohorte: [false],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    // Récupérer l'ID de la candidature depuis l'URL
    this.candidatureId = +(this.route.snapshot.paramMap.get('id') || 0);

    // Charger les données de la candidature
    this.candidatureService.getCandidatureById(this.candidatureId).subscribe(
      (data) => {
        this.candidature = data;
        this.candidatureForm.patchValue(data); // Remplir le formulaire avec les données existantes
      },
      (error) => {
        console.error('Erreur lors du chargement de la candidature', error);
      }
    );
  }

  // Gestion de la sélection des fichiers
  onFileChange(event: any, fieldName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFiles[fieldName] = file; // Stocker le fichier sélectionné
    }
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.candidatureForm.valid) {
      const updatedCandidature = { ...this.candidature, ...this.candidatureForm.value };

      // Créer un objet FormData pour envoyer les fichiers
      const formData = new FormData();
      formData.append('candidature', new Blob([JSON.stringify(updatedCandidature)], {
        type: 'application/json',
      }));

      // Ajouter les fichiers sélectionnés
      for (const key in this.selectedFiles) {
        if (this.selectedFiles.hasOwnProperty(key)) {
          formData.append('files', this.selectedFiles[key], this.selectedFiles[key].name);
        }
      }

      // Envoyer les données au backend
      this.candidatureService.updateCandidature(this.candidatureId, formData).subscribe(
        () => {
          alert('Candidature mise à jour avec succès !');
          // Rediriger vers la liste des candidatures
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la candidature', error);
        }
      );
    }
  }
}