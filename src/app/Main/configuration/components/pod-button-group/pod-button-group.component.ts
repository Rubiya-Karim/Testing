import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pod-button-group',
  templateUrl: './pod-button-group.component.html',
  styleUrls: ['./pod-button-group.component.scss']
})

export class PodButtonGroupComponent {

  @Input() podStatus!:string;
  @Output() onStartActionEmit = new EventEmitter();
  @Output() onStopActionEmit = new EventEmitter();
  @Output() onRestartActionEmit = new EventEmitter();
  @Input() isSiteView:boolean = false;
  @Output() onStartBrmEceActionEmit = new EventEmitter();
  @Output() onStopBrmEceActionEmit = new EventEmitter();
  @Output() onRestartBrmEceActionEmit = new EventEmitter();
  @Output() onStartAllActionEmit = new EventEmitter();
	@Output() onStopAllActionEmit = new EventEmitter();
  @Input() EceData:boolean = false;
  @Input() onPrem:boolean = false;

  constructor() { }

  ngOnInit() {
  }

  getStartFillColor() {
    return this.isPodRunning() || this.disablePod() ? 'white': '#0F172A';
  }

  getFillColor() {
    return this.isPodRunning() || this.disablePod()? '#0F172A' : 'white';
  }

  isPodRunning():boolean {
    return (this.podStatus === "Running");
  }

  disablePod():boolean {
    return (this.podStatus === "Restart in Progress" || this.podStatus === "Pending");
  }

  buttonStateCSS():string {
    return (this.isPodRunning() ? "active" : "pod-button-disabled-color");
  }

  startButtonStateCSS():string {
    return (this.isPodRunning() ? "pod-button-disabled-color": "active");
  }


  onStartAction(event: any) {
    if(!this.onPrem){
      this.onStartActionEmit.emit(event);
    }
    else{
      this.onStartBrmEceActionEmit.emit(event);
    } 
  }

  onStopAction(event: any) {
    if(!this.onPrem){
    this.onStopActionEmit.emit(event);
    }
    else{
      this.onStopBrmEceActionEmit.emit(event);
    }
  }

  onRestartAction(event: any) {
    if(!this.onPrem){
    this.onRestartActionEmit.emit(event);
    }
    else{
      this.onRestartBrmEceActionEmit.emit(event);
    }
  }
}
