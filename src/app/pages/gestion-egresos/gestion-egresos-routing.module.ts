import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionEgresosPage } from './gestion-egresos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionEgresosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionEgresosPageRoutingModule {}
