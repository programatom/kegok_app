import { Component, ViewChild} from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, App, ModalController,
         ToastController, Content, Platform} from 'ionic-angular';


// Plugins

import { Keyboard } from '@ionic-native/keyboard';

// Providers

import { LocalStorageProvider } from '../../providers/local-storage/local-storage'
import { MovimientoBarrilProvider } from '../../providers/movimiento-barril/movimiento-barril'
import { ListadoPedidosProvider } from '../../providers/listado-pedidos/listado-pedidos'
import { HttpValidateProvider } from '../../providers/http-validate/http-validate'

import { timer } from 'rxjs/observable/timer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

interface objSelector {
    selector: string; estilo: string; capacidad: string; cantidad:string;
}
interface ArraySelectores extends Array<objSelector>{selector: string; estilo: string; capacidad: string; cantidad:string;
}


import { IonicPage } from 'ionic-angular';
import { ToastProvider } from '../../providers/toast/toast';

@IonicPage()

@Component({
  selector: 'page-item-listado',
  templateUrl: 'item-listado.html',
})
export class ItemListadoPage {
@ViewChild('content') content: Content;

showSplash: boolean;
subscriptionTimer: Subscription;

//puede ser pedido o producto
tipo:string;
//el id del producto
id:string;
//capacidad del producto
capacidadBarril:string;
//es estilo del barril
estiloBarril:string;
estadoBarril:string;

//estado del PEDIDO, para cancelado y entregado es estático
estadoEstatico:string;
fechaEstatico:string;
clienteEstatico:string;
titulo:string;
nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ]
existeEstilo:boolean = false;
existeCapacidad:boolean = false;
existeCliente:boolean = false;


token:string;
loader:any;
clientesArray = [];
estilosArray = [];
capacidadesArray = [];
alertaLogin = this.alertCtrl.create({
  title: 'Se expiró la sesión',
  subTitle: 'Ingrese su usuario y contraseña nuevamente',
  buttons: ['Ok']
})

fechaSelector:any = '';
clienteDisplay:string = '';
estiloDisplay:string = '';
capacidadDisplay:string = '';
cantidadDisplay:string = '';
comentarios:string = '';
ordenID:string;
items:any = [];
itemsDisplay: ArraySelectores[] = [];
dismissed:boolean;
timer:any;
callback = (data:any) => {

  if(data.tipo == 'estilo'){
    this.estiloDisplay = data.eleccion
  }else if (data.tipo == 'cliente'){
    this.clienteDisplay = data.eleccion
  }else if (data.tipo == 'capacidad'){
    this.capacidadDisplay = data.eleccion
  }
};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private localStorage: LocalStorageProvider,
              private loadingCtrl: LoadingController,
              private movimientoBarrilProv: MovimientoBarrilProvider,
              private alertCtrl: AlertController,
              private app: App,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              private listadoPedidosProv: ListadoPedidosProvider,
              private httpValidate: HttpValidateProvider,
              private plt: Platform,
              private keyboard: Keyboard,
              private toastProv: ToastProvider) {

                console.log(this.content)

      this.tipo = this.navParams.get('tipo');
      console.log('Se abre el item de listado en el tipo: ' + this.tipo)
        if (this.tipo == 'producto'){
      this.titulo = this.navParams.get('id');
      this.capacidadBarril = this.navParams.get('capacidad');

          if (this.capacidadBarril != null){
          this.existeCapacidad = true;
        }
      this.estiloBarril = this.navParams.get('estilo');
          if (this.estiloBarril != null){
          this.existeEstilo = true;
        }
      this.estadoBarril = this.navParams.get('estado');
      this.clienteEstatico = this.navParams.get('cliente');
          if (this.clienteEstatico != null){
          this.existeCliente = true;
        }
    }

      if(this.tipo == 'tipoPedido'){

        this.estadoEstatico = this.navParams.get('estadoPedido')
        this.fechaEstatico = this.navParams.get('fecha')
        this.token = this.localStorage.token;
        this.titulo = 'Pedido Nº ' + this.navParams.get('numero');
        this.clienteEstatico = this.navParams.get('cliente');
        this.items = this.navParams.get('items')
        for (let i = 0; i <= this.items.length - 1; i ++ ){
          let objeto: any = {
            selector: this.items[i].ID_ORDER_ITEM_STR,
            estilo: this.items[i].ID_STYLE_STR,
            capacidad: this.items[i].CAPACITY,
            cantidad: this.items[i].QUANTITY_STR,
          }
          this.itemsDisplay.push(objeto);

        }


      if (this.estadoEstatico == 'PENDIENTE'){
        this.loading(true);
        this.comentarios = this.navParams.get('comments');
        this.ordenID = this.navParams.get('ordenID')
        let fechaHoraSplit = this.fechaEstatico.split(' ');
        let mesNumeroRaw = this.nombresMeses.findIndex((element)=> {return element == fechaHoraSplit[1]}) + 1;
        let mesNumero:any;
        if (mesNumeroRaw < 10){
          mesNumero = '0' + mesNumeroRaw
        }else{
          mesNumero = mesNumeroRaw;
        }
        this.fechaSelector = fechaHoraSplit[2] + '-' + mesNumero + '-' + fechaHoraSplit[0] + 'T' + fechaHoraSplit[4] + ':00Z';
        this.clienteDisplay = this.clienteEstatico;
        this.cargarDatosSelectores().then(()=>{
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
        })
      }
    }

    if(this.tipo == 'nuevoPedido'){
      this.token = this.localStorage.token;
      this.loading(true);
      this.titulo = 'Nuevo pedido'
      this.estadoEstatico = this.navParams.get('estadoPedido')
      this.cargarDatosSelectores().then(()=>{
        this.dismissed = true;
        this.subscriptionTimer.unsubscribe();
        this.loading(false);
      })
    }
  }

  esconderKeyboard(){
    this.keyboard.hide();
  }

