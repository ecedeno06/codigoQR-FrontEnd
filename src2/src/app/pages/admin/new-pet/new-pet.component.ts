import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PetService, Pet } from '../../../services/pet.service';

@Component({
  selector: 'app-new-pet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './new-pet.component.html',
  styleUrls: ['./new-pet.component.css']
})
export class NewPetComponent {
  formData = signal<Pet>({
    nombre_mascota: '',
    email: '',
    color: '',
    microchip: '',
    sexo: 'M',
    codigo_qr: '', // Backend generará uno si no se envía o podemos dejarlo vacío
  });

  loading = signal<boolean>(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  previewUrl = signal<string | null>(null);

  constructor(private petService: PetService) {}

  handleFileChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      this.previewUrl.set(base64);
      this.formData.update(prev => ({ ...prev, foto: { url: base64 } }));
    };
    reader.readAsDataURL(file);
  }

  handleSubmit() {
    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    this.petService.createPet(this.formData()).subscribe({
      next: (data) => {
        this.success.set(`¡Mascota creada con éxito! Código QR: ${data.codigo_qr}`);
        this.formData.set({
          nombre_mascota: '',
          email: '',
          color: '',
          microchip: '',
          sexo: 'M',
          codigo_qr: ''
        });
        this.previewUrl.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || err.message);
        this.loading.set(false);
      }
    });
  }
}
