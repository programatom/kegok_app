import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from "ionic-angular";
@Injectable()
export class ToastProvider {

  constructor(public http: HttpClient,
              private toastCtrl: ToastController) {
    console.log('Hello ToastProvider Provider');
  }

  toastMensajeInputError(mensaje){
    let toast = this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Cerrar',
      cssClass: "error"
    }).present();
  }
}