cargarDatosSelectores(){
  let contador = 0
  return new Promise((resolve,reject)=>{
    this.movimientoBarrilProv.cargarClientes(this.token).then((clientes:any)=>{
      this.httpValidate.validarHttp(clientes).then((array)=>{
        console.log('el array ' + array)
        if(array['status'] == 'errorToken'){
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          array['popup'].present();
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          array['popup'].present();
        }else{
          this.clientesArray = clientes;
          contador += 1;
          if (contador == 3){
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);
            resolve();
          }
        }
      })
  })
    this.movimientoBarrilProv.cargarEstilos(this.token).then((estilos:any)=>{
      this.httpValidate.validarHttp(estilos).then((array)=>{
        console.log('el array ' + array)
        if(array['status'] == 'errorToken'){
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          array['popup'].present();
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          array['popup'].present();
        }else{
          this.estilosArray = estilos;
          contador += 1;
          if (contador == 3){
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);
            resolve();
          }

        }
      })
  })
  this.movimientoBarrilProv.cargarCapacidades(this.token).then((capacidades:any)=>{
    this.httpValidate.validarHttp(capacidades).then((array)=>{
      console.log('el array ' + array)
      if(array['status'] == 'errorToken'){
        this.dismissed = true;
        this.subscriptionTimer.unsubscribe();
        this.loading(false);
        array['popup'].present();
        this.app.getRootNav().setRoot('LoginPage');
      }else if(array['status'] == 'errorConnection'){
        this.dismissed = true;
        this.subscriptionTimer.unsubscribe();
        this.loading(false);
        array['popup'].present();
      }else{
        this.capacidadesArray = capacidades;
        contador += 1;
        if (contador == 3){
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          resolve();
        }

      }
    })
  })

  })

}

