import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/constantes/header/header.component';
import { CohorteService } from '../../services/cohorte.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-drc',
  imports: [CommonModule, RouterLink, HeaderComponent, ReactiveFormsModule],
  templateUrl: './dashboard-drc.component.html',
  styleUrls: ['./dashboard-drc.component.css']
})
export class DashboardDrcComponent implements OnInit {
  cohortes: any[] = [];
  cohorteForm: FormGroup;
  isEditMode = false;
  selectedCohorteId: number | null = null;

  constructor(
    private cohorteService: CohorteService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cohorteForm = this.fb.group({
      annee: ['', Validators.required],
      dateOuverture: ['', Validators.required],
      dateSemiCloture: ['', Validators.required],
      dateClotureDef: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCohortes();
    this.handleFragment();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleFragment();
      }
    });
  }

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

  loadCohortes(): void {
    this.cohorteService.getAllCohortes().subscribe((data) => {
      this.cohortes = data;
    });
  }

  onSubmit(): void {
    if (this.cohorteForm.valid) {
      const cohorte = this.cohorteForm.value;
      if (this.isEditMode && this.selectedCohorteId) {
        this.cohorteService.updateCohorte(this.selectedCohorteId, cohorte).subscribe(() => {
          this.loadCohortes();
          this.resetForm();
        });
      } else {
        this.cohorteService.createCohorte(cohorte).subscribe(() => {
          this.loadCohortes();
          this.resetForm();
        });
      }
    }
  }

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

  deleteCohorte(id: number): void {
    this.cohorteService.deleteCohorte(id).subscribe(() => {
      this.loadCohortes();
    });
  }

  resetForm(): void {
    this.cohorteForm.reset();
    this.isEditMode = false;
    this.selectedCohorteId = null;
  }
}