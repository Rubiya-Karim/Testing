import { Component, HostBinding } from '@angular/core';
import { Observable,Subscription  } from 'rxjs';
import { MessageService, MessageType } from 'src/app/services/message.service';

@Component({
  selector: 'app-global-messages',
  templateUrl: './global-messages.component.html',
  styleUrls: ['./global-messages.component.scss']
})
export class GlobalMessagesComponent {
  message$: Observable<{ type: MessageType; message: string; hideMsgFast?:boolean} | null> = this.messageService.getMessage();
  private messageSubscription: Subscription | null = null;
  constructor(private messageService: MessageService) {}

ngOnInit(): void {
    this.messageSubscription = this.message$.subscribe((message:any) => {
      setTimeout(() => {
        this.clearMessage();
      }, message?.hideMsgFast ? 1500 : 20000);
    });
  }
   getMessageClass(message: { type: MessageType; message: string } | null): string {
    if (message && message.type === MessageType.Success) {
      return 'success-message';
    } else if (message && message.type === MessageType.Error) {
      return 'error-message';
    } else {
      return '';
    }
  }
  


  clearMessage(): void {
    this.messageService.clearMessage();
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
  }
}
