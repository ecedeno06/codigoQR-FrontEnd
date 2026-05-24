import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PetService, Pet } from '../../services/pet.service';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent {
  mascota = signal<Pet | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private petService: PetService
  ) {
    const qr = this.route.snapshot.paramMap.get('codigo_qr');
    if (qr) {
      this.petService.getPetByQr(qr).subscribe({
        next: (data) => {
          this.mascota.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
    }
  }

  compartirUbicacion() {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite compartir ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const qr = this.route.snapshot.paramMap.get('codigo_qr');
        if (!qr) return;

        this.petService.reportSighting(qr, {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precision_metros: position.coords.accuracy,
          fecha_hora: new Date().toISOString()
        }).subscribe({
          next: () => alert("¡Gracias! La ubicación fue enviada al dueño."),
          error: (err) => alert("Error al enviar ubicación: " + err.message)
        });
      },
      (err) => alert("No se pudo obtener la ubicación: " + err.message),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
    );
  }
}
