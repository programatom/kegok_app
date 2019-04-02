import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, App, AlertController, Platform, Events, Nav, Content} from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { NgClass } from '@angular/common';

// Providers
import { HomeInfoProvider } from '../../providers/home-info/home-info';
import { HttpValidateProvider } from '../../providers/http-validate/http-validate';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { VersionProvider } from '../../providers/version/version';
import { GraficosProvider } from '../../providers/graficos/graficos';
import { ToastProvider } from '../../providers/toast/toast';


// rxjs
import { timer } from 'rxjs/observable/timer';


// Plugins
import { AppVersion } from '@ionic-native/app-version';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Market } from '@ionic-native/market';
import { Device } from '@ionic-native/device';
import { Chart } from 'chart.js';
import { InAppBrowser } from '@ionic-native/in-app-browser';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {


  @ViewChild(Nav) nav: Nav;
  showSplash:boolean = false;
  showSplashContent:boolean = false;
  pauseScanIdentifier:boolean = false;
  token:string;

  arrayProd:any;

  velocidades = {};

  refreshHabilitado:boolean = false;

  vistaHome = 'general';



  // Variables operativas
  removeFadeOnEnter:boolean = false;

  // Gráficos

  @ViewChild('doughnutCanvas') doughnutCanvas;
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild("contenido") contenido: Content;

   // Pie
   datosPieCargados = false;
   coloresPie = [];
   pieDataLabels:any;
   pieDataCantidades:any;
   doughnutChart:any;

   // Chart
   datosLineCargados = false;
   lineChart:any;
   datosLineChart:any;


   datosBarrilesAfuera:any;
   datosBarrilesCargados:boolean = false;

   arrayEntregadoAClientes:any = [];
   arrayEntregadoAClientesCargado:boolean = false;
   chartColors = [
       'rgb(255, 99, 132)',
    	 'rgb(255, 159, 64)',
    	 'rgb(255, 205, 86)',
    	 'rgb(75, 192, 192)',
    	 'rgb(54, 162, 235)',
    	 'rgb(153, 102, 255)',
    	 'rgb(201, 203, 207)',
    	 'rgb(0, 0, 0)',
    	 'rgb(23, 182, 108)',
    	 'rgb(255, 0, 127)',
    	 'rgb(102, 255, 255)',
    	 'rgb(213, 240, 235)',
    	 'rgb(234, 35, 240)',
    	 'rgb(79, 144, 15)'

  ] ;

   // Inicializado
   vistaInicializadaObject = {
     "pie" : false,
     "line":false,
     "entregadoAClientes":false,
     "barrilesFuera":false
   }

   refresher:any;
   dataTotalizador = ["0//100","0//100","0//100","0//100"]
   totalizadorCargado = false;

  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public homeInfo: HomeInfoProvider,
              public localStorage: LocalStorageProvider,
              private app: App,
              private alertCtrl: AlertController,
              private plt: Platform,
              private httpValidate: HttpValidateProvider,
              private appVersion: AppVersion,
              private versionProv: VersionProvider,
              private diagnostic: Diagnostic,
              private market: Market,
              private event: Events,
              private device: Device,
              private graficosProv: GraficosProvider,
              private inAppBrowser: InAppBrowser,
              private toastProv: ToastProvider) {

                if (this.plt.is('android')){
                  this.event.subscribe('scanPause',()=>{
                    this.pauseScanIdentifier = true;
                  })
                }
                this.plt.resume.subscribe(()=>{
                  if (this.pauseScanIdentifier == false){
                    console.log('Después del resume se hacen un refresh de la pantalla que este viendo el usuario')
                    this.doRefresh(null);
                  }else{
                    this.pauseScanIdentifier = false;
                    console.log('Hay un resume, pero vengo del scanner en Android, no se carga nada.')
                  }
                })
}


pruebaNgClassFN(){
  let asd
  if(asd){
    asd = false;
    asd = true;
  }else{
    asd = false;
    asd = true;
  }

}

