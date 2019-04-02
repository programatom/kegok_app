import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class GraficosProvider {

  constructor(public http: HttpClient) {
  }

  httpPost(data, url){
  let promesa = new Promise ((resolve,reject)=>{
    let subscription = this.http.post(url,JSON.stringify(data),{headers: {'Content-Type' : "application/json; charset=utf-8"}})
              .subscribe((data:any)=>{
                resolve(data.d);
              },
                err=>{
                  console.log(err);
                  resolve('error')
                })
              })
    return promesa
  }

  buscarDatosPie(token){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getPieStock'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }

  buscarDatosLine(token){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getLineGrafico'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }

  buscarBarrilesAfuera(token){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getListBarrelClient'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }

  buscarEntregadoClientes(token){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getClientBeer'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }

}
