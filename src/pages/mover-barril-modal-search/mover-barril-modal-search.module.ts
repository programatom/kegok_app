import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoverBarrilModalSearchPage } from './mover-barril-modal-search';

@NgModule({
  declarations: [
    MoverBarrilModalSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(MoverBarrilModalSearchPage),
  ],
  exports: [
    MoverBarrilModalSearchPage
  ]
})
export class MoverBarrilModalSearchPageModule {}
