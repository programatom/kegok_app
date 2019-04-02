import { Component, Input, ViewChild } from '@angular/core';
import { timer } from 'rxjs/observable/timer';

@Component({
  selector: 'progress-bar',
  templateUrl: 'progress-bar.html'
})
export class ProgressBarComponent {

//Como se va llamar la variable en donde inyecte el componente y como se va a llamar dentro del mismo
@Input('progress') progress;
@Input('color') color;
@Input('animationName') animationName;
@Input('animationDuration') animationDuration;
@Input('progressDisplay') progressDisplay;


@ViewChild('progressInner') progressInner;

  text: string;

  constructor() {
  }

fadeInInner(){
  this.progressInner.nativeElement.classList.add('fadeIn')
  timer(2000).subscribe(()=>{
    this.progressInner.nativeElement.classList.remove('fadeIn')
  })
}
}
