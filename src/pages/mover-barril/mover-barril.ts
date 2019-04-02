import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, App,
         AlertController, Content, Platform} from 'ionic-angular';

// Providers
import { LocalStorageProvider } from '../../providers/local-storage/local-storage'

import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-mover-barril',
  templateUrl: 'mover-barril.html',
})
export class MoverBarrilPage {
  showSplash: boolean;

  @ViewChild('content') content: Content;
  iterador: boolean = true;
  backgroundContentColor: string = '';


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public modalCtrl: ModalController,
              private localStorage: LocalStorageProvider,
              private app: App,
              private alertCtrl: AlertController,
              private plt: Platform) {

  }

irModal(comando){
    this.navCtrl.push('MoverBarrilModalPage', {comando:comando});
}
loading(present:boolean){
    if (present){
    this.showSplash = true;
  }else{
    this.showSplash = false;
    }

}


logout(){
let alert = this.alertCtrl.create({
  title: 'Confirmación',
  subTitle: '¿Está seguro que desea salir de la sesión?',
  buttons: [{
    text: 'Cancelar',
    role: 'cancel'
  },
{
  text: 'Aceptar',
  handler: ()=>{
    this.localStorage.eliminarToken();
    this.loading(true);
    this.app.getRootNav().setRoot('LoginPage',{},{},()=>{
      this.loading(false);
    });
  }
}]
})
alert.present()
}

pruebaOpacity(){
  if(this.iterador == true){
    console.log('TA OPACO?')
    console.log(this.content)
    this.content._elementRef.nativeElement.classList.add('backgroundColor')
    this.iterador = false
  }else{
    this.iterador = true;
    this.content._elementRef.nativeElement.classList.remove('backgroundColor')
  }


}

}
