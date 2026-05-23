import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PetService } from '../../services/pet.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  codigoBusqueda = signal<string>('QR-8F3A92C1');
  qrData = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private petService: PetService) {}

  generarQR() {
    this.loading.set(true);
    this.error.set(null);
    this.petService.getQrImage(this.codigoBusqueda()).subscribe({
      next: (data) => {
        this.qrData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo generar el QR para este código');
        this.loading.set(false);
      }
    });
  }
}
