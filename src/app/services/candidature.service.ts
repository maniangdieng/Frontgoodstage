import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8080/api/candidatures'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer toutes les candidatures
  getAllCandidatures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Récupérer une candidature par son ID
  getCandidatureById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle candidature
  createCandidature(candidature: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, candidature);
  }

  // Mettre à jour une candidature existante
  updateCandidature(id: number, candidature: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, candidature);
  }

  // Supprimer une candidature
  deleteCandidature(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getCandidaturesByStatut(statut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statut/${statut}`);
  }
}