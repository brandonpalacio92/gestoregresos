import { Routes } from '@angular/router';
import { LoginPage } from './login.page';
import { GuestGuard } from '../../core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginPage,
    canActivate: [GuestGuard]
  }
];
