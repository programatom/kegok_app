import { Component, ViewChild } from '@angular/core';
import {
  NavController, NavParams, AlertController, App,
  LoadingController, ToastController,
  ModalController, Events,
  Platform
} from 'ionic-angular';

//Plugins
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeKeyboard, NativeKeyboardOptions } from '@ionic-native/native-keyboard';


//Providers
import {  MovimientoBarrilProvider } from '../../providers/movimiento-barril/movimiento-barril';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { ListadoBarrilesProvider } from '../../providers/listado-barriles/listado-barriles'
import { timer } from 'rxjs/observable/timer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { HttpValidateProvider } from '../../providers/http-validate/http-validate'
import { ProcesadorDeInputProvider } from '../../providers/procesador-de-input/procesador-de-input'


interface objSelector {
  selector: number; estilo: string; capacidad: string; productos: any; mostrarItems: boolean; signo: string;
}
interface ArraySelectores extends Array<objSelector> { }

interface productoIdIndex {
  id: string;
  idUnicoConfirmacion: number;
}
interface ArrayProductos extends Array<productoIdIndex> { }
import { IonicPage } from 'ionic-angular';

@IonicPage()


@Component({
  selector: 'page-mover-barril-modal',
  templateUrl: 'mover-barril-modal.html',
})

export class MoverBarrilModalPage {

  // Android vars
  scanIdentifier: boolean = false;

  // Audio
  audioOK = new Audio();
  audioERROR = new Audio();

  // Variables SCAN SPLASH
  mensajeScanIcono: string;
  mensajeERROR: boolean;
  mensajeOk: boolean;
  showMessageScan: boolean = false;
  mensajeScan: any;
  showSplashScan: boolean;

  subscriptionTimerScan: Subscription;
  dismissedScan: boolean;

  showSplash: boolean;

  comando: any;
  preparacionPedido: boolean = false;
  timer: Observable<number>;
  //todas tienen un ingreso de ID (el ingreso a fabrica es solo de UN id)
  id: any = '';
  idDisplay: any = '';

  //ENTREGAR valores a envíar para validación
  cliente: any = '0';
  clienteDisplay: string;

  //Clientes cargados en el ionViewDidLoad
  clientes: any = [];
  clientesArray: any = []
  //Estilos cargados en el ionViewDidLoad
  estilos: any = [];
  estilosArray: any = [];

  //EMBARRILAR valores a envíar para validación
  estilo: string = '0';
  estiloDisplay: string;
  lote: string = '';

  //Token de instancia
  token: string;

  //Todos tienen el listado de barriles
  ordenArray: any = {};
  ordenID: any = '';

  alertaLogin = this.alertCtrl.create({
    title: 'Se expiró la sesión',
    subTitle: 'Ingrese su usuario y contraseña nuevamente',
    buttons: ['Ok']
  })

  //Elemento loader solo utilizado dentro de la función loading
  loader: any;

  //Variables de uso para la validación
  listadoConfirmar: any = [];
  listadoDisplay: ArraySelectores = [];

  hayProductos: boolean = false;
  contadorProductos: number = 0;
  unificarLotes: any = '';
  unificaciónLote: boolean = false;
  loteAUnificar: string = '';
  pedidoDisplay: any = [];
  pedidoCompleto = 'danger';
  modalSearchIdentifier = false;
  listadoBarrilesParaEntregar: any = [];
  dismissed: boolean;
  subscriptionTimer: Subscription;

  // Éste callback lo envío al modal. Cuando hago un pop desde ese modal, hago un get de éste callback y le envío información.
  callback = (data: any) => {
    this.modalSearchIdentifier = data.identifier
    if (data.tipo == 'estilo') {
      this.estiloDisplay = data.eleccion
    } else if (data.tipo == 'cliente') {
      this.clienteDisplay = data.eleccion
    }

  };
  tabBarElement: any;
  inputPrueba: any;
  tipoInput = "number";

  @ViewChild("TextInput") textInput;

