import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionMensualPageRoutingModule } from './gestion-mensual-routing.module';
import { GestionMensualPage } from './gestion-mensual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionMensualPageRoutingModule
  ],
  declarations: [GestionMensualPage]
})
export class GestionMensualPageModule {}
