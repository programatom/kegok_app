import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, NavController } from 'ionic-angular';
import { MyApp } from './app.component';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from "../components/components.modules"; // import the module

//PLUGINS
import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Keyboard } from '@ionic-native/keyboard';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppVersion } from '@ionic-native/app-version';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Market } from '@ionic-native/market';
import { Device } from '@ionic-native/device';
import { NativeKeyboard } from '@ionic-native/native-keyboard';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//PROVIDERS
import { LoginProvider } from '../providers/login/login';
import { LocalStorageProvider } from '../providers/local-storage/local-storage';
import { HomeInfoProvider } from '../providers/home-info/home-info';
import { ListadoBarrilesProvider } from '../providers/listado-barriles/listado-barriles';
import { MovimientoBarrilProvider } from '../providers/movimiento-barril/movimiento-barril';
import { ListadoPedidosProvider } from '../providers/listado-pedidos/listado-pedidos';
import { HttpValidateProvider } from '../providers/http-validate/http-validate';
import { VersionProvider } from '../providers/version/version';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { ProcesadorDeInputProvider } from '../providers/procesador-de-input/procesador-de-input';
import { GraficosProvider } from '../providers/graficos/graficos';
import { ToastProvider } from '../providers/toast/toast';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp,{
      backButtonText: '',
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
      monthShortNames: ['Ene', 'Feb', 'Mar', 'Abr','May','Jun','Jul','Ago','Sept','Oct','Nov','Dic'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles','Jueves','Viernes','Sabado' ],
      dayShortNames: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sab' ],
      scrollAssist: true,
      autoFocusAssist: false,
      scrollPadding: false,
    }),
    IonicStorageModule.forRoot()
    ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ProgressBarComponent,
    LoginProvider,
    HttpClient,
    LocalStorageProvider,
    HomeInfoProvider,
    ListadoBarrilesProvider,
    BarcodeScanner,
    MovimientoBarrilProvider,
    ListadoPedidosProvider,
    Keyboard,
    InAppBrowser,
    HttpValidateProvider,
    AppVersion,
    VersionProvider,
    Diagnostic,
    Market,
    ProcesadorDeInputProvider,
    Device,
    GraficosProvider,
    ToastProvider,
    NativeKeyboard
  ]
})
export class AppModule {}
