import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoginProvider {

  constructor(public httpc: HttpClient) {

  }



login(usuario,contrasena){

let promesa = new Promise((resolve,reject)=>{
  var data = { "user": usuario, "password": contrasena};
  let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/login'
  this.httpPost(data,url).then((data)=>{
    resolve(data)
  })
})
return promesa
}



httpPost(data, url){
let promesa = new Promise ((resolve,reject)=>{
  let subscription = this.httpc.post(url,JSON.stringify(data),{headers: {'Content-Type' : "application/json; charset=utf-8"}})
            .subscribe((data:any)=>{
              console.log(data.d);
              resolve(data.d)
            },
              err=>{
                console.log(err);
                resolve('error')
              })
            })
  return promesa
}
enviarEmailRecuperacion(email){

  let promesa = new Promise((resolve,reject)=>{
    var data = { "email": email};
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/recoverPassword'
    this.httpPost(data,url).then((data)=>{
      resolve(data);
    })
  })
  return promesa

}

actualizarContrasena(token, password, newpassword, newpassword2){

  let promesa = new Promise((resolve,reject)=>{
    var data = { "token": token, "password": password, "newPassword": newpassword, "newPassword2": newpassword2};
    console.log(data)
    let url = 'https://sistema.kegok.com/aspxs/admin/wsMobile.asmx/changePassword'
    this.httpPost(data,url).then((data)=>{
      resolve(data)
    })
  })
  return promesa
}

}
