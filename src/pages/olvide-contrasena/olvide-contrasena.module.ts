import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OlvideContrasenaPage } from './olvide-contrasena';

@NgModule({
  declarations: [
    OlvideContrasenaPage,
  ],
  imports: [
    IonicPageModule.forChild(OlvideContrasenaPage),
  ],
  exports: [
    OlvideContrasenaPage
  ]
})
export class OlvideContrasenaPageModule {}
