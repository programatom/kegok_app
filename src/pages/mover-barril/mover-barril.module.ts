import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoverBarrilPage } from './mover-barril';

@NgModule({
  declarations: [
    MoverBarrilPage,
  ],
  imports: [
    IonicPageModule.forChild(MoverBarrilPage),
  ],
  exports: [
    MoverBarrilPage
  ]
})
export class MoverBarrilPageModule {}
