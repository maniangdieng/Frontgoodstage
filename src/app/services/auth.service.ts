import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private isLoggedInKey = 'isLoggedIn';
  private userKey = 'user';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, motDePasse: string): Observable<any> {
    return this.http.post<{ message: string; user: any }>(`${this.apiUrl}/login`, { email, motDePasse }).pipe(
      tap((response) => {
        if (response.message === 'Authentification réussie') {
          localStorage.setItem(this.isLoggedInKey, 'true');
          localStorage.setItem(this.userKey, JSON.stringify(response.user)); // Stocker l'utilisateur
          this.router.navigate(['/dashboard-per']);
        }
      })
    );
  }
  
  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null; // Récupérer l'utilisateur depuis le localStorage
  }

  
  isAuthenticated(): boolean {
    return localStorage.getItem(this.isLoggedInKey) === 'true';
  }

  
  logout() {
    localStorage.removeItem(this.isLoggedInKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }
}
