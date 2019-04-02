import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';

@Injectable()
export class LocalStorageProvider {

  token: string;

  constructor(private storage: Storage,
    private plt: Platform) {
  }

  guardartoken(token) {


    if (this.plt.is('cordova')) {
      this.storage.ready().then(() => {
        this.storage.set('token', token);
        console.log('Se guardó el token con éxito')
        this.token = token;
      })
    } else {
      localStorage.setItem('token', token);
      this.token = token;
      console.log('Se guardó el token con éxito')

    }
  }

  buscartoken() {

    if (this.plt.is('cordova')) {
      return new Promise((resolve, reject) => {
        this.storage.ready().then(() => {
          let keys = this.storage.keys();
          console.log(keys);
          if (keys == null || keys == undefined) {

            //Claro, si por alguna razón, se busca un token y no hay ningun key guardada
            //entonces, no hay token y resuelve la función con un falso.

            console.log('No hay token')
            resolve(false);
          } else {
            this.storage.get('token').then((data: any) => {

              this.token = data;
              resolve(this.token);

            }).catch((err) => {

              console.log(err);

            })
          }
        })
      })

    } else {
      return new Promise((resolve, reject) => {
        let tokenJSON = localStorage.getItem('token');
        if (tokenJSON == "null") {
          console.log('No hay tokenJSON')
          resolve(false);
        } else {
          let tokenStringify = JSON.stringify(tokenJSON);
          let tokenParse = JSON.parse(tokenStringify);
          this.token = tokenParse;
          resolve(this.token);
        }
      })
    }
  }

  eliminarToken() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.clear().then(() => {
          console.log('Se borró el token')
          resolve(this.buscartoken)
        })
      })
    })

  }
}
