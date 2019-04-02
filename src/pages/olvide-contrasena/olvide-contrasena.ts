import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController ,App } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { HttpValidateProvider } from '../../providers/http-validate/http-validate'
import { IonicPage } from 'ionic-angular';

@IonicPage()

@Component({
  selector: 'page-olvide-contrasena',
  templateUrl: 'olvide-contrasena.html',
})
export class OlvideContrasenaPage {
  showSplash: boolean;

email:string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public login: LoginProvider, private toastCtrl: ToastController,
              private alertCtrl: AlertController, private loadingCtrl: LoadingController,
              private app: App,
              private httpValidate: HttpValidateProvider) {
  }

  dismissModal(){
    this.navCtrl.pop();
  }

  enviarEmail(){

    this.showSplash = true;
    this.login.enviarEmailRecuperacion(this.email).then((data:any)=>{
      this.showSplash = false;
      this.httpValidate.validarHttp(data).then((array)=>{
        if(array['status'] == 'errorToken'){
          array['popup'].present();
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          array['popup'].present();
        }else{
          if(data.STATUS == false){

            let toast = this.toastCtrl.create({
              message: data.VALIDATION,
              duration: 3000,
              position: 'top',
              showCloseButton: true,
              closeButtonText: 'Cerrar',
              cssClass: 'error'

            })
            toast.present();
          }

          if(data.STATUS == true){

            let alert = this.alertCtrl.create({
              title: 'Éxito',
              message: 'Te enviamos un email con una contraseña temporal para que puedas acceder a tu cuenta y establecer una nueva contraseña',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                    this.navCtrl.pop();
                  }
                },
              ]
            });
            alert.present();
          }

        }
      })

    })
  }
pruebaLoading(){
  this.showSplash=true;
}
}
