import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EceOperationService {
  private handleErrorWithStatus(error: HttpErrorResponse): Observable<any> {
    return of(error)
  }
  constructor(private http: HttpClient) {}

  gedFederationData(data:any): Observable<any> {

    // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return this.http.post<any[]>( environment.url + 'failoverrecovery/getPrimaryCluster', data).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }


  getEceState(data:any):Observable<any>{
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.http.post<any[]>(environment.url+'jmxservice/queryattributeinfo',data).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }

  getCluster(): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.http.get<any[]>(environment.url + 'process-management/clusters?zoneId='+ userTimeZone).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
    }


  clusterDetailsData(): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tableQuery =  "&filterField=clusterType&filterValue=CNE";
    return this.http.get<any[]>(environment.url + 'process-management/clusters?zoneId='+ userTimeZone + tableQuery).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
    }

    getCacheState(): Observable<any> {
      //const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return this.http.get<any[]>(environment.url + 'jmxservice/queryCacheStatus').pipe(
        tap<any>(response => {
          return response
        }),
        catchError(this.handleErrorWithStatus)
      );
      }



  failOverData(data:any): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
     return this.http.post<any[]>( environment.url + 'failoverrecovery/failover?zoneId=' + userTimeZone, data).pipe(
       tap<any>(response => {
         return response
       }),
       catchError(this.handleErrorWithStatus)
     );
   }


   getAllSubscribers(payload:any): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
     return this.http.post<any[]>( environment.url + 'jmxservice/gettraceenabledsubscriberlist?zoneId='+ userTimeZone, payload).pipe(
       tap<any>(response => {
         return response
       }),
       catchError(this.handleErrorWithStatus)
     );
   }

   enableOrDisableTrace(payload:any): Observable<any> {
     return this.http.post<any[]>( environment.url + 'jmxservice/enabledisabletrace', payload).pipe(
       tap<any>(response => {
         return response
       }),
       catchError(this.handleErrorWithStatus)
     );
   }

   getAllSubscriberLogs(): Observable<any> {
    return this.http.get<any[]>( environment.url + 'jmxservice/getalltracesubscriberlogs').pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }

  getSubscriberLogStatus(msisdn:string, clusterID:string): Observable<any> {
    return this.http.get<any[]>( environment.url + 'jmxservice/gettraceenabledsubscriberlist/'+ msisdn + '/' + clusterID).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }

  getSubscriberFileLogStatus(payload:any): Observable<any> {
    return this.http.post<any[]>( environment.url + 'jmxservice/getsubscribertracelogs', payload).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }
   
   downloadSubscriberTraceLogs(payload:any): Observable<any> {
    return this.http.post( environment.url + 'jmxservice/downloadsubscribertracelogs',  payload).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }

  viewSubscriberTraceLogs(payload:any): Observable<any> {
    return this.http.post<any[]>( environment.url + 'jmxservice/viewsubscribertracelogs', payload).pipe(
      tap<any>(response => {
        return response
      }),
      catchError(this.handleErrorWithStatus)
    );
  }


   recoverData(data:any): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
     return this.http.post<any[]>( environment.url + 'failoverrecovery/recovery?zoneId=' + userTimeZone , data).pipe(
       tap<any>(response => {
         return response
       }),
       catchError(this.handleErrorWithStatus)
     );
   }

   primaryClusterData(): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.http.get<any[]>( environment.url + 'failoverrecovery/getPrimaryCluster?zoneId=' + userTimeZone).pipe(
       tap<any>(response => {
         return response
       }),
       catchError(this.handleErrorWithStatus)
     );
   }

  

    failOverRecoveryStatus(orderId:any): Observable<any> {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.http.get<any[]>( environment.url + 'failoverrecovery/status/' + orderId).pipe(
       tap<any>(response => {
         return response
       }),
       catchError(this.handleErrorWithStatus)
     );
   }

}