loading(present:boolean){
if (this.dismissed == false){
  console.log('Se vuelve a mandar pero se evita')
}else{
  if (present){
  this.showSplash = true;
  this.dismissed = false;
  this.subscriptionTimer = timer(30000).subscribe(()=>{
    if (this.dismissed == false){
      console.log('Se activo el timer')
      this.navCtrl.pop()
      this.showSplash = false;
      let toast = this.toastCtrl.create({
        message: 'Hubo un timeout con el servidor, inténtelo nuevamente',
        duration: 4000,
        position: 'top',
        showCloseButton: true,
        cssClass: 'error'
      })
      toast.present()
    }
  })
}else{
  this.showSplash = false;

  }
}

}

dismissModal(){
  this.navCtrl.pop();
}


abrirModalSearch(tipo){

if(tipo == 'estilo'){
let modal = this.modalCtrl.create('MoverBarrilModalSearchPage', {tipo:tipo, array: this.estilosArray, callback: this.callback});
modal.present();
}

if(tipo == 'cliente'){
let modal = this.modalCtrl.create('MoverBarrilModalSearchPage', {tipo:tipo, array: this.clientesArray, callback: this.callback});
modal.present();
}

if(tipo == 'capacidad'){
let modal = this.modalCtrl.create('MoverBarrilModalSearchPage', {tipo:tipo, array: this.capacidadesArray, callback: this.callback});
modal.present();
}
}

guardar(noPop){
  this.loading(true);
  return new Promise((resolve,reject)=>{

    let fechaHoraSplit = this.fechaSelector.split('T');
    let fechaSplit = fechaHoraSplit[0].split('-')
    let fecha;

    if (fechaHoraSplit[1] != undefined){
      let horaSlice = fechaHoraSplit[1].slice(0,5)
      fecha = fechaSplit[2] + ' ' + this.nombresMeses[fechaSplit[1] - 1] + ' ' + fechaSplit[0] + ' - ' + horaSlice
    }else{
      fecha = '';
    }
    let failed = false;
    let ID_CLIENT_STR
    if (this.clientesArray[this.clientesArray.findIndex((element)=> {return element.NAME == this.clienteDisplay})] == undefined){
      ID_CLIENT_STR = '0';
    }else{
      ID_CLIENT_STR = this.clientesArray[this.clientesArray.findIndex((element)=> {return element.NAME == this.clienteDisplay})].ID_CLIENT_STR
    }
    if (this.tipo == 'nuevoPedido'){
      this.ordenID = 'F962585F992B7871';
    }
    let order ={
      COMMENTS: this.comentarios,
      DATE_TIME_STR: fecha,
      ID_CLIENT_STR: ID_CLIENT_STR,
      ID_ORDER_STR: this.ordenID,
    }

    let items = [];
    for (let i = 0; i <= this.itemsDisplay.length - 1; i ++){
      console.log(this.itemsDisplay[i].estilo);
      console.log(this.estilosArray);
      let indexDelEstilo = this.estilosArray.findIndex((element)=> {return element.NAME == this.itemsDisplay[i].estilo});
      let indexCapacidad = this.capacidadesArray.findIndex((element)=> {return element.VALUE_ENG == this.itemsDisplay[i].capacidad});
      if(indexDelEstilo == -1){
        this.toastProv.toastMensajeInputError("No se encontró el id del estilo. Debe usar otro estilo o ingresar el estilo deseado a la base de datos.");
        this.showSplash = false;
        return;
      }
      items.push({ "QUANTITY_STR": this.itemsDisplay[i].cantidad,
        "ID_STYLE_STR": this.estilosArray[indexDelEstilo].ID_STYLE_STR,
        "CAPACITY_STR": this.capacidadesArray[indexCapacidad].ID_CODE_STR });
    }

    this.listadoPedidosProv.guardarPedido(this.token, order, items).then((respuesta:any)=>{

      this.dismissed = true;
      this.subscriptionTimer.unsubscribe();
      this.loading(false);
      this.httpValidate.validarHttp(respuesta).then((array)=>{
        console.log('el array ' + array)
        if(array['status'] == 'errorToken'){
          array['popup'].present();
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          array['popup'].present();
      }else{
        if (respuesta.CODE == 'ajaxcodeVALIDATE_FAILED'){

          let toast = this.toastCtrl.create({
            message: respuesta.MESSAGE,
            position: 'top',
            duration: 3000,
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            cssClass: 'error'
          })
          toast.present();
          failed = true;
        }else if (respuesta.CODE == 'ajaxcodeUPDATE_SUCCESS'){
          if (noPop == 'false'){
            let toast = this.toastCtrl.create({
              message: 'Actualización exitosa!',
              position: 'top',
              duration: 3000,
              showCloseButton: true,
              closeButtonText: 'Cerrar',
              cssClass: 'success'

            })
            toast.present();
          }else{
            resolve()
          }
        }
      }
      if (noPop == 'false' && failed == false){
        this.navCtrl.pop()
      }
    })
    })
  })

}

