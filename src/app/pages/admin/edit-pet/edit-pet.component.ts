import { Component, signal, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('video')
  video!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  stream: MediaStream | null = null;

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

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async startCamera(): Promise<void> {
    try {

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      });

      this.video.nativeElement.srcObject = this.stream;

    } catch (error) {
      console.error(error);
      this.error.set('No fue posible acceder a la cámara.');
    }
  }

  takePicture(): void {

    if (!this.video || !this.canvas) {
      return;
    }

    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL('image/jpeg');

    this.previewUrl.set(imageBase64);

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    video.srcObject = null;
  }

  handleSubmit(): void {

    const qr = this.route.snapshot.paramMap.get('codigo_qr');

    if (!qr || !this.previewUrl()) {
      return;
    }

    this.updating.set(true);
    this.success.set(null);
    this.error.set(null);

    this.petService.updatePetPhoto(qr, {
      url: this.previewUrl()!
    }).subscribe({
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