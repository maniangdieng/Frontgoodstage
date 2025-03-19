import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CandidatureService } from '../../services/candidature.service';
import { HeaderComponent } from '../../constantes/header/header.component';
import { FooterComponent } from '../../constantes/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-modifier-candidature',
  templateUrl: './modifier-candidature.component.html',
  styleUrls: ['./modifier-candidature.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class ModifierCandidatureComponent implements OnInit {
  candidatureForm: FormGroup;
  candidatureId: number = 0;
  candidature: any;
  documents: any[] = [];
  selectedDocumentUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatureService: CandidatureService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.candidatureForm = this.fb.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      destination: ['', Validators.required],
      cohorteId: ['', Validators.required],
      personnelId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.candidatureId = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (this.candidatureId) {
      this.loadCandidatureData();
    }
  }

  private loadCandidatureData(): void {
    this.candidatureService.getCandidatureById(this.candidatureId).subscribe({
      next: (data) => {
        this.candidature = data;
        this.documents = data.documents || [];
        const formattedData = {
          ...data,
          dateDebut: data.dateDebut ? new Date(data.dateDebut).toISOString().split('T')[0] : '',
          dateFin: data.dateFin ? new Date(data.dateFin).toISOString().split('T')[0] : ''
        };
        this.candidatureForm.patchValue(formattedData);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la candidature:', error);
      }
    });
  }

  previewDocument(documentId: number): void {
    this.candidatureService.getDocumentUrl(documentId).subscribe({
      next: (url) => {
        this.selectedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (error) => {
        console.error('Erreur lors de la prévisualisation du document:', error);
      }
    });
  }

  downloadDocument(documentId: number): void {
    this.candidatureService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const fileName = this.documents.find(doc => doc.id === documentId)?.nomFichier || 'document';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du document:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.candidatureForm.valid) {
      const updatedCandidature = {
        ...this.candidature,
        ...this.candidatureForm.value
      };
      this.candidatureService.updateCandidature(this.candidatureId, updatedCandidature).subscribe({
        next: () => {
          alert('Candidature mise à jour avec succès !');
          this.goBack();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
        }
      });
    } else {
      this.candidatureForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/candidatures']);
  }
}