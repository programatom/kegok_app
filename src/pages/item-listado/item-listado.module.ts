
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemListadoPage } from './item-listado';

@NgModule({
  declarations: [
    ItemListadoPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemListadoPage),
  ],
  exports: [
    ItemListadoPage
  ]
})
export class ItemListadoPageModule {}
