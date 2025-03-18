import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Ajout de 'of' pour retourner un Observable vide en cas d'erreur
import { catchError } from 'rxjs/operators'; // Ajout de 'catchError' pour gérer les erreurs

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

  // Créer une nouvelle candidature avec des fichiers
  createCandidature(candidature: any, files: File[]): Observable<any> {
    const formData = new FormData();

    // Ajouter les données de la candidature
    formData.append('candidature', new Blob([JSON.stringify(candidature)], {
      type: 'application/json',
    }));

    // Ajouter les fichiers
    files.forEach((file, index) => {
      formData.append('files', file, file.name);
    });

    return this.http.post<any>(this.apiUrl, formData);
  }

  // Mettre à jour une candidature existante
  updateCandidature(id: number, candidature: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, candidature);
  }

  // Valider une candidature
  validateCandidature(candidatureId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${candidatureId}/validate`, {}).pipe(
      catchError((error) => {
        console.error('Erreur lors de la validation de la candidature', error);
        return of(null); // Retourne null en cas d'erreur
      })
    );
  }

  // Supprimer une candidature
  deleteCandidature(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Télécharger un document
  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
  }

  // Récupérer l'URL d'un document
  getDocumentUrl(documentId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/url`, {
      responseType: 'text',
    });
  }

  // Récupérer les candidatures par statut
  getCandidaturesByStatut(statut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getMesCandidatures(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mes-candidatures/${userId}`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des candidatures', error);
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    );
  }
}