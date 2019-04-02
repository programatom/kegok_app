import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ModalController, ToastController,
         LoadingController, App } from 'ionic-angular';

// Plugins
import { Keyboard } from '@ionic-native/keyboard';

// Providers
import { LoginProvider } from '../../providers/login/login'
import { LocalStorageProvider } from '../../providers/local-storage/local-storage'


import { timer } from 'rxjs/observable/timer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonicPage } from 'ionic-angular';

@IonicPage()

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  @ViewChild('contrasenaInput') contrasenaInput;

  subscriptionTimer: Subscription;
  timer: any;
  showSplash: boolean;
  dismissed: boolean;


  usuario:string = '';
  contrasena:string = "";
  mostrarPW:boolean = false;
  mostrarIngresar:boolean = false;
  unicaAnimacion1:boolean = false;
  unicaAnimacion2:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public plt: Platform, public modalCtrl: ModalController,
              public loginProv: LoginProvider, public toastCtrl: ToastController,
              public localStorage: LocalStorageProvider,
              public loadingCtrl: LoadingController,
              private iab: InAppBrowser,
              private app: App,
              private keyboard: Keyboard) {
  }

  hideKeyboard(){
    this.keyboard.hide();
  }

  cambiarInput(){
    this.contrasenaInput.setFocus();
  }


  esconderKeyboard(){
    this.keyboard.hide();
  }

  animarPWUser(){
    if (this.unicaAnimacion1 == false){
      this.mostrarPW = true
      this.unicaAnimacion1 = true;
    }


  }
  animarIngresar(){
    if (this.unicaAnimacion2 ==false){
      this.mostrarIngresar = true;
      this.unicaAnimacion2 = true;
    }
  }
  olvideContrasena(){
    let modal = this.modalCtrl.create( 'OlvideContrasenaPage' );
    modal.present();
  }

  loading(present:boolean){

    if (this.dismissed == false){
      console.log('Se vuelve a mandar pero se evita')
    }else{
      if (present){
      this.showSplash = true;
      this.dismissed = false;
      this.timer = timer(30000);

      this.subscriptionTimer = this.timer.subscribe(()=>{
        if (this.dismissed == false){
          console.log('Se activo el timer')
          this.showSplash = false;
          let toast = this.toastCtrl.create({
            message: 'Hubo un timeout con el servidor, inténtelo nuevamente',
            duration: 4000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            cssClass: "error"
          })
          toast.present()
        }
      })
    }else{
      this.showSplash = false;

      }
    }

  }

  ingresar(){

    this.loading(true);

    this.loginProv.login(this.usuario,this.contrasena).then((data:any)=>{
        if (data == 'error'){
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
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
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);
            console.log('Hubo un error con el login')
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

          if(data.STATUS == true && data.IS_FIRST_LOGIN == 'N'){
            this.localStorage.guardartoken(data.TOKEN);
              if (this.plt.is('android')){
                this.app.getRootNav().setRoot('TabsPage').then(()=>{
                  this.dismissed = true;
                  this.subscriptionTimer.unsubscribe();
                  this.loading(false);
                })
              }else{
                this.navCtrl.setRoot('TabsPage')
                this.navCtrl.goToRoot
                this.dismissed = true;
                this.subscriptionTimer.unsubscribe();
                this.loading(false);
              }

          }

          if(data.IS_FIRST_LOGIN == 'Y'){
            this.contrasena = '';
            let modal = this.modalCtrl.create( 'NuevaContrasenaPage',{token: data.TOKEN});
            modal.present();
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);
          }
        }
    })
  }

registrar(){
this.loading(true);
timer(2000).subscribe(()=>{
  this.dismissed = true;
  this.subscriptionTimer.unsubscribe();
  this.loading(false);
})

  const browser = this.iab.create("https://www.kegok.com/",'_blank','location=yes,hidden=no,hidespinner=yes,closebuttoncaption=Volver');
  browser.show();
}
}
