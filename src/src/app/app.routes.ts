import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PublicProfileComponent } from './pages/public-profile/public-profile.component';
import { NewPetComponent } from './pages/admin/new-pet/new-pet.component';
import { EditPetComponent } from './pages/admin/edit-pet/edit-pet.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'mascotas/qr/:codigo_qr', component: PublicProfileComponent },
  { path: 'admin/nuevo', component: NewPetComponent },
  { path: 'admin/editar/:codigo_qr', component: EditPetComponent },
  { path: '**', redirectTo: '' }
];
