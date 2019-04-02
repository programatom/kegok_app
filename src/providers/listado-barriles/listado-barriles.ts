import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class ListadoBarrilesProvider {

  constructor(public httpc: HttpClient) {
  }

  httpPost(data, url){
  let promesa = new Promise ((resolve,reject)=>{
    let subscription = this.httpc.post(url,JSON.stringify(data),{headers: {'Content-Type' : "application/json; charset=utf-8"}})
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

  buscarListadoBarriles(token){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getBarrelList'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }

}
