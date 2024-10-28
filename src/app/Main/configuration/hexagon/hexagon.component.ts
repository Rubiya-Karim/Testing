import { Component, Input, Output,EventEmitter} from '@angular/core';

@Component({
  selector: 'app-hexagon',
  templateUrl: './hexagon.component.html',
  styleUrls: ['./hexagon.component.scss']
})
export class HexagonComponent {
  @Input() type: string = 'CNE'
  @Input() data:any;
  @Output() hexagonClicked: EventEmitter<void> = new EventEmitter<void>();
  textList:Array<string> = [];
  badgeColor: string = '#D9F99F';
  hexagonColor: string = '#3498db';
  badgeText: string = '';
  text: string = '';

  ngOnInit() {
    this.text = this.data?.text;
    this.textList = this.splitString(this.text, this.type === "CNE" ? 10 : 15);
    const theInfo = this.data?.deploymentInfo;
    const status = theInfo?.hasOwnProperty("status") ? theInfo.status : theInfo?.hasOwnProperty("processStatus") ? theInfo.processStatus : "";
    this.hexagonColor = status === 'Running' ? 'var(--status-lime-400, #82CB15)' : (status === 'Not Running' ? 'var(--status-danger-400, #EF4343)' : 'var(--status-Amber-600, #F59E0B)');
    this.badgeColor = status === 'Running' ? 'var(--Status-Lime-50, #D9F99F)' : (status === 'Not Running' ?'var(--Status-Danger-50, #FEC8C8)' : 'var(--Status-Amber-50, #FDE68A)');
    this.badgeText= this.data?.badgeText ? this.data.badgeText : '0';
  }


  onHexagonClick(): void {
    // Emit the click event
    this.hexagonClicked.emit();
  }

  splitString(inputString:string, chunkSize:number):Array<string> {
    const result = [];
    
    for (let i = 0; i < inputString.length; i += chunkSize) {
      result.push(inputString.slice(i, i + chunkSize));
    }
    return result;
  }
  
}
