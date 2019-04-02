import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class MovimientoBarrilProvider {

  constructor(public httpc: HttpClient) {
  }

  httpPost(data, url){
  let promesa = new Promise ((resolve,reject)=>{
  this.httpc.post(url,JSON.stringify(data),{headers: {'Content-Type' : "application/json; charset=utf-8"}})
              .subscribe((data:any)=>{
                resolve(data.d)
              },
                err=>{
                  console.log(err);
                  resolve('error')
                })
              })
    return promesa
  }

  cargarClientes(token){
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getListClientDdl';
    let data = { "token": token};
    let promesa = new Promise((resolve,reject)=>{
      this.httpPost(data, url).then((clientes)=>{
        resolve(clientes);
      })
    })
    return promesa
  }

  cargarEstilos(token){
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getListStyleDdl';
    let data = { "token": token};
    let promesa = new Promise((resolve,reject)=>{
      this.httpPost(data, url).then((estilos)=>{
        resolve(estilos);
      })
    })
    return promesa
  }

  validacionBarril(token, tipo, estilo, lote, identification, ordenID, listBarrel){
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/validateAddBarrel';
    let data = { "token": token, "type" : tipo, "style" : estilo, "lote" : lote, "identification" : identification,
                  "order" : ordenID, 'listBarrel': listBarrel};
    let promesa = new Promise((resolve,reject)=>{
      this.httpPost(data, url).then((respuesta:any)=>{
        console.log('Respuesta a la validación del barril: ')
        console.log(respuesta)
        resolve(respuesta);
      })
    })
    return promesa
  }

  confirmarBarriles(token, list, tipo, cliente, lote, unificarLotes, ordenID){
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/saveMove';
    let data = { "token": token, 'list': list, "type" : tipo, "client" : cliente, "lote" : lote, "order" : ordenID,
                  "unificarLotes" : unificarLotes};
    let promesa = new Promise((resolve,reject)=>{
      this.httpPost(data, url).then((respuesta:any)=>{
        console.log('Respuesta a la confirmación del barril: ')
        console.log(respuesta)
        resolve(respuesta);
      })
    })
    return promesa
  }

  cargarCapacidades(token){
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/getBarrelCapacity';
    let data = { "token": token};
    let promesa = new Promise((resolve,reject)=>{
      this.httpPost(data, url).then((capacidades)=>{
        resolve(capacidades);
      })
    })
    return promesa
  }


}