ionViewWillEnter(){
  this.appVersion.getVersionNumber().then((version)=>{

    console.log('Busco la versión: ')
    console.log(version)
    let objVersionCheck = new Object()
    if(this.plt.is('ios')){
      objVersionCheck['version'] = version;
      objVersionCheck['so'] = 'IOS';
    }else{
      objVersionCheck['version'] = version;
      objVersionCheck['so'] = 'ANDROID';
    }

    this.versionProv.buscarVersion(objVersionCheck).then((respuesta)=>{
      console.log('Respuesta de la busqueda de versión: ' + respuesta)
      if( respuesta == true ){
        this.diagnostic.isWifiAvailable().then((hayWifi)=>{
          if ( hayWifi == true){
            this.alertUpdate();
          }else{
            console.log("no hay wifi")
          }
        },
        (error)=>{
          console.log('Hubo un error con el plugin diagnostics wifi available: ' + error)
        })
      }
    })

  },
    (error)=>{console.log('Hubo un error con el plugin version number: ' + error)
    }
  )
}

alertUpdate(){
  console.log('Me meto al cartel de android que debería sacar...')
  let alert = this.alertCtrl.create({
    title: 'Actualización',
    subTitle: '¡Hay una nueva versión disponible!. Actualice para disfrutar de las nuevas funciones y garantizar el correcto funcionamiento de la app.',
    buttons: [{
      text: 'Cancelar',
      role: 'cancel'
    },
    {
      text: 'Actualizar',
      handler: ()=>{
        // Acá debería dirigir al usuario a la appstore
        if (this.plt.is('ios')){
          this.inAppBrowser.create("itms-apps://itunes.apple.com/us/app/apple-store/id1439595101?mt=8");
        }else if (this.plt.is('android')){
          console.log('Me meto acá y funciona...');
          this.market.open('com.kegok.okapp');
          //this.inAppBrowser.create('https://play.google.com/store/apps/details?id=com.kegok.okapp');
        }
      }
    }]
  })
  alert.present();
}


loading(present:boolean){
  if(present){
    this.showSplash = true

  }else{
    this.showSplash = false

  }
}


logout(){
let alert = this.alertCtrl.create({
  title: 'Confirmación',
  subTitle: '¿Está seguro que desea salir de la sesión?',
  buttons: [{
    text: 'Cancelar',
    role: 'cancel'
  },
{
  text: 'Aceptar',
  handler: ()=>{
    this.localStorage.eliminarToken();
    this.loading(true);
    this.app.getRootNav().setRoot('LoginPage',{},{},()=>{
      this.loading(false);
    });
  }
}]
})
alert.present();
}

/*
if(this.plt.is('ios')){
  if(this.device.model != null){
    let deviceSplit = this.device.model.split('');
    if(parseInt(deviceSplit[6]) > 7){
      this.cargarDatos().then(()=>{
        this.refreshHabilitado = true;
      })
    }
  }else{
    this.doRefresh(null);
    this.token = this.localStorage.token;
  }
}else{
  this.token = this.localStorage.token;
  this.doRefresh(null);
}
*/
ionViewWillLoad(){
  this.token = this.localStorage.token;
  this.showSplashContent = true;
  this.doRefresh(null);

}

validarArrayHttp(array, refresher?){

  if(array['status'] == 'errorToken'){
    this.showSplash = false;
    array['popup'].present();
    this.app.getRootNav().setRoot('LoginPage');
    if(refresher != null){
      refresher.complete();
    }
  }else if(array['status'] == 'errorConnection'){
    this.showSplash = false;
    array['popup'].present();
    if(refresher != null){
      refresher.complete();
    }
  }else{
    return;
  }
}

cambioVista(){
  this.showSplashContent = true;
  if(this.vistaHome == 'stock' && this.vistaInicializadaObject.pie == false){
    this.vistaInicializadaObject.pie = true;
    this.cargarPie(null);
  }else if(this.vistaHome == 'prodYEntrega' && this.vistaInicializadaObject.line == false){
    this.vistaInicializadaObject.line = true;
    this.cargarChartLine(null);
  }else if(this.vistaHome == 'barrilesFuera'){
    this.cargarBarrilesAfuera(null);
  }else if(this.vistaHome == 'entregado'){
    this.cargarEntregadoAClientes(null);
  }
}

