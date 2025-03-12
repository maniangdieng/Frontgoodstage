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
    private sanitizer: DomSanitizer // Pour sécuriser les URLs
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de la candidature depuis l'URL
    const candidatureId = this.route.snapshot.paramMap.get('id');

    if (candidatureId) {
      // Charger les détails de la candidature
      this.candidatureService.getCandidatureById(+candidatureId).subscribe((data) => {
        this.candidature = data;
        this.documents = data.documents ? data.documents : []; // Vérification conditionnelle
      });
    }
  }

  // Méthode pour revenir à la page précédente
  goBack(): void {
    this.location.back();
  }

  // Méthode pour mettre à jour la candidature
  updateCandidature(): void {
    this.candidatureService.updateCandidature(this.candidature.id, this.candidature).subscribe({
      next: (updatedCandidature) => {
        this.candidature = updatedCandidature; // Mettre à jour les données locales
        alert('Candidature mise à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la candidature', err);
        alert('Une erreur est survenue lors de la mise à jour.');
      },
    });
  }

  // Méthode pour télécharger un document
  downloadDocument(documentId: number, documentName: string): void {
    this.candidatureService.downloadDocument(documentId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Méthode pour afficher l'aperçu d'un document
  previewDocument(documentId: number): void {
    const documentUrl = this.candidatureService.getDocumentUrl(documentId);
    this.selectedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
  }
}