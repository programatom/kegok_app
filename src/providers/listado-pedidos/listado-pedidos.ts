import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ListadoPedidosProvider {

  constructor(public httpc: HttpClient) {
  }

  httpPost(data, url){
  let promesa = new Promise ((resolve,reject)=>{
    let subscription = this.httpc.post(url,JSON.stringify(data),{headers: {'Content-Type' : "application/json; charset=utf-8"}})
              .subscribe((data:any)=>{
                //El null siempre esta adentro del .d
                resolve(data.d);
              },
                err=>{
                  console.log(err);
                  resolve('error')
                })
              })
    return promesa
  }

  buscarListadoPedidos(token){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getOrderList'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }

  buscarOrderByID(token, id){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token, "id": id};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getOrderByID'
      this.httpPost(data,url).then((data)=>{
        resolve(data);
      })
    })
    return promesa
  }
  guardarPedido(token, order, items){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token, "order": order, "items": items};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/saveOrder'
      this.httpPost(data,url).then((respuesta)=>{
        resolve(respuesta);
      })
    })
    return promesa
  }

  cancelarPedido(token, id){

    let promesa = new Promise((resolve,reject)=>{
      var data = { "token": token, "id": id};
      let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/cancelOrder'
      this.httpPost(data,url).then((respuesta)=>{
        resolve(respuesta);
      })
    })
    return promesa
  }

}
