import { Component, Input, ViewChild } from '@angular/core';
import { HomePage } from '../../pages/home/home';
import { NavController, ModalController } from "ionic-angular";

@Component({
  selector: 'barriles-afuera',
  templateUrl: 'barriles-afuera.html'
})
export class BarrilesAfueraComponent {
  @Input("datosBarrilesAfuera") datosBarrilesAfuera;

  constructor(private home: HomePage,
              private navCtrl: NavController,
              private modalCtrl: ModalController) {
  }

  ngAfterViewInit(){
    this.home.componentInit(null);
  }

  irAlSearch(buscar){
    this.modalCtrl.create('ListadoPage',{"buscar":buscar,"modal":true}).present();
  }

}
