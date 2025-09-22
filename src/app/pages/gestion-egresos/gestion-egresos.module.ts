import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionEgresosPageRoutingModule } from './gestion-egresos-routing.module';
import { GestionEgresosPage } from './gestion-egresos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionEgresosPageRoutingModule
  ],
  declarations: [GestionEgresosPage]
})
export class GestionEgresosPageModule {}
