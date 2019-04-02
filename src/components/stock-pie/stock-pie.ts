import { Component, Input, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { HomePage } from '../../pages/home/home';
import { NavController, ModalController } from "ionic-angular";
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'stock-pie',
  templateUrl: 'stock-pie.html'
})
export class StockPieComponent {

  doughnutChart: any;

  buscador: any;
  buscar:string;


  @ViewChild('doughnutCanvas') doughnutCanvas;

  @Input('pieDataLabels') pieDataLabels;
  @Input('pieDataCantidades') pieDataCantidades;
  @Input('coloresPie') coloresPie;

  constructor(private home: HomePage,
    private navCtrl: NavController,
    private modalCtrl: ModalController) {
  }

  ngAfterViewInit() {

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.pieDataLabels,
        datasets: [{
          data: this.pieDataCantidades,
          backgroundColor: this.coloresPie,
        }]
      },
      options: {
        legend: {
          labels: {
            // This more specific font property overrides the global property
            fontColor: 'white'
          }
        },
        events: ['click'],
        tooltips: {

          callbacks: {
            label: (tooltipItem, data) => {
              this.buscador = true;
              this.buscar = this.pieDataLabels[tooltipItem.index];
              return this.pieDataCantidades[tooltipItem.index] + ' litros de ' + this.pieDataLabels[tooltipItem.index];
            }
          }
        },
      }
    });
    this.home.componentInit('stock-pie');
  }
  irAlSearch(){
    let buscarSplit = this.buscar.split(" ");


    this.modalCtrl.create("ListadoPage",{"buscar": buscarSplit[0] + " " + "stock","modal":true}).present();
  }


}