agregarBarriles(){
  console.log(this.itemsDisplay)

  if (this.cantidadDisplay == '' || this.estiloDisplay == '' || this.capacidadDisplay == ''){
    let toast = this.toastCtrl.create({
      message: 'No se pudo agregar, hay campos sin completar',
      position: 'top',
      duration: 3000,
      showCloseButton: true,
      closeButtonText: 'Cerrar',
      cssClass: 'error'

    })
    toast.present();
  }else if(isNaN(parseInt(this.cantidadDisplay)) || parseInt(this.cantidadDisplay) == 0){
    let toast = this.toastCtrl.create({
      message:'Ingrese un valor numérico en el campo cantidad',
      duration: 3000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Cerrar',
      cssClass: 'error'

    })
    toast.present();
  }else{
  let ID_STYLE_STR = this.estilosArray[this.estilosArray.findIndex((element)=> {return element.NAME == this.estiloDisplay})].ID_STYLE_STR
  let CAPACITY_STR = this.capacidadesArray[this.capacidadesArray.findIndex((element)=> {return element.VALUE_ENG == this.capacidadDisplay})].ID_CODE_STR

  let selector = ID_STYLE_STR + '___' + CAPACITY_STR
  let existeCategoria = false;
  let indiceCategoriaExistente:number;

  for (let i = 0; i <= this.itemsDisplay.length - 1 ; i ++){
    if (this.itemsDisplay[i].selector == selector){
      existeCategoria = true;
      indiceCategoriaExistente = i;
    }
  }

  if (existeCategoria == false){
    let objeto: any = {
      selector: ID_STYLE_STR + '___' + CAPACITY_STR,
      estilo: this.estiloDisplay,
      capacidad: this.capacidadDisplay,
      cantidad: this.cantidadDisplay
    }
    this.itemsDisplay.unshift(objeto);
  }else{
    this.itemsDisplay[indiceCategoriaExistente].cantidad = (parseInt(this.itemsDisplay[indiceCategoriaExistente].cantidad) + parseInt(this.cantidadDisplay)).toString()
  }
}
}

sacarUnItem(obj){

  obj.cantidad = obj.cantidad - 1;
  if (obj.cantidad == 0){
    let indexAEliminar = this.itemsDisplay.findIndex( element => {return element.selector == obj.selector})
    this.itemsDisplay.splice(indexAEliminar, 1);
  }
}