cargarBarrilesAfuera(refresher?){
  this.datosBarrilesAfuera = [];
  this.showSplashContent = true;
  this.graficosProv.buscarBarrilesAfuera(this.localStorage.token).then((data:any)=>{
    this.httpValidate.validarHttp(data).then((array:any)=>{
      this.showSplashContent = false;
      this.validarArrayHttp(array, refresher);
      this.datosBarrilesAfuera = data;
      for (let i = 0; i <= data.length - 1; i ++){
        let numeroDeDias = parseInt(this.datosBarrilesAfuera[i].DAYS_OUT);
        if( numeroDeDias < 15 ){
          this.datosBarrilesAfuera[i]['iconoName'] = 'kegok-checkbox';
          this.datosBarrilesAfuera[i]['iconoColor'] = 'verde';
        }else if( numeroDeDias < 25){
          this.datosBarrilesAfuera[i]['iconoName'] = 'kegok-speaker';
          this.datosBarrilesAfuera[i]['iconoColor'] = 'warning';
        }else{
          this.datosBarrilesAfuera[i]['iconoName'] = 'kegok-flash';
          this.datosBarrilesAfuera[i]['iconoColor'] = 'dangerCustom';
        }
      }
      this.datosBarrilesCargados = true;
      if(refresher != null){
        refresher.complete();
      }
    })
  });
}

cargarPie(refresher?){
  this.showSplashContent = true;
  this.datosPieCargados = false;
  this.graficosProv.buscarDatosPie(this.localStorage.token).then((data:any)=>{
    this.httpValidate.validarHttp(data).then((array:any)=>{
      this.validarArrayHttp( array, refresher );
      let keys = Object.keys(data);
      let keysLength = keys.length - 1
      let keysYcantidad:any = [];
      let cantidades:any = [];
      this.coloresPie = [];
      for(let i = 0; i <= keysLength; i ++){
        keysYcantidad.push(keys[i] + ' (' + data[keys[i]] + ' lts.)');
        cantidades.push(data[keys[i]]);
      }
      let coloresMax = this.chartColors.length - 1;
      // Evaluar antes y meterle de más al array de colores
      let proporcion:number;
      let cantidadDeVueltas:number = 1;
      if( keysLength > coloresMax){
         proporcion = keysLength/coloresMax;
         cantidadDeVueltas = Math.ceil(proporcion)
      }
      for(let v = 1; v <= cantidadDeVueltas; v ++){
        for(let n = 0; n <= coloresMax; n++){
          this.coloresPie.push(this.chartColors[n]);
        }
      }
      this.pieDataCantidades = cantidades;
      this.pieDataLabels = keysYcantidad;
      this.datosPieCargados = true;
      // Acá ya tengo todas las variables que le tengo que pasar al componente. Ya definidas así, se le puede pasar al componente.
    });
    })
}

componentInit(component){
  this.showSplashContent = false;
  console.log('Desde el componentInit() tengo a éste component: ');
  console.log(component);
  if(this.refresher != null){
    this.refresher.complete();
  }
  if(component == 'stock-pie'){
    this.showSplashContent = false;
  }else if(component == 'general'){
    this.refreshHabilitado = true;
    this.showSplashContent = false;
  }else{
    this.showSplashContent = false;
  }
}

cargarChartLine(refresher?){
  this.showSplashContent = true;
  this.datosLineCargados = false;
  this.graficosProv.buscarDatosLine(this.localStorage.token).then((data:any)=>{
    this.httpValidate.validarHttp(data).then((array:any)=>{
      this.validarArrayHttp(array, refresher);
      this.datosLineChart = data;
      this.datosLineCargados = true;
    })
  });
}

