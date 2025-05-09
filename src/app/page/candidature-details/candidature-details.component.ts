import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CandidatureService } from '../../services/candidature.service';
import { CommonModule, Location } from '@angular/common';
import { FooterComponent } from 'src/app/constantes/footer/footer.component';
import { HeaderComponent } from 'src/app/constantes/header/header.component';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-candidature-details',
  templateUrl: './candidature-details.component.html',
  styleUrls: ['./candidature-details.component.css'],
  imports: [CommonModule, RouterModule, FooterComponent, HeaderComponent, FormsModule],
})
export class CandidatureDetailsComponent implements OnInit {
  candidature: any = {}; // Détails de la candidature
  documents: any[] = []; // Liste des documents
  selectedDocumentUrl: SafeResourceUrl | null = null; // URL sécurisée pour l'aperçu

  constructor(
    private route: ActivatedRoute,
    private candidatureService: CandidatureService,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const candidatureId = this.route.snapshot.paramMap.get('id');
    if (candidatureId) {
      this.loadCandidatureDetails(+candidatureId);
    }
  }

  // Charger les détails de la candidature
  loadCandidatureDetails(candidatureId: number): void {
    this.candidatureService.getCandidatureById(candidatureId).subscribe({
      next: (data) => {
        console.log('Détails de la candidature reçus :', data);
        this.candidature = data;
        this.documents = data.documents || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de la candidature', err);
        alert('Impossible de charger les détails de la candidature.');
      },
    });
  }

  // Valider la candidature
  validateCandidature(): void {
    if (!this.candidature.statut || !this.candidature.commentaire) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.candidatureService.validateCandidature(this.candidature.id).subscribe({
      next: (response) => {
        alert('Candidature validée avec succès ! Un voyage a été créé.');
        this.loadCandidatureDetails(this.candidature.id); // Recharger les détails
      },
      error: (err) => {
        console.error('Erreur lors de la validation de la candidature', err);
        alert('Une erreur est survenue lors de la validation.');
      },
    });
  }

  // Mettre à jour la candidature
  // Dans CandidatureDetailsComponent
updateCandidature(): void {
  if (!this.candidature.statut || !this.candidature.commentaire) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  // Créer un FormData pour correspondre au backend
  const formData = new FormData();
  formData.append('candidature', JSON.stringify(this.candidature)); // JSON stringifié

  this.candidatureService.updateCandidature(this.candidature.id, formData).subscribe({
    next: (updatedCandidature) => {
      this.candidature = updatedCandidature; // Mettre à jour l'objet candidature local
      alert('Candidature mise à jour avec succès !');
      this.loadCandidatureDetails(this.candidature.id); // Recharger les détails
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour de la candidature', err);
      alert('Une erreur est survenue lors de la mise à jour.');
    },
  });
}

  // Télécharger un document
  downloadDocument(documentId: number): void {
    this.candidatureService.downloadDocument(documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        alert('Impossible de télécharger le document.');
      },
    });
  }

  // Aperçu d'un document
  previewDocument(documentId: number): void {
    const documentUrl = `http://localhost:8080/api/documents/${documentId}/preview`;
    this.selectedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
  
    fetch(documentUrl)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document non trouvé.');
          } else {
            throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}`);
          }
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement du document', error);
        alert(error.message); // Afficher un message d'erreur clair
      });
  }

  // Méthode pour revenir à la page précédente
  goBack(): void {
    this.location.back();
  }
}