  inputAlpha: any = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner,
    private movimientoBarrilProv: MovimientoBarrilProvider,
    private localStorage: LocalStorageProvider,
    private app: App,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private listadoBarrilesProv: ListadoBarrilesProvider,
    private plt: Platform,
    private httpValidate: HttpValidateProvider,
    private event: Events,
    private procesadorDeInputProv: ProcesadorDeInputProvider,
    private keyboard: Keyboard,
    private nativeKeyboard: NativeKeyboard) {

    if(this.plt.is("android")){
      this.tipoInput = "text";
    }

    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.audioOK.src = 'assets/sounds/ok-beep.mp3'
    this.audioOK.load();
    this.audioOK.volume = 0.6;
    this.audioERROR.src = 'assets/sounds/error-beep.mp3'
    this.audioERROR.load();
    this.audioERROR.volume = 0.6;

  }


  //---------------------------------------------------------------------------------------------------------


  esconderKeyboard() {
    this.keyboard.hide();
  }


  //---------------------------------------------------------------------------------------------------------



  abrirModalSearch(tipo) {

    if (tipo == 'estilo') {
      let modal = this.modalCtrl.create('MoverBarrilModalSearchPage', { tipo: tipo, callback: this.callback, array: this.estilosArray });
      modal.present();
    }

    if (tipo == 'cliente') {
      let modal = this.modalCtrl.create('MoverBarrilModalSearchPage', { tipo: tipo, callback: this.callback, array: this.clientesArray });
      modal.present();
    }

  }


  //---------------------------------------------------------------------------------------------------------


  confirmar(origen) {

    //Acá, ya tengo en el listado display todos los productos. Sólo tengo que envíar el listado
    //de los productos confirmados post validación
    this.loading(true);
    console.log()

    //En el caso de embarrilado va a llegar un estilo en formato NOMBRE, aca lo paso a ID
    //lo mismo para el cliente en la ENTREGA
    if (origen == 'EMBARRILADO') {
      let indexEstilo = this.estilosArray.findIndex((element) => { return element.NAME == this.estiloDisplay });
      if (this.estilosArray[indexEstilo] == undefined) {
        this.estilo = '0'
      } else {
        this.estilo = this.estilosArray[indexEstilo].ID_STYLE_STR;
      }
    } else if (origen == 'ENTREGA') {
      let indexCliente = this.clientesArray.findIndex((element) => { return element.NAME == this.clienteDisplay });
      if (this.clientesArray[indexCliente] == undefined) {
        this.cliente = '0'
      } else {
        this.cliente = this.clientesArray[indexCliente].ID_CLIENT_STR;
      }
    }

    if (this.unificaciónLote == true) {
      if (this.lote == this.loteAUnificar) {
        this.unificarLotes = this.lote;
      }
      this.unificaciónLote = false;
    }

    let pedidoListo = true;
    if (this.preparacionPedido) {
      for (let f = 0; f <= this.pedidoDisplay.length - 1; f++) {
        console.log(this.pedidoDisplay[f].coincide)
        if (this.pedidoDisplay[f].coincide == 'verde') {
          pedidoListo = true;
        } else {
          pedidoListo = false;
          f = this.pedidoDisplay.length - 1;
        }
      }
    }

    if (pedidoListo == false) {
      this.dismissed = true;
      this.subscriptionTimer.unsubscribe();
      this.loading(false);
      let toast = this.toastCtrl.create({
        message: 'El pedido no está listo',
        duration: 3000,
        position: 'top',
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        cssClass: 'error'

      })
      toast.present();

    } else {
      console.log('Se enviaron los parametros a confirmar barril service---->  Listado Confirmar: ' + this.listadoConfirmar + ' El tipo: ' + origen + ' El cliente: ' + this.cliente + ' El lote: ' + this.lote + ' Unif Lotes: ' + this.unificarLotes + ' y orden ID: ' + this.ordenID)
      this.movimientoBarrilProv.confirmarBarriles(this.token, this.listadoConfirmar, origen, this.cliente, this.lote, this.unificarLotes, this.ordenID)
        .then((data: any) => {
          this.httpValidate.validarHttp(data).then((array) => {

            console.log('Data enviada por la confirmación del barril: ');
            console.log(data);
            if (array['status'] == 'errorToken') {
              this.dismissed = true;
              this.subscriptionTimer.unsubscribe();
              this.loading(false);
              array['popup'].present();
              this.app.getRootNav().setRoot('LoginPage');
            } else if (array['status'] == 'errorConnection') {
              this.dismissed = true;
              this.subscriptionTimer.unsubscribe();
              this.loading(false);
              array['popup'].present();
            } else {
              if (data.CODE == "ajaxcodeVALIDATE_FAILED") {
                if (data.CUSTOM_VALUE_I == '#LOTE_WARNING') {
                  this.dismissed = true;
                  this.subscriptionTimer.unsubscribe();
                  this.loading(false);
                  let toast = this.toastCtrl.create({
                    message: 'El lote ingresado ya existe. Por favor cambie el número. De lo contrario, presione nuevamente guardar y los lotes se unificarán.',
                    duration: 10000,
                    position: 'top',
                    showCloseButton: true,
                    closeButtonText: 'Cerrar',
                    cssClass: 'error'

                  })
                  toast.present();
                  this.unificaciónLote = true;
                  this.loteAUnificar = this.lote
                } else {
                  this.dismissed = true;
                  this.subscriptionTimer.unsubscribe();
                  this.loading(false);

                  let toast = this.toastCtrl.create({
                    message: data.MESSAGE,
                    duration: 3000,
                    position: 'top',
                    showCloseButton: true,
                    closeButtonText: 'Cerrar',
                    cssClass: 'error'

                  })
                  toast.present();
                }
              } else {
                this.dismissed = true;
                this.subscriptionTimer.unsubscribe();
                this.loading(false);

                let toast = this.toastCtrl.create({
                  message: 'Actualización exitosa',
                  duration: 3000,
                  position: 'top',
                  showCloseButton: true,
                  closeButtonText: 'Cerrar',
                  cssClass: 'success'

                })
                toast.present();
                this.navCtrl.popToRoot();
              }

            }
          })
        })
    }
  }


  //---------------------------------------------------------------------------------------------------------



  loading(present: boolean) {
    console.log('El valor booleano de present: ');
    console.log(present);
    if (this.dismissed == false) {
      console.log('Se vuelve a mandar pero se evita')
    } else {
      if (present) {

        this.showSplash = true;
        this.dismissed = false;
        this.timer = timer(30000);

        this.subscriptionTimer = this.timer.subscribe(() => {
          if (this.dismissed == false) {
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
      } else {
        this.showSplash = false;
      }
    }

  }


  //---------------------------------------------------------------------------------------------------------



  ionViewWillEnter() {

    if (this.modalSearchIdentifier == true) {
      let tipo = this.navParams.get('tipoSearch');
      if (tipo == 'estilo') {
        this.estiloDisplay = this.navParams.get('eleccion');
      } else if (tipo == 'cliente') {
        this.clienteDisplay = this.navParams.get('eleccion');
      }
      this.modalSearchIdentifier = false;
    }


  }


  //---------------------------------------------------------------------------------------------------------


  ionViewDidLoad() {

    if(this.plt.is("ios")){
      setTimeout(() => {
        this.textInput.input.subscribe((data) => {

          // Armado del input alpha

          if (data["inputType"] == "insertText") {
            this.inputAlpha = this.inputAlpha + data["data"];
          } else if (data["inputType"] == "deleteContentBackward") {
            let length = this.inputAlpha.length;
            this.inputAlpha = this.inputAlpha.substring(0, length - 1);
          }

          if (isNaN(this.inputAlpha)) {
            // No tiene texto
          } else {
            this.tipoInput = "text";
          }
          console.log(this.inputAlpha);
        })

      }, 100)
    }


    this.comando = this.navParams.get('comando');
    let extra = this.navParams.get('extra')
    this.token = this.localStorage.token;


    if (this.comando == 'Entregar') {
      this.loading(true);
      this.movimientoBarrilProv.cargarClientes(this.token).then((clientes: any) => {
        this.dismissed = true;
        this.subscriptionTimer.unsubscribe();
        this.loading(false);
        this.httpValidate.validarHttp(clientes).then((array) => {
          console.log('el array ' + array)
          if (array['status'] == 'errorToken') {
            array['popup'].present();
            this.app.getRootNav().setRoot('LoginPage');
          } else if (array['status'] == 'errorConnection') {
            array['popup'].present();
          } else {
            this.clientesArray = clientes;
          }
        })
      })
    }
    if (this.comando == 'Entregar' && extra == 'preparacionPedido') {

      this.preparacionPedido = true;
      this.clienteDisplay = this.navParams.get('clientePreparacion');
      this.ordenID = this.navParams.get('ordenID')
      let pedidoGet = this.navParams.get('itemsPedido')
      for (let i = 0; i <= pedidoGet.length - 1; i++) {
        let objeto: any = {
          selector: pedidoGet[i].selector,
          estilo: pedidoGet[i].estilo,
          capacidad: pedidoGet[i].capacidad,
          cantidad: pedidoGet[i].cantidad,
          coincide: 'danger'
        }
        this.pedidoDisplay.push(objeto);
      }
      console.log(this.pedidoDisplay)
    }

    if (this.comando == 'Embarrilar' || extra == 'preparacionPedido') {
      this.loading(true);
      this.movimientoBarrilProv.cargarEstilos(this.token).then((estilos: any) => {
        this.dismissed = true;
        this.subscriptionTimer.unsubscribe();
        this.loading(false);
        this.httpValidate.validarHttp(estilos).then((array) => {
          console.log('el array ' + array)
          if (array['status'] == 'errorToken') {
            array['popup'].present();
            this.app.getRootNav().setRoot('LoginPage');
          } else if (array['status'] == 'errorConnection') {
            array['popup'].present();
          } else {
            this.estilosArray = estilos;
          }
        })

      })
    }

  }

  //---------------------------------------------------------------------------------------------------------


  checkearCoincidencia() {

    let indexConfirmados = []
    if (this.listadoDisplay.length == 0) {
      for (let n = 0; n <= this.pedidoDisplay.length - 1; n++) {
        this.pedidoDisplay[n].coincide = 'danger';
      }
    }
    for (let i = 0; i <= this.listadoDisplay.length - 1; i++) {
      for (let n = 0; n <= this.pedidoDisplay.length - 1; n++) {
        if (this.listadoDisplay[i].selector == this.pedidoDisplay[n].selector && this.listadoDisplay[i].productos.length == parseInt(this.pedidoDisplay[n].cantidad)) {
          this.pedidoDisplay[n].coincide = 'verde';
          indexConfirmados.push(n)
        } else {
          let yaSeHaConfirmadoEsteIndex = false;
          for (let h = 0; h <= indexConfirmados.length - 1; h++) {
            if (n == indexConfirmados[h]) {
              yaSeHaConfirmadoEsteIndex = true;
            }
          }
          if (yaSeHaConfirmadoEsteIndex == false) {
            this.pedidoDisplay[n].coincide = 'danger';
          }
        }

      }
    }
  }

  //----------------------------------------------------------------------------------------------------------------------

  validarBarril(tipo, scan?) {

    //Si no estoy embarrilando te mando un 0 en estilo y en cliente
    //El lote va vacío o con el lote
    if (this.plt.is("android")){
      var input = this.idDisplay;
    } else {
      this.inputAlpha = this.inputAlpha.toString();
      var input = this.inputAlpha;
    }

    if (input == '') {
      let toast = this.toastCtrl.create({
        message: 'Ingrese un id',
        duration: 1500,
        position: 'top',
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        cssClass: 'error'

      });
      toast.present();
    } else {
      return new Promise((resolve, reject) => {
        this.loading(true);

        //Si estoy en entrega o embarrilado, busca el ID del estilo o el cliente
        let noHayCliente = false;
        if (tipo == 'EMBARRILADO') {
          let indexEstilo = this.estilosArray.findIndex((element) => { return element.NAME == this.estiloDisplay });
          if (this.estilosArray[indexEstilo] == undefined) {
            this.estilo = '0'
          } else {
            this.estilo = this.estilosArray[indexEstilo].ID_STYLE_STR;
          }
        } else if (tipo == 'ENTREGA') {
          let indexCliente = this.clientesArray.findIndex((element) => { return element.NAME == this.clienteDisplay });
          if (this.clientesArray[indexCliente] == undefined) {
            noHayCliente = true;
          } else {
            this.cliente = this.clientesArray[indexCliente].ID_CLIENT_STR;
          }
        }


        let pedidoListo = false;
        if (this.preparacionPedido) {
          this.cliente = '';
          for (let f = 0; f <= this.pedidoDisplay.length - 1; f++) {
            console.log(this.pedidoDisplay[f].coincide)
            if (this.pedidoDisplay[f].coincide == 'verde') {
              pedidoListo = true;
            } else {
              pedidoListo = false;
              f = this.pedidoDisplay.length - 1;
            }
          }
        }

        console.log('Estilo: ' + this.estilo + ' El tipo: ' + tipo + ' El cliente: ' + this.cliente + ' Id: ' + input + ' y orden ID: ' + this.ordenID + ' El listado confirmar: ' + this.listadoConfirmar)

        if (pedidoListo == true || noHayCliente == true) {
          if (pedidoListo == true) {
            resolve({
              message: 'El pedido ya está listo',
              status: 'stop'
})
            if (scan != true) {
              let toast = this.toastCtrl.create({
                message: 'El pedido ya está listo',
                duration: 3000,
                position: 'top',
                showCloseButton: true,
                closeButtonText: 'Cerrar',
                cssClass: 'error'

              })
              toast.present();
            }
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);

          } else if (noHayCliente == true) {
            resolve({
              message: 'Seleccione un cliente',
                            status: 'stop'
              })
            this.dismissed = true;
            this.subscriptionTimer.unsubscribe();
            this.loading(false);
            if (scan != true) {
              let toast = this.toastCtrl.create({
                message: 'Seleccione un cliente',
                duration: 3000,
                position: 'top',
                showCloseButton: true,
                closeButtonText: 'Cerrar',
                cssClass: 'error'

              })
              toast.present();
            }
          }
        } else {
          this.movimientoBarrilProv.validacionBarril(this.token, tipo, this.estilo, this.lote, input, this.ordenID, this.listadoConfirmar).then((data: any) => {
            this.inputAlpha = '';
            this.idDisplay = "";
            if(this.plt.is("ios")){
              this.tipoInput = "number";
            }
            this.httpValidate.validarHttp(data).then((array) => {
              if (array['status'] == 'errorToken') {
                this.dismissed = true;
                this.subscriptionTimer.unsubscribe();
                this.loading(false);
                array['popup'].present();
                this.app.getRootNav().setRoot('LoginPage');
              } else if (array['status'] == 'errorConnection') {
                this.dismissed = true;
                this.subscriptionTimer.unsubscribe();
                this.loading(false);
                array['popup'].present();
              } else {
                if (data.CODE == "ajaxcodeVALIDATE_FAILED") {
                  resolve({
                    message: data.MESSAGE,
                    status: 'go'
                  })
                  this.dismissed = true;
                  this.subscriptionTimer.unsubscribe();
                  this.loading(false);
                  if (scan != true) {
                    let toast = this.toastCtrl.create({
                      message: data.MESSAGE,
                      duration: 3000,
                      position: 'top',
                      showCloseButton: true,
                      closeButtonText: 'Cerrar',
                      cssClass: 'error'

                    })
                    toast.present();
                  }
                } else {
                  let existeCategoria: boolean = false;

                  if (this.listadoDisplay.length == 0) {
                    this.hayProductos = true;
                    this.listadoConfirmar.push(data.CUSTOM_VALUE_IV)

                    let arrayProductos: ArrayProductos = [];
                    let objeto: objSelector = {
                      selector: data.CUSTOM_VALUE_I,
                      estilo: data.CUSTOM_VALUE_II,
                      capacidad: data.CUSTOM_VALUE_III,
                      productos: arrayProductos,
                      mostrarItems: false,
                      signo: 'add-circle'
                    };
                    this.listadoDisplay.unshift(objeto);
                    this.listadoDisplay[0]['productos'].push({
                      id: data.CUSTOM_VALUE,
                      idUnicoConfirmacion: data.CUSTOM_VALUE_IV,
                    });
                    existeCategoria = true;
                    this.contadorProductos += 1;
                    this.dismissed = true;
                    this.subscriptionTimer.unsubscribe();
                    this.loading(false);
                    console.log('El listado del display es: ')
                    console.log(this.listadoDisplay)
                    console.log('El listado de confirmacion es: ')
                    console.log(this.listadoConfirmar)
                    if (this.preparacionPedido) {
                      this.checkearCoincidencia();
                    };
                    resolve({
                      message: 'Se agregó el barril con éxito',
                      status: 'go'
})
                  } else {

                    //ITERADOR CATEGORIA

                    for (let i = 0; i <= this.listadoDisplay.length - 1; i++) {

                      //Acá barre todos los selectores del listado Display

                      if (this.listadoDisplay[i].selector == data.CUSTOM_VALUE_I) {
                        console.log('Se mete acá cuando el selector de la data enviada y en la lista coincide')
                        existeCategoria = true;
                        let existeProducto = false;
                        for (let n = 0; n <= this.listadoDisplay[i].productos.length - 1; n++) {
                          if (this.listadoDisplay[i].productos[n].id == data.CUSTOM_VALUE) {
                            existeProducto = true;
                          }
                        }
                        if (existeProducto == false) {
                          this.listadoConfirmar.push(data.CUSTOM_VALUE_IV)
                          this.listadoDisplay[0]['productos'].push({
                            id: data.CUSTOM_VALUE,
                            idUnicoConfirmacion: data.CUSTOM_VALUE_IV,
                          })
                          existeCategoria = true;
                          this.dismissed = true;
                          this.subscriptionTimer.unsubscribe();
                          this.loading(false);
                          console.log('El listado del display es: ')
                          console.log(this.listadoDisplay)
                          console.log('El listado de confirmacion es: ')
                          console.log(this.listadoConfirmar)
                          if (this.preparacionPedido) {
                            this.checkearCoincidencia();
                          }
                          this.contadorProductos += 1;
                          resolve({
message: 'Se agregó el barril con éxito',
                            status: 'go'
})
                        }
                        if (existeProducto == true) {

                          console.log('El listado del display es: ')
                          console.log(this.listadoDisplay)
                          console.log('El listado de confirmacion es: ')
                          console.log(this.listadoConfirmar)
                          if (this.preparacionPedido) {
                            this.checkearCoincidencia();
                          }
                          if (scan != true) {
                            let toast = this.toastCtrl.create({
                              message: 'El barril ya se encuentra agregado',
                              duration: 3000,
                              position: 'top',
                              showCloseButton: true,
                              closeButtonText: 'Cerrar',
                              cssClass: 'error'

                            })
                            toast.present();
                          }
                          resolve({
message: 'El barril ya se encuentra agregado',
                            status: 'go'
                          })
                          this.dismissed = true;
                          this.subscriptionTimer.unsubscribe();
                          this.loading(false);

                        }
                      }
                    }

                    if (existeCategoria == false) {
                      this.listadoConfirmar.push(data.CUSTOM_VALUE_IV)
                      let arrayProductos: ArrayProductos = [];
                      let objeto: objSelector = {
                        selector: data.CUSTOM_VALUE_I,
                        estilo: data.CUSTOM_VALUE_II,
                        capacidad: data.CUSTOM_VALUE_III,
                        productos: arrayProductos,
                        mostrarItems: false,
                        signo: 'add-circle'
                      }
                      this.listadoDisplay.unshift(objeto);
                      this.listadoDisplay[0]['productos'].push({
                        id: data.CUSTOM_VALUE,
                        idUnicoConfirmacion: data.CUSTOM_VALUE_IV,
                      })
                      this.dismissed = true;
                      this.subscriptionTimer.unsubscribe();
                      this.loading(false);
                      console.log('El listado del display es: ')
                      console.log(this.listadoDisplay)
                      console.log('El listado de confirmacion es: ')
                      console.log(this.listadoConfirmar)
                      if (this.preparacionPedido) {
                        this.checkearCoincidencia();
                      }
                      this.contadorProductos += 1;
                      resolve({
                        message: 'Se agregó el barril con éxito',
                        status: 'go'
})
                    }
                  }
                }
              }

            })
          })
        }
      })
    }


    //---------------------------------------------------------------------------------------------------------


  }

  dismissModal() {
    if (this.plt.is('ios')) {
      if (this.preparacionPedido) {
        this.navCtrl.popToRoot()
      } else {
        this.navCtrl.pop();
      }
    } else {
      if (this.preparacionPedido) {
        this.navCtrl.setRoot('PedidosPage');
        this.navCtrl.goToRoot
      } else {
        this.navCtrl.setRoot('MoverBarrilPage');
        this.navCtrl.goToRoot
      }
    }

  }


  //---------------------------------------------------------------------------------------------------------



  abrirItems(obj: objSelector) {

    if (obj.mostrarItems == false) {
      obj.mostrarItems = true;
      obj.signo = 'remove-circle';
    } else {
      obj.mostrarItems = false;
      obj.signo = 'add-circle';
    }
  }


  //---------------------------------------------------------------------------------------------------------



  eliminarProductoPuntual(obj: objSelector, producto) {


    let alerta = this.alertCtrl.create({
      title: 'Confirmación',
      subTitle: '¿Está seguro que desea eliminar el barril ' + producto.id + '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {
            let indexListado = this.listadoDisplay.map(function(e) { return e.selector; }).indexOf(obj.selector);
            //Acá me da la posición del selector en el array listado
            let arrayProductos = this.listadoDisplay[indexListado].productos;
            let indexProductoAEliminar = arrayProductos.findIndex((element) => { return element.id == producto.id });
            let idConfir = producto.idUnicoConfirmacion;

            //Elimina el producto en el listadoDisplay
            arrayProductos.splice(indexProductoAEliminar, 1)
            if (arrayProductos.length == 0) {
              this.listadoDisplay.splice(indexListado, 1);
            }

            let indexProductoAEliminarEnConfirmacion = this.listadoConfirmar.findIndex((element) => { return element == idConfir });

            //Eliminar producto de la lista de confirmacion

            this.listadoConfirmar.splice(indexProductoAEliminarEnConfirmacion, 1)

            this.contadorProductos -= 1
            if (this.contadorProductos == 0) {
              this.hayProductos = false;
            }

            console.log('El listado del display es: ')
            console.log(this.listadoDisplay)
            console.log('El listado de confirmacion es: ')
            console.log(this.listadoConfirmar)
            if (this.preparacionPedido) {
              this.checkearCoincidencia();
            }
          }
        }]
    })
    alerta.present()

  }


  //---------------------------------------------------------------------------------------------------------



  eliminarProductoFn() {

    let alert = this.alertCtrl.create({
      title: 'Eliminar producto',
      subTitle: 'Ingrese o scanee el producto que quiere eliminar',

      inputs: [{
        placeholder: 'ID',
      }],

      buttons: [{
        text: 'Eliminar',
        handler: data => {
          this.busquedaDeProductoAEliminar(data[0]);

        }// Acá cierra la busqueda del id en los productos ya ingresados
      },
      {
        text: 'Scan',
        handler: () => {
          this.scanLupita().then((scan: any) => {
            let id = scan.substring(4);
            this.busquedaDeProductoAEliminar(id);
          });
        }

      }]
    })
    alert.present();
  }


  //---------------------------------------------------------------------------------------------------------



  busquedaDeProductoAEliminar(inputOscan) {
    let arrayPosibilidadesDeIdentifier = this.procesadorDeInputProv.deInputA4o5Digitos(inputOscan);
    console.log('Respuesta del procesador de input: ');

    if(this.plt.is("cordova")){
      console.log(JSON.stringify(arrayPosibilidadesDeIdentifier));
    }else{
      console.log(arrayPosibilidadesDeIdentifier);
    }

    let existenciaUnica = true;
    let nroMatch = 0;
    let existeMatch = false;
    for (let j = 0; j <= arrayPosibilidadesDeIdentifier.length - 1; j++) {
      let id = arrayPosibilidadesDeIdentifier[j];
      let posicionJ: number;
      let posicionI: number;
      let posicionN: number;
      for (let i = 0; i <= this.listadoDisplay.length - 1; i++) {
        for (let n = 0; n <= this.listadoDisplay[i].productos.length - 1; n++) {
          if (this.listadoDisplay[i].productos[n].id.toLowerCase().search(id) != -1) {
            console.log(this.listadoDisplay[i].productos[n])
            existeMatch = true;
            nroMatch += 1;
            posicionJ = j;
            posicionI = i;
            posicionN = n;
            if (nroMatch > 1) {
              console.log('asd')
              existenciaUnica = false;
              //Si hay dos con el mismo, quiere decir que hay uno de otro codigo que es el correcto
            }
          }
        }
      }
      if (existeMatch) {
        if (existenciaUnica) {
          this.eliminarDespuesDeBusqueda(arrayPosibilidadesDeIdentifier[posicionJ], posicionI, posicionN);
          j = arrayPosibilidadesDeIdentifier.length - 1;
        } else {
        }
      }
    }
    if (existeMatch == false) {
      let toast = this.toastCtrl.create({
        message: 'No se encontró ningun barril con esa identificación',
        duration: 3000,
        position: 'top',
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        cssClass: 'error'

      })
      toast.present();
    }
  }


  //---------------------------------------------------------------------------------------------------------



  // Le mando el id para preguntarle si quiere elminar ese id y después la posicion de ese id
  // en los listados.
  eliminarDespuesDeBusqueda(id, i, n) {
    let alert = this.alertCtrl.create({
      title: 'Confirmación',
      subTitle: '¿Está seguro que desea eliminar el barril ' + id.toUpperCase() + '?',
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Aceptar',
        handler: () => {
          console.log(this.listadoDisplay[i].productos[n]);
          let idConfir = this.listadoDisplay[i].productos[n].idUnicoConfirmacion;
          for (let l = 0; l <= this.listadoConfirmar.length - 1; l++) {
            if (this.listadoConfirmar[l] == idConfir) {
              this.listadoConfirmar.splice(l, 1);
            }
          }
          this.listadoDisplay[i].productos.splice(n, 1);

          if (this.listadoDisplay[i].productos.length == 0) {
            this.listadoDisplay.splice(i, 1);
          }
          this.contadorProductos -= 1;
          if (this.contadorProductos == 0) {
            this.hayProductos = false;
          }
          console.log('El listado del display es: ')
          console.log(this.listadoDisplay)
          console.log('El listado de confirmacion es: ')
          console.log(this.listadoConfirmar)
          if (this.preparacionPedido) {
            this.checkearCoincidencia();
          }
        }
      }]
    })
    alert.present();
  }


  //---------------------------------------------------------------------------------------------------------



  scanLupita(origen?) {
    this.loadingScan(true);
    return new Promise((resolve, reject) => {
      if (this.plt.is('android')) {
        this.event.publish('scanPause');
      }
      this.barcodeScanner.scan().then((barcodeData: any) => {
        if(barcodeData.cancelled == 0){
          this.loadingScan(false);
          console.log('Barcode data', barcodeData);
          resolve(barcodeData.text);
        }else{
          this.loadingScan(false);
        }
      }).catch(err => {
        console.log('Error', err);
        this.loadingScan(false);
        let toast = this.toastCtrl.create({
          message: 'Ocurrió un error con el scanner: <br>' + err,
          duration: 4000,
          position: 'top',
          showCloseButton: true,
          closeButtonText: 'Cerrar',
          cssClass: 'error'
        })
        toast.present();
      });
    })
  }


  //---------------------------------------------------------------------------------------------------------



  loadingScan(present: boolean) {
    console.log('Loading scan: ');
    console.log(present);
    if (present) {
      this.showSplashScan = true;
    } else {
      this.showSplashScan = false;
    }
  }


  //---------------------------------------------------------------------------------------------------------



  scanModal(origen) {
    this.tabBarElement.style.display = 'none';
    if (this.plt.is('android')) {
      this.event.publish('scanPause');
    }

    this.loadingScan(true);
    this.barcodeScanner.scan().then((barcodeData: any) => {
      let cancelado = barcodeData.cancelled;
      console.log('Barcode data', barcodeData);

      if(this.plt.is("ios")){
        this.inputAlpha = barcodeData.text;
      }else{
        this.idDisplay = barcodeData.text;
      }
      console.log('El valor de cancelado: ' + cancelado + ' si es 0 entonces NO se canceló')
      if (cancelado == 0) {
        this.validarBarril(origen, true).then((array: any) => {
          this.loadingScan(false);
          let message = array['message'];
          let status = array['status'];
          console.log('Mensaje en el scan ' + message)
          this.mensajeScan = message;
          this.mensajeOk = false;
          this.mensajeERROR = false;
          if (message == 'Se agregó el barril con éxito') {
            this.mensajeOk = true;
            this.mensajeScanIcono = 'ios-thumbs-up';
            this.audioOK.play();
          } else {
            this.mensajeScanIcono = 'ios-thumbs-down';
            this.mensajeERROR = true;
            this.audioERROR.play();
          }
          this.showMessageScan = true;

          timer(1000).subscribe(() => {
            this.showMessageScan = false;


            console.log('El status es: ' + cancelado)
            if (message == 'Seleccione un estilo' || message == 'Seleccione un cliente') {
              status = 'stop';
            }
            if (origen == 'EMBARRILADO' && this.lote == '') {
              status = 'stop';
            }

            if (status == 'go' && cancelado == '0') {
              this.scanModal(origen);
            } else {
              this.tabBarElement.style.display = 'flex';
              this.loadingScan(false);
            }
          })

        })
      } else {
        this.tabBarElement.style.display = 'flex';
        this.loadingScan(false);
      }
    }).catch(err => {
      console.log('Error', err);
      this.tabBarElement.style.display = 'flex';
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

}
