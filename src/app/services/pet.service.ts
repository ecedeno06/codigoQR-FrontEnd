import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Pet {
  id_mascota?: number;
  nombre_mascota: string;
  codigo_qr: string;
  email: string;
  color: string;
  microchip: string;
  sexo: string;
  foto?: { url: string };
  nombre_propietario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:3001';
  
  // Signals for state
  public currentPet = signal<Pet | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getPetByQr(qr: string): Observable<Pet> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Pet>(`${this.apiUrl}/api/public/mascotas/qr/${qr}`).pipe(
      tap({
        next: (pet) => {
          this.currentPet.set(pet);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar la mascota');
          this.loading.set(false);
        }
      })
    );
  }

  getQrImage(qr: string): Observable<{ qrBase64: string, publicUrl: string, codigo_qr: string }> {
    return this.http.get<{ qrBase64: string, publicUrl: string, codigo_qr: string }>(
      `${this.apiUrl}/api/admin/mascotas/${qr}/qr-image`
    );
  }

  createPet(pet: Pet): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/api/admin/mascotas`, pet);
  }

  updatePetPhoto(qr: string, foto: { url: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/admin/mascotas/${qr}`, { foto });
  }

  reportSighting(qr: string, location: { latitud: number, longitud: number, precision_metros: number, fecha_hora: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/public/mascotas/qr/${qr}/avistamiento`, location);
  }
}
