import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidatureService } from '../../services/candidature.service';
import { CommonModule, Location } from '@angular/common';
import { FooterComponent } from 'src/app/constantes/footer/footer.component';
import { HeaderComponent } from 'src/app/constantes/header/header.component';

@Component({
  standalone: true,
  selector: 'app-candidature-details-view',
  templateUrl: './candidature-details-view.component.html',
  styleUrls: ['./candidature-details-view.component.css'],
  imports: [CommonModule, FooterComponent, HeaderComponent], // Importez les composants nécessaires
})
export class CandidatureDetailsViewComponent implements OnInit {
  candidature: any = {}; // Détails de la candidature
  documents: any[] = []; // Liste des documents

  constructor(
    private route: ActivatedRoute,
    private candidatureService: CandidatureService,
    private location: Location // Pour le bouton Retour
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
}