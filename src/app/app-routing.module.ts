import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login-routing.module').then(m => m.routes)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register-routing.module').then(m => m.routes)
  },
  {
    path: 'registro-egresos',
    loadChildren: () => import('./pages/registro-egresos/registro-egresos.module').then(m => m.RegistroEgresosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion-mensual',
    loadChildren: () => import('./pages/gestion-mensual/gestion-mensual.module').then(m => m.GestionMensualPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'configuracion-usuario',
    loadChildren: () => import('./pages/configuracion-usuario/configuracion-usuario.module').then(m => m.ConfiguracionUsuarioPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion-egresos',
    loadChildren: () => import('./pages/gestion-egresos/gestion-egresos.module').then(m => m.GestionEgresosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./pages/reportes/reportes.module').then(m => m.ReportesPageModule),
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
