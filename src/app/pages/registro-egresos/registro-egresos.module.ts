import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RegistroEgresosPageRoutingModule } from './registro-egresos-routing.module';
import { RegistroEgresosPage } from './registro-egresos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegistroEgresosPageRoutingModule
  ],
  declarations: [RegistroEgresosPage]
})
export class RegistroEgresosPageModule {}
