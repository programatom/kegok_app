import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';
/*
  Generated class for the HttpValidateProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpValidateProvider {

alertaSesion:any;
toastError:any;

  constructor(public http: HttpClient,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController) {

                this.alertaSesion = this.alertCtrl.create({
                  title: 'Se expiró la sesión',
                  subTitle: 'Ingrese su usuario y contraseña nuevamente',
                  buttons: ['Ok']
                })
                this.toastError = this.toastCtrl.create({
                  message: 'Hubo un timeout con el servidor, checkee su conexión a internet e intentelo nuevamente',
                  duration: 4000,
                  position: 'top',
                  showCloseButton: true,
                  closeButtonText: 'Cerrar',
                  cssClass: "error"
                })
  }

  validarHttp(data){

    return new Promise ((resolve,reject)=>{
      if ( data == null ){
        console.log({
          popup: this.alertaSesion,
          status:'errorToken'})
        resolve({
          popup: this.alertaSesion,
          status:'errorToken'})
      }else if (data == 'error'){
        resolve({
          popup: this.toastError,
          status:'errorConnection'
        })
      }else{
        resolve({
          popup: null,
          status: 'OK'
        })
      }
    })

  }

}
