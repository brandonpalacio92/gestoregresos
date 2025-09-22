import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionMensualPage } from './gestion-mensual.page';

const routes: Routes = [
  {
    path: '',
    component: GestionMensualPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionMensualPageRoutingModule {}
