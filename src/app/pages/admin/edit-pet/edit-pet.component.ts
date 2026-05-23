import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PetService, Pet } from '../../../services/pet.service';

@Component({
  selector: 'app-edit-pet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-pet.component.html',
  styleUrls: ['./edit-pet.component.css']
})
export class EditPetComponent {
  mascota = signal<Pet | null>(null);
  loading = signal<boolean>(true);
  updating = signal<boolean>(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  previewUrl = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private petService: PetService
  ) {
    const qr = this.route.snapshot.paramMap.get('codigo_qr');
    if (qr) {
      this.petService.getPetByQr(qr).subscribe({
        next: (data) => {
          this.mascota.set(data);
          this.previewUrl.set(data.foto?.url || null);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
    }
  }

  handleFileChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      this.previewUrl.set(base64);
    };
    reader.readAsDataURL(file);
  }

  handleSubmit() {
    const qr = this.route.snapshot.paramMap.get('codigo_qr');
    if (!qr || !this.previewUrl()) return;

    this.updating.set(true);
    this.success.set(null);
    this.error.set(null);

    this.petService.updatePetPhoto(qr, { url: this.previewUrl()! }).subscribe({
      next: () => {
        this.success.set('¡Foto actualizada con éxito!');
        this.updating.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || err.message);
        this.updating.set(false);
      }
    });
  }
}
