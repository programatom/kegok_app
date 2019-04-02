import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ProcesadorDeInputProvider {

  nroIteraciones:any;

  constructor(public http: HttpClient) {
  }

  deInputAxDigitosConString(input){

    // Voy a terminar teniendo dos variables, el numero de 4 y 5 dígitos,
    // después ambos tengo que compararlos con lo que yo quiero encontrar y el que me de un resultado
    // único le meto pista. ¿Siempre va a tener un doble resultado uno? No, porque en el caso de
    // que el usuario ingrese un 1 por ejemplo, va a buscar el campo 0001 y 00001, y probablmente haya
    // al menos uno de ambos tipo de campo. Pero cuando un numero sea mas grande que el otro, entonces
    // no va a haber matches con ese numero. Entonces, yo tengo comparar ambos resultado y en el que me de único
    // le doy.

    //Checkeo si lo que viene ya tiene la longitud mas grande
    this.nroIteraciones = 3;
    let arrayPosicionSplit = [];
    if( input != undefined){
      let inputSplit = input.toString().split('');
      for ( let i = 0; i <= inputSplit.length - 1; i++ ){
        if(isNaN(inputSplit[i])){
          arrayPosicionSplit.push(inputSplit[i]);
        }
      }

      let stringIdentifier = arrayPosicionSplit.toString().replace(/,/g,'');
      let inputMatch = input.match(/\d+$/);
      if(inputMatch == null){
        return 'matchError'
      }else{
        let resultArray = [];
        let inputCrudoSinString = inputMatch[0];
        let inputSplitCte = inputCrudoSinString.split('');
        let i;
        let inputSplit = inputSplitCte.slice()
        for(let i = 0; i <= this.nroIteraciones - 1; i++ ){
          let ceros =  3 + i - inputSplit.length;
          if ( ceros >= 0){
            if( ceros == 0){
              let inputStr = (inputSplit.toString().replace(/,/g,''))
              resultArray.push( (stringIdentifier + inputStr).toLowerCase())
            }
            while (ceros != 0){
              inputSplit.unshift(0);
              ceros-=1
              if (ceros == 0){
                let inputStr = (inputSplit.toString().replace(/,/g,''))
                resultArray.push( (stringIdentifier + inputStr).toLowerCase())
              }
            }
          }
        }

        //Acá ya tengo el input con cuatro digitos de numeros, tengo que barrer el listado display
        //y encontrar el input
        if(resultArray.length >= 1){
        return resultArray;
      }else{
        return 'inputError'
      }
      }

    }
  }

  deInputA4o5Digitos(input){
    let resultArray = [];
    let inputSplit = input.split('');
    let inputLength = inputSplit.length;

    if( inputLength < 5){
      // Puede ser 3 2 1 o 0
      let cerosAAgregar = 4 - inputLength;
      if (cerosAAgregar == 0){
        let inputStr = (inputSplit.toString().replace(/,/g,''));
        resultArray.push( inputStr );
        let inputSplit5 = inputSplit;
        inputSplit5.unshift(0);
        let input5Str = (inputSplit5.toString().replace(/,/g,''));
        resultArray.push( input5Str );
      }
      while (cerosAAgregar != 0){
        inputSplit.unshift(0);
        cerosAAgregar -= 1;
        if (cerosAAgregar == 0){
          let inputStr = (inputSplit.toString().replace(/,/g,''));
          console.log(inputStr)
          resultArray.push( inputStr );
          let inputSplit5 = inputSplit;
          inputSplit5.unshift(0);
          let input5Str = (inputSplit5.toString().replace(/,/g,''));
          resultArray.push( input5Str );
        }
      }

    }else{
      resultArray.push(input);
    }
    console.log('El result array desde el procesador');
    console.log(resultArray);
    return resultArray;
  }

}
