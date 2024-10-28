import { Component } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
  red = 'red';
  message = '';
  showSpinner$ = this.loadingSpinnerService.showSpinner$;
  message$: Observable<string | null> = this.loadingSpinnerService.getMessage();

  constructor(private loadingSpinnerService: SpinnerService) {}
}