cargarEntregadoAClientes(refresher?){

  this.arrayEntregadoAClientes = [];
  this.showSplashContent = true;
  this.graficosProv.buscarEntregadoClientes(this.localStorage.token).then((resp:any)=>{
    this.httpValidate.validarHttp(resp).then((array)=>{
      this.validarArrayHttp(array, refresher);
      this.showSplashContent = false;
      this.arrayEntregadoAClientes = resp;

      let objColors1 = new Object();
      let objColors2 = new Object();
      let objColors3 = new Object();
      let colorsIndex = 1;
      objColors1["selectColor1"] = true;
      objColors1["selectColor3"] = false;
      objColors1["selectColor5"] = false;

      objColors2["selectColor1"] = false;
      objColors2["selectColor3"] = true;
      objColors2["selectColor5"] = false;

      objColors3["selectColor1"] = false;
      objColors3["selectColor3"] = false;
      objColors3["selectColor5"] = true;

      for(let i = 0; i <= resp.length - 1; i ++){
        let arrayEstilos = this.arrayEntregadoAClientes[i]['styles'];
        let arrayEstilosNuevo = [];
        for(let n = 0; n <= this.arrayEntregadoAClientes[i]['styles'].length - 1; n ++){
          let itemSplit = arrayEstilos[n].split('//');
          let objEstilosNuevo = {
            "estilo":itemSplit[0],
            "capacidad":itemSplit[1],
          }

          arrayEstilosNuevo.push(objEstilosNuevo);

        }
        this.arrayEntregadoAClientes[i]['styles'] = arrayEstilosNuevo;

        if( colorsIndex == 1 ){
          this.arrayEntregadoAClientes[i]['ngClass'] = objColors1;
        }else if ( colorsIndex == 2){
          this.arrayEntregadoAClientes[i]['ngClass'] = objColors2;
        }else if ( colorsIndex == 3){
          this.arrayEntregadoAClientes[i]['ngClass'] = objColors3;
        }
        colorsIndex = colorsIndex + 1;
        if(colorsIndex > 3){
          colorsIndex = 1;
        }
      }
      this.arrayEntregadoAClientesCargado = true;
    })
  })
}

cargarGeneral(refresher?){
  let dataLoad = ["0//0","0//0","0//0","0//0"];
  this.dataTotalizador = dataLoad;
  this.totalizadorCargado = false;
  this.homeInfo.buscarEstadisticas(this.token).then((data:any)=>{
    this.httpValidate.validarHttp(data).then((array)=>{
      this.validarArrayHttp(array, refresher);
      console.log(data);
      this.dataTotalizador = data;
      this.totalizadorCargado = true;
    })
  })
}

pull(refresher){
  if ( refresher != undefined ){
    console.log(refresher)
  }
}

doRefresh(refresher){
  if ( refresher != undefined ){
    this.refresher = refresher;
  }
  if ( refresher != null ){
    this.refresher = refresher;
  }
  if(this.vistaHome == 'general'){
    this.cargarGeneral(refresher);
    if (refresher != null){
      refresher.complete();
    }
  }else if(this.vistaHome == 'prodYEntrega'){
    this.cargarChartLine(refresher);
    if (refresher != null){
      refresher.complete();
    }
  }else if(this.vistaHome == 'stock'){
    this.cargarPie(refresher);
    if (refresher != null){
      refresher.complete();
    }
  }else if(this.vistaHome == 'barrilesFuera'){
    this.cargarBarrilesAfuera(refresher);
    if (refresher != null){
      refresher.complete();
    }
  }else if(this.vistaHome == 'entregado'){
    this.cargarEntregadoAClientes(refresher);
    if (refresher != null){
      refresher.complete();
    }
  }

}

irAlSearch(clienteHome){
  this.navCtrl.push('ListadoPage',{"clienteHome":clienteHome});
}

