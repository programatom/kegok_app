import { Component, Input, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { IonicPage } from 'ionic-angular';

@IonicPage()

@Component({
  selector: 'page-nueva-contrasena',
  templateUrl: 'nueva-contrasena.html',
})
export class NuevaContrasenaPage {

  @ViewChild("inputOldPW")inputOldPW;
  @ViewChild("inputNewPW")inputNewPW;
  @ViewChild("inputNewPWConfir")inputNewPWConfir;

  password:string= "";
  newpassword:string= "";
  newpassword2:string= "";
  showSplash:boolean;
  token:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public loginProv: LoginProvider, public localStorage: LocalStorageProvider,
              public toastCtrl: ToastController, private modalCtrl: ModalController,
              public loadingCtrl: LoadingController, private alertCtrl: AlertController) {

  }
ionViewWillLoad(){
  this.token = this.navParams.get('token');
}

ionViewDidLoad(){
  this.inputOldPW.setFocus();
}


cambiarInput(irA:any){
  if (irA == 'inputOldPW'){
    this.inputOldPW.setFocus();
  }else{
    this.inputNewPW.setFocus();
  }
}

aplicar(){

  this.showSplash = true;
    this.loginProv.actualizarContrasena(this.token, this.password, this.newpassword, this.newpassword2)
                  .then((data:any)=>{
                    if( data == 'error'){
                      this.showSplash = false;
                      let toast = this.toastCtrl.create({
                        message: 'Hubo un timeout con el servidor, checkee su conexión a internet e intentelo nuevamente',
                        duration: 4000,
                        position: 'top',
                        showCloseButton: true,
                        closeButtonText: 'Cerrar',
                        cssClass: "error"
                      })
                      toast.present()

                    }else{


                    if(data.STATUS == false){
                      this.showSplash = false;
                      let toast = this.toastCtrl.create({
                            message: data.VALIDATION,
                            duration: 3000,
                            position: 'top',
                            cssClass: 'error'
                            })
                      toast.present();
                    }

                    if(data.STATUS == true){
                      this.showSplash = false;
                      let alert = this.alertCtrl.create({
                        title: 'Éxito',
                        message: 'La contaseña se actualizó',
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
  }
  )

}
}
