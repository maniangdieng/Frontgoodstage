import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  motDePasse: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    console.log('Router initialisé avec URL :', this.router.url);
  }
  
  onSubmit() {
    this.errorMessage = ''; // Réinitialise le message d'erreur
  
    this.authService.login(this.email, this.motDePasse).subscribe(
      (response) => {
        console.log('Réponse du backend :', response); // Vérifie la structure de la réponse
  
        if (response && response.message === 'Authentification réussie') {
          console.log('Redirection vers /dashboard-per');
          
        } else {
          this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        }
      },
      (error) => {
        this.errorMessage = 'Email ou mot de passe incorrect';
        console.error('Erreur lors de l\'authentification', error);
      }
    );
  }
  
}