cancelar(){
  this.guardar('true').then(()=>{
    if (this.tipo == 'nuevoPedido'){
    this.loading(true);
    this.listadoPedidosProv.buscarListadoPedidos(this.token).then((pedidos:any)=>{
      this.dismissed = true;
      this.subscriptionTimer.unsubscribe();
      this.loading(false);
      this.httpValidate.validarHttp(pedidos).then((array)=>{
        console.log('el array ' + array)
        if(array['status'] == 'errorToken'){
          array['popup'].present();
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          array['popup'].present();
      }else{
      if (this.clienteDisplay == pedidos[0].CLIENT_NAME){
        this.ordenID = pedidos[0].ID_ORDER_STR
      }else{
        let toast = this.toastCtrl.create({
          message: 'No encontramos su pedido nuevo, por favor búsquelo manualmente en la lista',
          position: 'top',
          duration: 5000,
          showCloseButton: true,
          closeButtonText: 'Cerrar',
          cssClass: 'error'

        })
        toast.present();
      }
      }
    })
    })}

    let alert = this.alertCtrl.create({
      title: 'Confirmación',
      subTitle: '¿Está seguro que quiere cancelar éste pedido?',
      buttons: [{
        text:'Cancelar',
        role: 'cancel'
      },
    {
      text:'Aceptar',
      handler:()=>{
        this.loading(true);
        console.log(this.ordenID)
        console.log(this.token)
        this.listadoPedidosProv.cancelarPedido(this.token, this.ordenID).then((respuesta:any)=>{
          console.log(respuesta)
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          this.httpValidate.validarHttp(respuesta).then((array)=>{
            console.log('el array ' + array)
            if(array['status'] == 'errorToken'){
              array['popup'].present();
              this.app.getRootNav().setRoot('LoginPage');
            }else if(array['status'] == 'errorConnection'){
              array['popup'].present();

          }else{
            if (respuesta.CODE == 'ajaxcodeVALIDATE_FAILED'){
              if (respuesta.MESSAGE != null && respuesta.MESSAGE !=undefined){
                let toast = this.toastCtrl.create({
                  message: respuesta.MESSAGE,
                  position: 'top',
                  duration: 3000,
                  showCloseButton: true,
                  closeButtonText: 'Cerrar',
                  cssClass: 'error'

                })
                toast.present();
              }else{
                let toast = this.toastCtrl.create({
                  message: 'Ocurrió un error al cancelar el pedido!',
                  position: 'top',
                  duration: 3000,
                  showCloseButton: true,
                  closeButtonText: 'Cerrar',
                  cssClass: 'error'

                })
                toast.present();
              }
            }else if (respuesta.CODE == 'ajaxcodeUPDATE_SUCCESS'){
              let toast = this.toastCtrl.create({
                message: 'El pedido se canceló con éxito!',
                position: 'top',
                duration: 3000,
                showCloseButton: true,
                closeButtonText: 'Cerrar',
                cssClass: 'success'

              })
              toast.present();
            }
          }
          this.navCtrl.pop()
        })
        })
      }
    }]
    })
  alert.present()
  })

}

prepararPedido(){
  console.log(this.tipo)
  this.guardar('true').then(()=>{
    this.loading(true);
    if (this.tipo == 'nuevoPedido'){
      this.listadoPedidosProv.buscarListadoPedidos(this.token).then((pedidos:any)=>{
        console.log(pedidos)
        this.dismissed = true;
        this.subscriptionTimer.unsubscribe();
        this.loading(false);
        this.httpValidate.validarHttp(pedidos).then((array)=>{
          console.log('el array ' + array)
          if(array['status'] == 'errorToken'){
            array['popup'].present();
            this.app.getRootNav().setRoot('LoginPage');
          }else if(array['status'] == 'errorConnection'){
            array['popup'].present();
        }else{
        if (this.clienteDisplay == pedidos[0].CLIENT_NAME){
          this.navCtrl.push('MoverBarrilModalPage', {
            comando: 'Entregar',
            extra: 'preparacionPedido',
            ordenID: pedidos[0].ID_ORDER_STR,
            clientePreparacion: this.clienteDisplay,
            itemsPedido: this.itemsDisplay
          })
        }else{
          let toast = this.toastCtrl.create({
            message: 'No encontramos su pedido nuevo, por favor búsquelo manualmente en la lista',
            position: 'top',
            duration: 5000,
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            cssClass: 'error'

          })
          toast.present();
        }
        }
      })
      })
    }else{
      this.dismissed = true;
      this.subscriptionTimer.unsubscribe();
      this.loading(false);
      this.navCtrl.push('MoverBarrilModalPage', {
        comando: 'Entregar',
        extra: 'preparacionPedido',
        ordenID: this.ordenID,
        clientePreparacion: this.clienteDisplay,
        itemsPedido: this.itemsDisplay
      })
    }
  })

}

}
