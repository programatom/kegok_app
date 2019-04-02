import { Component, Input, ViewChild } from '@angular/core';
import { HomePage } from '../../pages/home/home';
import { NavController, ModalController } from "ionic-angular";

// rxjs
import { timer } from 'rxjs/observable/timer';

@Component({
  selector: 'totalizador',
  templateUrl: 'totalizador.html'
})
export class TotalizadorComponent {

  @ViewChild('totalBarrilesNumero') totalBarrilesNumero;
  @ViewChild('totalEntregadosNumero') totalEntregadosNumero;
  @ViewChild('totalStockNumero') totalStockNumero;
  @ViewChild('totalFabricaNumero') totalFabricaNumero;

  loadProgressTotal:any = 0;
  loadProgressStock:any = 0;
  loadProgressFabrica:any = 0;
  loadProgressEntregados:any = 0;

  progressDisplayTotal:any;
  progressDisplayStock:any;
  progressDisplayFabrica:any;
  progressDisplayEntregados:any;

  animationTotal:string;
  animationDurTotal:string;

  animationEntregados:string;
  animationDurEntregados:string;

  animationStock:string;
  animationDurStock:string;

  animationFabrica:string;
  animationDurFabrica:string;

  // Variables operativas
  removeFadeOnEnter:boolean = false;

  totalMax:any;
  entregadosMax:any;
  stockMax:any;
  fabricaMax:any;

  totalPorcentaje:any;
  entregadosPorcentaje:any;
  stockPorcentaje:any;
  fabricaPorcentaje:any;

  total:number = 0;
  entregados:number = 0;
  stock:number = 0;
  fabrica:number = 0;

  color1= 'rgb(82, 177, 186)';
  color2= 'rgb(227, 114, 97)';
  color3= 'rgb(104, 155, 204)';
  color4= 'rgb(133, 121, 166)';

  @Input("data")data;



  constructor(private home: HomePage,
              private navCtrl: NavController,
              private modalCtrl: ModalController) {

  }

  ngAfterViewInit(){

    console.log(this.data);
    if (this.data == "error" || this.data == null){

    }else{
      let i = 0;
      for (i == 0; i <= 3; i++){

        //TOTAL
        if(i == 0){
          let totalRaw = this.data[i]

          let array = totalRaw.split('//');
          this.total = array[0];
          this.totalBarrilesNumero.nativeElement.classList.add('fadeIn');
          timer(2000).subscribe(()=>{
            if(this.totalStockNumero != undefined){
              this.totalBarrilesNumero.nativeElement.classList.remove('fadeIn');
            }else{
              this.removeFadeOnEnter = true;
            }
          })

          this.loadProgressTotal = parseFloat(array[1].replace(',','.'));
          this.progressDisplayTotal = array[1];
          this.animationTotal = 'fadeIn'
          this.animationDurTotal = '2s';
          timer(2000).subscribe(()=>{
            this.animationTotal = ''
            this.animationDurTotal = '';
          })
        }


        //ENTREGADOS
        if(i == 1){

          let totalRaw = this.data[i]

          let array = totalRaw.split('//');
          this.entregados = array[0];
          this.totalEntregadosNumero.nativeElement.classList.add('fadeIn');
          timer(2000).subscribe(()=>{
            if(this.totalStockNumero != undefined){
              this.totalEntregadosNumero.nativeElement.classList.remove('fadeIn');
            }else{
              this.removeFadeOnEnter = true;
            }
          })
          this.loadProgressEntregados = parseFloat(array[1].replace(',','.'));
          this.progressDisplayEntregados = array[1];
          this.animationEntregados = 'fadeIn'
          this.animationDurEntregados = '2s';
          timer(2000).subscribe(()=>{
            this.animationEntregados = ''
            this.animationDurEntregados = '';
          })
        }

        //STOCK
        if(i == 2){
          let totalRaw = this.data[i]

          let array = totalRaw.split('//');
          this.stock = array[0];
          this.totalStockNumero.nativeElement.classList.add('fadeIn');
          timer(2000).subscribe(()=>{
            if(this.totalStockNumero != undefined){
              this.totalStockNumero.nativeElement.classList.remove('fadeIn');
            }else{
              this.removeFadeOnEnter = true;
            }
          })
          this.loadProgressStock = parseFloat(array[1].replace(',','.'))
          this.progressDisplayStock = array[1];
          this.animationStock = 'fadeIn';
          this.animationDurStock = '2s';
          timer(2000).subscribe(()=>{
            this.animationStock = ''
            this.animationDurStock = '';
          })

        }

        //FABRICA
        if(i == 3){
          let totalRaw = this.data[i]

          let array = totalRaw.split('//');
          //this.fabrica = array[0];
          this.fabrica = array[0];
          this.totalFabricaNumero.nativeElement.classList.add('fadeIn');
          timer(2000).subscribe(()=>{
            if(this.totalStockNumero != undefined){
              this.totalFabricaNumero.nativeElement.classList.remove('fadeIn');
            }else{
              this.removeFadeOnEnter = true;
            }
          })
          this.loadProgressFabrica = parseFloat(array[1].replace(',','.'));
          this.progressDisplayFabrica = array[1];
          this.animationFabrica = 'fadeIn'
          this.animationDurFabrica = '2s';
          timer(2000).subscribe(()=>{
            this.animationFabrica = ''
            this.animationDurFabrica = '';
          })

          this.home.componentInit('general')

        }
      }

    }
  }

  irAlSearch(buscar){
    this.modalCtrl.create('ListadoPage',{"buscar":buscar,"modal":true}).present();
  }

}
