import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';

@IonicPage()

@Component({
  selector: 'page-mover-barril-modal-search',
  templateUrl: 'mover-barril-modal-search.html',
})
export class MoverBarrilModalSearchPage {

  noHayResultados: boolean = false;
  tipo:string;
  array:any = [];
  arrayResultados:any;
  existeSearch:boolean = false;
  input:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.tipo = this.navParams.get('tipo');
    this.array = this.navParams.get('array');
  }
dismissModal(){
  this.navCtrl.pop();
}

elegir(name){
  this.navCtrl.pop().then(() => {
    this.navParams.get('callback')({tipo: this.tipo, eleccion: name, identifier: true});
  });
}

search($event){
    this.noHayResultados = false;
    console.log(this.input);
    this.existeSearch = true;

    console.log(this.arrayResultados)
    var inputLower = this.input.toLowerCase()
    this.arrayResultados = [];

    if (this.input == ''){
      this.arrayResultados = this.array;
    }else{
      var inputSplit = inputLower.split('');
      for (let n = 0; n <= this.array.length - 1; n ++){
        console.log(this.array[n])
        let arrayLower = this.array[n].NAME.toLowerCase();
        let inputLower = this.input.toLowerCase();

        let match = arrayLower.search(inputLower)
        if (match != -1){
          this.arrayResultados.push(this.array[n])
        }
    }
    if(this.arrayResultados.length == 0){
      this.noHayResultados = true;
    }
    }




  }
}
