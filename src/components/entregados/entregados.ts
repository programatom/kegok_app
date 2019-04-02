import { Component, Input, ViewChild } from '@angular/core';
import { HomePage } from '../../pages/home/home';
import { NavController, ModalController } from "ionic-angular";

@Component({
  selector: 'entregados',
  templateUrl: 'entregados.html'
})
export class EntregadosComponent {

  @Input('arrayEntregadoAClientes') arrayEntregadoAClientes;

  constructor(private home: HomePage,
              private navCtrl:NavController,
              private modalCtrl: ModalController) {

  }
  ngAfterViewInit(){
    this.home.componentInit(null);
  }

  irAlSearch(clienteHome){
    this.modalCtrl.create('ListadoPage',{"buscar":clienteHome,"modal":true}).present();
  }
}
