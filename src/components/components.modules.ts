import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { IonicModule } from 'ionic-angular';
import { FormsModule } from '@angular/forms';

//Components

import { ProgressBarComponent } from "./progress-bar/progress-bar";
import { StockPieComponent } from './stock-pie/stock-pie';
import { LineChartEntregaYProduccionComponent } from './line-chart-entrega-y-produccion/line-chart-entrega-y-produccion';
import { TotalizadorComponent } from './totalizador/totalizador';
import { BarrilesAfueraComponent } from './barriles-afuera/barriles-afuera';
import { EntregadosComponent } from './entregados/entregados';


@NgModule({
  declarations: [
    ProgressBarComponent,
    StockPieComponent,
    LineChartEntregaYProduccionComponent,
    TotalizadorComponent,
    BarrilesAfueraComponent,
    EntregadosComponent
  ],
  imports: [
    IonicModule
  ],
  exports: [
    ProgressBarComponent,
    StockPieComponent,
    LineChartEntregaYProduccionComponent,
    TotalizadorComponent,
    BarrilesAfueraComponent,
    EntregadosComponent
  ]
})
export class ComponentsModule {}
