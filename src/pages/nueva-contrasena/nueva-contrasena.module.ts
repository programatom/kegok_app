import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NuevaContrasenaPage } from './nueva-contrasena';

@NgModule({
  declarations: [
    NuevaContrasenaPage,
  ],
  imports: [
    IonicPageModule.forChild(NuevaContrasenaPage),
  ],
  exports: [
    NuevaContrasenaPage
  ]
})
export class NuevaContrasenaPageModule {}
