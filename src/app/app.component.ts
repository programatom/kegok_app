import { Component, ViewChild } from '@angular/core';
import { Platform, ViewController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { timer } from 'rxjs/observable/timer';

// Providers
import { LocalStorageProvider } from '../providers/local-storage/local-storage';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:string;
  showSplash = true;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
              private localStorage: LocalStorageProvider,
              private keyboard: Keyboard) {
    platform.ready().then(() => {

      platform.registerBackButtonAction(()=>{
        this.nav.pop();
      })

      this.keyboard.setResizeMode('false');
      this.localStorage.buscartoken().then((resp)=>{
        console.log('Se buscó en el local storage el token:  ' + resp)
        if (resp==false || resp==null){
          console.log('No se encontró el token, se define el root page como Login Page')
          this.rootPage = 'LoginPage';
          statusBar.styleLightContent()
          splashScreen.hide();
        }else{
          console.log('Se encontró el token, entonces se va directo al homepage')
          this.rootPage = 'TabsPage';
          statusBar.styleLightContent();
          splashScreen.hide();
        }
        timer(1000).subscribe(()=>{this.showSplash = false})
    })


    });
  }
}
