import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoverBarrilModalPage } from './mover-barril-modal';

@NgModule({
  declarations: [
    MoverBarrilModalPage,
  ],
  imports: [
    IonicPageModule.forChild(MoverBarrilModalPage),
  ],
  exports: [
    MoverBarrilModalPage
  ]
})
export class MoverBarrilModalPageModule {}
