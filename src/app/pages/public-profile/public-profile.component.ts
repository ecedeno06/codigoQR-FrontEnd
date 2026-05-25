import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PetService, Pet } from '../../services/pet.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule 
  ],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})


export class PublicProfileComponent {
  mascota = signal<Pet | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);
  precisionMetros = signal<number | null>(null);
  ultimoAvistamiento = signal<Date | null>(null);
  mapUrl = signal<SafeResourceUrl | null>(null);

  displayedColumns: string[] = [
    'fecha_hora',
    'longitud',
    'latitud',
    'precision_metros',
    'Accion'
  ];

  dataSource: any[] = [];

  constructor(

    private route: ActivatedRoute,
    private petService: PetService,
    private sanitizer: DomSanitizer

  ) {
    const qr = this.route.snapshot.paramMap.get('codigo_qr');
    if (qr) {
      this.petService.getPetByQr(qr).subscribe({
        next: (data) => {

          console.log('PET =>', data);
          console.log('LATITUD =>', data.latitud);
          console.log('LONGITUD =>', data.longitud);
          console.log('FECHA =>', data.fecha_hora);

          this.mascota.set(data);
        
          this.dataSource = data.avistamientos || [];

          this.mascota.set(data);

        
          this.dataSource = data.avistamientos || [];

          console.log('AVISTAMIENTOS =>', this.dataSource);

          // Último avistamiento para el mapa

          if (data.avistamientos?.length) {

            const ultimo = data.avistamientos[0];
          
            this.latitud.set(ultimo.latitud);
            this.longitud.set(ultimo.longitud);

            this.verUbicacion(ultimo);
                               
          }


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

        this.latitud.set(position.coords.latitude);
        this.longitud.set(position.coords.longitude);
        this.precisionMetros.set(position.coords.accuracy);
        this.ultimoAvistamiento.set(new Date());

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

  actualizarMapa(lat: number, lng: number) {

    const url =
      `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  
    this.mapUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
    );
  }

  verUbicacion(avistamiento: any) {

    this.latitud.set(avistamiento.latitud);
    this.longitud.set(avistamiento.longitud);
    this.precisionMetros.set(avistamiento.precision_metros);
  
    this.ultimoAvistamiento.set(
      new Date(avistamiento.fecha_hora)
    );
  
    this.actualizarMapa(
      avistamiento.latitud,
      avistamiento.longitud
    );
  }
}
