import { Routes } from '@angular/router';
import { RegisterPage } from './register.page';
import { GuestGuard } from '../../core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: RegisterPage,
    canActivate: [GuestGuard]
  }
];
