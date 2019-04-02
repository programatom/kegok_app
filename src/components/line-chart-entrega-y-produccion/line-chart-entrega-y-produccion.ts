import { Component, Input, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { HomePage } from '../../pages/home/home';

@Component({
  selector: 'line-chart-entrega-y-produccion',
  templateUrl: 'line-chart-entrega-y-produccion.html'
})
export class LineChartEntregaYProduccionComponent {
  lineChart: any;

  @ViewChild('lineCanvas') lineCanvas;

  @Input('datosLineChart') datosLineChart;

  constructor(private home: HomePage) {
  }

  ngAfterViewInit() {

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      options: {
        legend: {
          labels: {
            fontColor: 'white'
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              fontColor: 'white'
            },
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white'
            },
          }]
        },
      },
      data: {
        labels: this.datosLineChart[0].months,
        datasets: [
          {
            label: "Producción",
            fill: false,
            backgroundColor: "rgba(169,216,184,0.9)",
            borderColor: "rgb(169,216,184)",
            borderWidth: 1,
            responsiveAnimationDuration: 1000,
            responsive: true,
            pointRadius: 10,
            legend: {
              position: 'top',
            },
            title: {
              display: false,
              text: ''
            },
            animation: {
              animateScale: true,
              animateRotate: true,
              duration: 1000
            },
            data: this.datosLineChart[0].capacity,

          },
          {
            label: "Entrega",
            fill: false,
            backgroundColor: "rgba(245,154,191,0.9)",
            borderColor: "rgb(245,154,191)",
            borderWidth: 1,
            pointRadius: 10,
            responsiveAnimationDuration: 1000,
            responsive: true,
            legend: {
              position: 'top',
            },
            title: {
              display: false,
              text: ''
            },
            animation: {
              animateScale: true,
              animateRotate: true,
              duration: 1000
            },
            data: this.datosLineChart[1].capacity,

          }
        ]
      }

    });
    this.home.componentInit(null)
  }
}
