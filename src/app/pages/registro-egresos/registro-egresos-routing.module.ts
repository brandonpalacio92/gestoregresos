import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistroEgresosPage } from './registro-egresos.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroEgresosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroEgresosPageRoutingModule {}
