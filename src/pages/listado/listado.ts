import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, Content, Events, App, AlertController, Platform
         ,ToastController} from 'ionic-angular';

//Providers
import { ListadoBarrilesProvider } from '../../providers/listado-barriles/listado-barriles'
import { LocalStorageProvider } from '../../providers/local-storage/local-storage'
import { HttpValidateProvider } from '../../providers/http-validate/http-validate';
//Plugins
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { timer } from 'rxjs/observable/timer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-listado',
  templateUrl: 'listado.html',
})
export class ListadoPage {
  showSplashScan: boolean;
  loader: any;
  subscriptionTimer: any;

  timer: any;
  dismissed: boolean;

@ViewChild('content') content;
pauseScanIdentifier:boolean = false;
showSplash:boolean = false;
scrollHabilitado:boolean = false;

//ARRAYS
arrayProductos:any;
arrayProductosEditado:any = []
arrayProductosScroll:any = [];
arrayProductosScrollDisplay:any = [];

//CASO INPUT CON DOS palabras
indicesConMatch:any = [];

//CONTADORES
i:number = 0; //contador del infinite scrolling normal


inputCrudo:any= '';
input:any = '';


tipoBusqueda:string;
noHayResultados:boolean = false;

estilosArray:any = [];
clientesArray:any = [];

indicesConMatch1:any;
indicesConMatch2:any;
indicesConMatch3:any;
indicesConMatch4:any;
indicesConMatch5:any;
indicesConMatch6:any;

barcodeText:any;
refreshHabilitado:boolean = false;

modal:boolean = false;


  constructor(private navCtrl: NavController, private navParams: NavParams,
              private modalCtrl: ModalController,
              private listadoBarrilesProv: ListadoBarrilesProvider,
              private localStorage: LocalStorageProvider,
              private event: Events, private barcodeScanner: BarcodeScanner,
              private app: App,
              private alertCtrl: AlertController,
              private plt: Platform,
              private toastCtrl: ToastController,
              private httpValidate: HttpValidateProvider) {

                if (this.navParams.get("modal")){
                  this.modal = true;
                }

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

  dismissModal(){
    this.navCtrl.pop();
  }


  doRefresh(refresher){
    this.cargarDatos(refresher).then(()=>{
      console.log('Hay una busqueda hecha, entonces se hace un load de todos los productos con resultado y se renueva la lista cruda ')
      console.log(this.arrayProductosEditado)
      console.log('Se actualizan los productos en el display')
      for(let n = 0; n <= this.arrayProductosScrollDisplay.length - 1; n ++){
        let index = this.arrayProductosEditado.findIndex((element)=> {return element.IDENTIFICATION == this.arrayProductosScrollDisplay[n].IDENTIFICATION})
        this.arrayProductosScrollDisplay[n].STATUS = this.arrayProductosEditado[index].STATUS
        this.arrayProductosScrollDisplay[n].CLIENT_NAME = this.arrayProductosEditado[index].CLIENT_NAME
        this.arrayProductosScrollDisplay[n].STYLE_NAME = this.arrayProductosEditado[index].STYLE_NAME
      }
      console.log(this.arrayProductosScrollDisplay)
      refresher.complete()
    })
  }


  ionViewWillLoad(){
        this.i = 0;
        this.arrayProductosScroll = [];
        this.arrayProductosScrollDisplay = [];
        this.refreshHabilitado = false;
        this.loading(true);
        this.cargarDatos().then(()=>{
          this.arrayProductosScroll = this.arrayProductosEditado;
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);
            for (this.i ; this.i <= 15; this.i++) {
            this.arrayProductosScrollDisplay.push( this.arrayProductosScroll[this.i] );
          }
          this.refreshHabilitado = true;
          if(this.navParams.get('buscar')!= undefined){
            this.input = this.navParams.get('buscar');
            console.log(this.input)
            this.buscarInput(null);
          }
        })
  }

  cargarDatos(refresher?){

    return new Promise ((resolve,reject)=>{
    this.arrayProductosEditado = [];

    let token = this.localStorage.token;
    this.listadoBarrilesProv.buscarListadoBarriles(token).then((data)=>{

      this.httpValidate.validarHttp(data).then((array)=>{
        console.log("El listado de barriles: ");
        console.log(data)
        if(array['status'] == 'errorToken'){
          if (refresher!=undefined){
            refresher.complete();
          }
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          array['popup'].present();
          this.app.getRootNav().setRoot('LoginPage');
        }else if(array['status'] == 'errorConnection'){
          if (refresher != undefined){
            refresher.complete();
          }
          this.dismissed = true;
          this.subscriptionTimer.unsubscribe();
          this.loading(false);
          array['popup'].present();
        }else{
          this.arrayProductos = data;
          for (let i = 0; i <= this.arrayProductos.length - 1 ; i ++){

          let obj = {
            IDENTIFICATION: this.arrayProductos[i].IDENTIFICATION,
            CAPACITY_STR: this.arrayProductos[i].CAPACITY_STR,
            STATUS: this.arrayProductos[i].STATUS,
            STYLE_NAME: this.arrayProductos[i].STYLE_NAME,
            CLIENT_NAME: this.arrayProductos[i].CLIENT_NAME,
            LOTE: this.arrayProductos[i].LOTE
          }
          this.arrayProductosEditado.push(obj)
        }
        resolve();
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

        this.scrollHabilitado = false;
        this.showSplash = true;
        this.dismissed = false;

        this.timer = timer(30000);
      this.subscriptionTimer = this.timer.subscribe(()=>{
        if (this.dismissed == false){
          console.log('Se activo el timer')
          this.showSplash = false;
          let toast = this.toastCtrl.create({
            message: 'Hubo un timeout con el servidor, inténtelo nuevamente',
            duration: 4000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            cssClass: 'error'
          })
          toast.present()
        }
      })
    }else{
      this.showSplash = false;
      this.scrollHabilitado = true;
      }
    }
  }

  loadingScan(present:boolean){

    if (present){
      this.showSplashScan = true;
    }else{
      this.showSplashScan = false;
    }
  }

  scan(){
    this.loadingScan(true);
    console.log('Se ejectuta la función scan');
    if (this.plt.is('android')){
      this.event.publish('scanPause');
    }
    this.barcodeScanner.scan().then((barcodeData:any) => {
      this.dismissed = true;
      this.subscriptionTimer.unsubscribe();
      this.loadingScan(false);
      console.log('Barcode data', barcodeData.text);
      this.barcodeText = barcodeData.text
      this.input = barcodeData.text
      this.buscarInput(null);
  }).catch(err => {
      console.log('Error', JSON.stringify(err));
      this.dismissed = true;
      this.subscriptionTimer.unsubscribe();
      this.loadingScan(false);
      let toast = this.toastCtrl.create({
        message: 'Ocurrió un error con el scanner: ' + err,
        duration: 4000,
        position: 'top',
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        cssClass: 'error'
      })
      toast.present();
  });
  }

  irItem(capacidad, id, estado, estilo, cliente, tipo) {
    this.navCtrl.push( 'ItemListadoPage',
       { tipo: tipo,
         id: id,
         estado:estado,
         capacidad:capacidad,
         estilo:estilo,
         cliente:cliente} )
  }


  buscarInput($event){
    this.noHayResultados = false;
    this.i = 0;
    this.scrollHabilitado = true;
    this.arrayProductosScroll = [];
    this.arrayProductosScrollDisplay = [];

    var inputLower = this.input.toLowerCase()
    var inputSplit = this.input.split(' ');
    console.log('Se busca: ' + inputSplit)


    if (inputSplit.length == 1){
    this.arrayProductosScroll = [];
    if (this.input == ''){
      this.arrayProductosScroll = this.arrayProductosEditado;
      let limite = 15;
      if (this.arrayProductosScroll.length < 15){
        limite = this.arrayProductosScroll.length - 1
      }
      for (this.i ; this.i <= limite; this.i++) {
        this.arrayProductosScrollDisplay.push( this.arrayProductosScroll[this.i] );
      }
    }else{

      for (let n = 0; n <= this.arrayProductosEditado.length - 1; n ++){
      //Acá barro cada item de pedidos array
      let existeMatch = false;
      if (this.arrayProductosEditado[n].IDENTIFICATION.toLowerCase().search(inputLower) != -1){
      this.arrayProductosScroll.push(this.arrayProductosEditado[n])
      existeMatch = true;
      }
      if(existeMatch == false && this.arrayProductosEditado[n].STATUS.toLowerCase().search(inputLower) != -1){
        this.arrayProductosScroll.push(this.arrayProductosEditado[n]);
        existeMatch = true;
      }
      if(existeMatch == false && this.arrayProductosEditado[n].CLIENT_NAME != null){
        if(this.arrayProductosEditado[n].CLIENT_NAME.toLowerCase().search(inputLower)!= -1){
          this.arrayProductosScroll.push(this.arrayProductosEditado[n]);
          existeMatch = true;
        }
      }
      if(existeMatch == false && this.arrayProductosEditado[n].STYLE_NAME != null){
        if(this.arrayProductosEditado[n].STYLE_NAME.toLowerCase().search(inputLower)!= -1){
          this.arrayProductosScroll.push(this.arrayProductosEditado[n]);
          existeMatch = true;
        }
      }
      if(existeMatch == false && this.arrayProductosEditado[n].CAPACITY_STR != null){
        if(this.arrayProductosEditado[n].CAPACITY_STR.search(inputLower)!= -1){
          this.arrayProductosScroll.push(this.arrayProductosEditado[n]);
          existeMatch = true;
      }
    }
      if(existeMatch == false && this.arrayProductosEditado[n].LOTE != null){
        if(this.arrayProductosEditado[n].LOTE.toLowerCase().search(inputLower)!= -1){
          this.arrayProductosScroll.push(this.arrayProductosEditado[n]);
          existeMatch = true;
      }
    }

    }
  }
  }else{
    let limiteSplice = inputSplit.length - 1;
    let inputSplitLimpio = [];
    for(let i = 0; i <= limiteSplice; i ++){
      if(inputSplit[i] != ''){
        inputSplitLimpio.push(inputSplit[i]);
      }
    }
      console.log(inputSplitLimpio)
      for (let n = 0; n <= this.arrayProductosEditado.length - 1; n ++){
        //Dentro de un pedido del array, barro todas las palabras del input
        var contadorMatch = 0;
        for (let i = 0; i <= inputSplitLimpio.length - 1; i ++){

            let inputLower = inputSplitLimpio[i].toLowerCase();
            let existeMatch = false;
            if (this.arrayProductosEditado[n].IDENTIFICATION.toLowerCase().search(inputLower) != -1){
                contadorMatch += 1;
                existeMatch = true;
            }
            if(this.arrayProductosEditado[n].STATUS.toLowerCase().search(inputLower) != -1 && existeMatch == false){
                contadorMatch += 1;
                existeMatch = true;
            }
            if(this.arrayProductosEditado[n].CLIENT_NAME != null &&  existeMatch == false ){
              if(this.arrayProductosEditado[n].CLIENT_NAME.toLowerCase().search(inputLower) != -1 ){
                contadorMatch += 1;
                existeMatch = true;
              }
            }
            if(this.arrayProductosEditado[n].STYLE_NAME != null &&  existeMatch == false){
              if(this.arrayProductosEditado[n].STYLE_NAME.toLowerCase().search(inputLower) != -1){
                contadorMatch += 1;
                existeMatch = true;
              }
            }
            if(this.arrayProductosEditado[n].CAPACITY_STR != null &&  existeMatch == false){
              if(this.arrayProductosEditado[n].CAPACITY_STR.search(inputLower)!= -1){
                contadorMatch += 1;
                existeMatch = true;
            }
      }
            if(existeMatch == false && this.arrayProductosEditado[n].LOTE != null){
              if(this.arrayProductosEditado[n].LOTE.toLowerCase().search(inputLower)!= -1){
                this.arrayProductosScroll.push(this.arrayProductosEditado[n]);
                existeMatch = true;
            }
          }
    }
      if (contadorMatch == inputSplitLimpio.length){
        this.arrayProductosScroll.push(this.arrayProductosEditado[n])
    }

    }
    }

    console.log('El listado con todos los resultados de la search: ');
    console.log(this.arrayProductosScroll);

    let limite = 15;

    if (this.arrayProductosScroll.length <= 15){
      limite = this.arrayProductosScroll.length;
    }

    for (this.i ; this.i <= limite - 1; this.i++) {
      if(this.arrayProductosScroll[this.i] != undefined){
        this.arrayProductosScrollDisplay.push( this.arrayProductosScroll[this.i] );
      }
    }

    console.log(this.arrayProductosScrollDisplay)
    if (this.arrayProductosScroll.length == 0){
      this.noHayResultados = true;
    }
  }

  doInfinite(infiniteScroll){


        console.log(this.i)
        let limite = this.i + 15
        console.log(limite)
        console.log(this.arrayProductosScroll.length)
        if(limite > this.arrayProductosScroll.length - 1){
          limite = this.arrayProductosScroll.length - 1;
          console.log('Se bloquea el infiniteScroll')
          console.log(limite)
          this.scrollHabilitado = false;
          console.log(this.arrayProductosScroll)
        }
        for (this.i ; this.i <= limite; this.i++) {
          this.arrayProductosScrollDisplay.push( this.arrayProductosScroll[this.i] );
        }

        infiniteScroll.complete();
}

}