/*
cargarDatos(){

  this.refreshHabilitado = false;
  this.total = 0;
  this.entregados = 0;
  this.stock = 0;
  this.fabrica = 0;

  this.totalMax = '';
  this.entregadosMax = '';
  this.stockMax = '';
  this.fabricaMax = '';

  this.totalPorcentaje = '';
  this.entregadosPorcentaje = '';
  this.stockPorcentaje = '';
  this.fabricaPorcentaje = '';

  this.loadProgressTotal = 0;
  this.loadProgressStock = 0;
  this.loadProgressFabrica = 0;
  this.loadProgressEntregados = 0;

return new Promise ((resolve,reject)=>{

  this.token = this.localStorage.token;
  console.log('En el home se busco la instancia del token en local storage: ' + this.token);
  this.homeInfo.buscarEstadisticas(this.token).then((data:any)=>{

  this.httpValidate.validarHttp(data).then((array)=>{
                if(array['status'] == 'errorToken'){
                  array['popup'].present();
                  this.app.getRootNav().setRoot('LoginPage');
                }else if(array['status'] == 'errorConnection'){
                  array['popup'].present();
                }else{

                      let i = 0;
                      for (i == 0; i <= 3; i++){

                        //TOTAL
                        if(i == 0){
                            let totalRaw = data[i]

                            let array = totalRaw.split('//');
                            this.totalMax = parseInt(array[0]);
                            this.totalPorcentaje = Math.round(parseInt(array[1]));
                            this.velocidades['totalMax'] = 2000/this.totalMax;
                            this.velocidades['totalPorc'] = 2000/this.totalPorcentaje;

                            if (this.plt.is('ios') && parseInt(array[0]) != 0){
                              //TOTAL
                            let interval5 = setInterval(()=>{
                              this.total+= 1;
                                this.plt.pause.subscribe(()=>{
                                  clearInterval(interval5)
                                })
                                if((Math.log(this.total) * Math.LOG10E + 1 | 0 )> (Math.log(this.totalMax) * Math.LOG10E + 1 | 0)){
                                  clearInterval(interval5)
                                  this.total = this.totalMax;
                                }
                                if(this.total >= this.totalMax){
                                  clearInterval(interval5);
                                  resolve()
                                }
                              },this.velocidades['totalMax']);
                            //TOTAL
                            let interval1 = setInterval(()=>{
                            this.loadProgressTotal+= 1;
                            this.plt.pause.subscribe(()=>{
                              this.total = this.totalMax;
                              this.loadProgressTotal = array[1];
                              console.log('Se cancela el interval total');
                              clearInterval(interval1);
                            })
                            if(this.loadProgressTotal >= this.totalPorcentaje){
                              clearInterval(interval1);
                              this.loadProgressTotal = array[1];
                            }
                          },this.velocidades['totalPorc']);
                            }else{
                              this.total = this.totalMax;
                              this.loadProgressTotal = array[1];
                            }

                  }


                  //ENTREGADOS
                          if(i == 1){

                          let totalRaw = data[i]

                          let array = totalRaw.split('//');

                          this.entregadosMax = parseInt(array[0])
                          this.entregadosPorcentaje = Math.round(parseInt(array[1]));
                          this.velocidades['entregadosNum'] = 2000/this.entregadosMax;
                          this.velocidades['entregadosPorc'] = 2000/this.entregadosPorcentaje;
                          if(this.plt.is('ios') && parseInt(array[0]) != 0){
                            //ENTREGADOS
                            let interval7 = setInterval(()=>{
                            this.entregados+= 1;
                            this.plt.pause.subscribe(()=>{
                              clearInterval(interval7)
                            })
                            if((Math.log(this.entregados) * Math.LOG10E + 1 | 0 )> (Math.log(this.entregadosMax) * Math.LOG10E + 1 | 0)){
                              clearInterval(interval7)
                              this.entregados = this.entregadosMax;
                            }
                            if(this.entregados >= this.entregadosMax){
                              clearInterval(interval7);
                            }
                          }, this.velocidades['entregadosNum']);
                          //ENTREGADOS
                          let interval4 = setInterval(()=>{
                          this.loadProgressEntregados+= 1;
                          this.plt.pause.subscribe(()=>{
                            this.loadProgressEntregados = array[1];
                            this.entregados = this.entregadosMax;
                            console.log('Se cancela el interval entregados');
                            clearInterval(interval4);
                          })
                          console.log(this.loadProgressEntregados);
                          if(this.loadProgressEntregados>=this.entregadosPorcentaje){
                            clearInterval(interval4);
                            this.loadProgressEntregados = array[1]

                          }
                        }, this.velocidades['entregadosPorc']);

                          }else{
                            this.loadProgressEntregados = array[1];
                            this.entregados = this.entregadosMax;
                          }

                        }

                        //STOCK
                        if(i == 2){
                          let totalRaw = data[i]

                          let array = totalRaw.split('//');
                          this.stockMax = parseInt(array[0]);
                          this.stockPorcentaje = Math.round(parseInt(array[1]));
                          this.velocidades['stockNum'] = 2000/this.stockMax;
                          this.velocidades['stockPorc'] = 2000/this.stockPorcentaje;


                          if(this.plt.is('ios') && parseInt(array[0]) != 0){
                            let interval6 = setInterval(()=>{
                              this.stock+= 1;
                              this.plt.pause.subscribe(()=>{
                                clearInterval(interval6)
                              })
                              if(this.stock >= this.stockMax){
                                clearInterval(interval6);
                              }
                            }, this.velocidades['stockNum']);
                            //STOCK
                            let interval2 = setInterval(()=>{
                            this.loadProgressStock+= 1;
                            this.plt.pause.subscribe(()=>{
                              console.log('Se cancela el interval stock');
                              clearInterval(interval2);
                              this.stock = this.stockMax;
                              this.loadProgressStock = array[1];
                            })
                            if((Math.log(this.stock) * Math.LOG10E + 1 | 0 )> (Math.log(this.stockMax) * Math.LOG10E + 1 | 0)){
                              clearInterval(interval2)
                              this.stock = this.stockMax;
                            }
                            if(this.loadProgressStock>=this.stockPorcentaje){
                              clearInterval(interval2);
                              this.loadProgressStock = array[1]

                            }
                          },this.velocidades['stockPorc']);
                        }else{
                          this.stock = this.stockMax;
                          this.loadProgressStock = array[1];
                        }
                          //STOCK
                        }

                //FABRICA
                    if(i == 3){
                      let totalRaw = data[i]

                      let array = totalRaw.split('//');
                      this.fabricaMax = parseInt(array[0]);
                      this.fabricaPorcentaje = Math.round(parseInt(array[1]));
                      this.velocidades['fabricaNum'] = 2000/this.fabricaMax;
                      this.velocidades['fabricaPorc'] = 2000/this.fabricaPorcentaje;
                      if(this.plt.is('ios') && parseInt(array[0]) != 0){
                        //FABRICA
                        let interval8 = setInterval(()=>{
                        this.fabrica+= 1;
                        this.plt.pause.subscribe(()=>{
                          clearInterval(interval8)
                        });
                        if((Math.log(this.fabrica) * Math.LOG10E + 1 | 0 )> (Math.log(this.fabricaMax) * Math.LOG10E + 1 | 0)){
                          clearInterval(interval8)
                          this.fabrica = this.fabricaMax;
                        }
                        if(this.fabrica >= this.fabricaMax){
                          clearInterval(interval8);
                        }
                      }, this.velocidades['fabricaNum']);

                      //FABRICA
                      let interval3 = setInterval(()=>{
                      this.loadProgressFabrica+= 1;
                      this.plt.pause.subscribe(()=>{
                        this.loadProgressFabrica = array[1];
                        this.fabrica = this.fabricaMax;
                        console.log('Se cancela el interval fabrica');
                        clearInterval(interval3);
                      });

                      if(this.loadProgressFabrica>=this.fabricaPorcentaje){
                        this.loadProgressFabrica = array[1];
                        console.log('Se terminan las animaciones')
                        clearInterval(interval3);
                      }
                    }, this.velocidades['fabricaPorc']);
                  }else{
                    this.loadProgressFabrica = array[1];
                    this.fabrica = this.fabricaMax;
                  }

                    }
                    }
                  }
            })
    })
  }) //Se cierra el then de la promesa
}
*/

}
