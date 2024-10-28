import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { JobService } from 'src/app/services/job.service';

@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss']
})
export class ProgressbarComponent {
  @Input() progress: number = 0;
  @Input() parentId:any;
  @Input() data:any;
  @Input() dataIndexInParent:any;
  @Input() loading:boolean = true;
  @Input() progressStats!: any;
  @Input() showStatistics:boolean = true;
  @Output() progressCompleteEmit = new EventEmitter();
  fetchInterval: any;
  private subscription!: Subscription;

  constructor(private apiService: JobService) {}

  ngOnInit() {
    const updateInterval = 5000; // Set your update interval in milliseconds
    this.subscription = interval(updateInterval)
    .pipe(switchMap(() => {return this.apiService.getProgressUpdate(this.parentId);}),
          takeWhile(() => (this.loading), true) // true flag completes the observable when the condition is false
    )
    .subscribe((value:any) => {
      if (value?.length) {
        // Updating the prog stats
        const theJobStat = value[this.dataIndexInParent];
        this.progressStats = theJobStat?.progressStats;
        var timeDelay = 2;
        if (theJobStat.executionStatus == "2" && theJobStat?.progressStats.totalRecords == theJobStat?.progressStats.processedRecords) {
          this.progress = 100;
        } else {
          if (theJobStat.executionStatus != "2") {
            this.progress = 100;
          } else {
            this.progress = this.updateProgress(theJobStat?.progressStats);
            if (this.progress == 100) {
              timeDelay = 15;
            }
          }  
          if (this.progress == 100) {
            this.loading = false;
            if (this.subscription) {
              this.subscription.unsubscribe();
            }
            setTimeout(() => {
              this.progressCompleteEmit.emit({"id":this.parentId, "indexInParent":this.dataIndexInParent});
            }, timeDelay * 1000);
          }

        }
      }
    },
    (error:any) => {
      console.error('Error fetching data:', error);
      this.loading = false;
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  updateProgress(progressStats: any): number {
    if (progressStats.totalRecords == progressStats.processedRecords) {
      return 100;
    } else {
      const totalTime = progressStats.remainingTime + progressStats.processedTime;
      if (totalTime === 0) {
        return 0; // Avoid division by zero
      }
      const percentage = (progressStats.processedTime / totalTime) * 100;
      const wholeNumber: number = Math.trunc(percentage);
  
      return Math.min(100, wholeNumber); // Ensure the percentage does not exceed 100%
    }
  }

}
