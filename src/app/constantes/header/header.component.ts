import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Ajout du module de routage

@Component({
  selector: 'app-header',
  standalone: true, // Nécessaire pour être importé ailleurs
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule, RouterModule], // Ajout des modules nécessaires
 
})
export class HeaderComponent {}
