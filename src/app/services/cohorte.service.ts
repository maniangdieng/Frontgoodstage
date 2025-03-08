import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Le service est disponible dans toute l'application
})
export class CohorteService {
  private apiUrl = 'http://localhost:8080/api/cohortes'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer toutes les cohortes
  getAllCohortes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Récupérer une cohorte par son ID
  getCohorteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle cohorte
  createCohorte(cohorte: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cohorte);
  }

  // Mettre à jour une cohorte existante
  updateCohorte(id: number, cohorte: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cohorte);
  }

  // Supprimer une cohorte
  deleteCohorte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}