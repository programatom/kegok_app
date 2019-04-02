import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, Content, App, AlertController, Platform,
         ToastController, Events} from 'ionic-angular';

//Providers
import { ListadoPedidosProvider } from '../../providers/listado-pedidos/listado-pedidos'
import { LocalStorageProvider } from '../../providers/local-storage/local-storage'
import { HttpValidateProvider } from '../../providers/http-validate/http-validate'
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-pedidos',
  templateUrl: 'pedidos.html',
})
export class PedidosPage {
  pauseScanIdentifier:boolean = false;
  showSplashOpaque: any;

  @ViewChild(Content) content: Content;

  token:string;
  pedidosArray = [];
  input:string;

  existeSearch:boolean = false;
  noHayResultados:boolean = false;
  pedidosResultados = [];
  refreshHabilitado:boolean = false;

  showSplash:any = false;
  loadedPage:number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public modalCtrl: ModalController,
              public listadoPedidosProv: ListadoPedidosProvider,
              public localStorage: LocalStorageProvider,
              private app: App,
              private alertCtrl: AlertController,
              private plt: Platform,
              private toastCtrl: ToastController,
              private httpValidate: HttpValidateProvider,
              private event: Events,) {
                if (this.plt.is('android')){
                  this.event.subscribe('scanPause',()=>{
                    this.pauseScanIdentifier = true;
                  })
                }
                this.plt.resume.subscribe(()=>{
                  if (this.pauseScanIdentifier == false){
                    console.log('Después del resume se cargan los datos del listado de barriles.')
                    this.ionViewWillLoad();
                  }else{
                    this.pauseScanIdentifier = false;
                    console.log('Hay un resume, pero vengo del scanner en Android, no se carga nada.')
                  }
                })
  }


  doRefresh(refresher){

    this.listadoPedidosProv.buscarListadoPedidos(this.token).then((data:any)=>{
      console.log('Se cargan los pedidos: ')
      console.log(data)
      this.loadingFn(false)
      this.httpValidate.validarHttp(data).then((array)=>{
        console.log('el array ' + array)
        if(array['status'] == 'errorToken'){
          array['popup'].present();
          refresher.complete()
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          array['popup'].present();
          refresher.complete()
        }else{
          this.pedidosArray = data;
          this.content.resize();
          refresher.complete()
        }
      })
    })
  }

  agregarNuevoPedido(tipo, estado){
    this.navCtrl.push('ItemListadoPage',{
      tipo: tipo,
      estadoPedido: estado,
    })
  }

  loadingFn(bool){
      this.showSplash = bool;
  }

  irItem(numero, tipo, estado, fecha, cliente, ordenID, items, comentarios) {
    this.navCtrl.push( 'ItemListadoPage',
       { tipo: tipo,
         numero: numero,
         estadoPedido: estado,
         fecha: fecha,
         cliente: cliente,
         ordenID: ordenID,
         items: items,
         comments: comentarios} )
  }

  ionViewWillLoad(){
    this.content.scrollToTop().then(()=>{
      this.loadingFn(true)
      this.token = this.localStorage.token;
      this.refreshHabilitado = false;
        this.listadoPedidosProv.buscarListadoPedidos(this.token).then((data:any)=>{
          this.refreshHabilitado = true;

          console.log('Se cargan los pedidos: ')
          console.log(data)
          this.loadingFn(false)
          this.httpValidate.validarHttp(data).then((array)=>{
            if(array['status'] == 'errorToken'){
              array['popup'].present();
              this.app.getRootNav().setRoot('LoginPage');
            }else if(array['status'] == 'errorConnection'){
              array['popup'].present();
            }else{
              this.pedidosArray = data;
              this.content.resize();
            }
          })

        })
    });

  }

  ionViewWillEnter(){
    this.loadedPage += 1;
    if (this.loadedPage == 1){

    }else{
      this.refreshHabilitado = false;
        this.listadoPedidosProv.buscarListadoPedidos(this.token).then((data:any)=>{
          this.refreshHabilitado = true;

          console.log('Se cargan los pedidos: ')
          console.log(data)
          this.loadingFn(false)
          this.httpValidate.validarHttp(data).then((array)=>{
            if(array['status'] == 'errorToken'){
              array['popup'].present();
              this.app.getRootNav().setRoot('LoginPage');
            }else if(array['status'] == 'errorConnection'){
              array['popup'].present();
            }else{
              this.pedidosArray = data;
              this.content.resize();
            }
          })
        })
    }
  }

  buscarInput($event){
    this.noHayResultados = false;
    console.log(this.input);
    this.existeSearch = true;

    var inputLower = this.input.toLowerCase()
    this.pedidosResultados = [];
    var inputSplit = inputLower.split(' ');
    console.log(inputSplit.length)
    if (inputSplit.length == 1){
    if (this.input == ''){
      this.pedidosResultados = this.pedidosArray;
    }else{
      for (let n = 0; n <= this.pedidosArray.length - 1; n ++){
      //Acá barro cada item de pedidos array
      if (this.pedidosArray[n].CLIENT_NAME.toLowerCase().search(inputLower) != -1){
      this.pedidosResultados.push(this.pedidosArray[n])
        }else if(this.pedidosArray[n].DATE_TIME_STR.toLowerCase().search(inputLower) != -1){
          this.pedidosResultados.push(this.pedidosArray[n])
        }else if(this.pedidosArray[n].NUMBER.toLowerCase().search(inputLower) != -1){
          this.pedidosResultados.push(this.pedidosArray[n])
        }else if(this.pedidosArray[n].STATUS.toLowerCase().search(inputLower) != -1){
          this.pedidosResultados.push(this.pedidosArray[n])
        }
    }
    console.log(this.pedidosResultados)
    if (this.pedidosResultados.length == 0){
      this.noHayResultados = true;
    }
  }
}else{
  let indicesMatch = [];

  let limiteSplice = inputSplit.length - 1;
  let inputSplitLimpio = [];
  for(let i = 0; i <= limiteSplice; i ++){
    if(inputSplit[i] != ''){
      inputSplitLimpio.push(inputSplit[i]);
    }
  }
  inputSplit = inputSplitLimpio;
  console.log(inputSplit)
  for (let n = 0; n <= this.pedidosArray.length - 1; n ++){
    //Dentro de un pedido del array, barro todas las palabras del input
    var contadorMatch = 0;
    for (let i = 0; i <= inputSplit.length - 1; i ++){
      if (inputSplit[i] == ''){
        contadorMatch += 1;
      }else{
      if (this.pedidosArray[n].CLIENT_NAME.toLowerCase().search(inputSplit[i]) != -1){
          contadorMatch += 1
        }else if(this.pedidosArray[n].DATE_TIME_STR.toLowerCase().search(inputSplit[i]) != -1){
          contadorMatch += 1
        }else if(this.pedidosArray[n].NUMBER.toLowerCase().search(inputSplit[i]) != -1){
          contadorMatch += 1
        }else if(this.pedidosArray[n].STATUS.toLowerCase().search(inputSplit[i]) != -1){
          contadorMatch += 1
        }
    }
    }
    if (contadorMatch == inputSplit.length){
      this.pedidosResultados.push(this.pedidosArray[n])
    }
  }
  console.log(this.pedidosResultados)
  if (this.pedidosResultados.length == 0){
    this.noHayResultados = true;
  }
}
}



}
