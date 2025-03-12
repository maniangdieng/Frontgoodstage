import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // Supprimer une candidature
  deleteCandidature(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Télécharger un document
  downloadDocument(documentId: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/octet-stream', // Indique que la réponse est un fichier binaire
    });

    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      headers: headers,
      responseType: 'blob', // Indique que la réponse est un Blob (fichier binaire)
    });
  }

  // Récupérer l'URL d'un document pour l'aperçu
  getDocumentUrl(documentId: number): string {
    return `${this.apiUrl}/documents/${documentId}/download`;
  }
}