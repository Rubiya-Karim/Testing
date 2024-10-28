import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../../services/spinner.service';
import { MessageService, MessageType } from 'src/app/services/message.service';

@Injectable()
export class HttpCallInterceptor implements HttpInterceptor {

    constructor(private toastService: ToastrService,
        private router: Router,
        private spinnerService: SpinnerService,
        private messageService: MessageService,) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.spinnerService.show();
        if (req.url.includes('process-management/kube/status')) {
            this.spinnerService.showMessage("Refreshing Status... Please wait.");
        }
        if (req.url.includes('/progress-stats'))
            this.spinnerService.hide();        
        if (req.url.includes('jmxservice/enabledisabletrace')) {
            this.spinnerService.showMessage("Processing... This might take few minutes.");
        }
        const hideSpinnner = req.headers.get('X-Hide-Spinner') === 'true';
        if (hideSpinnner) {
            this.spinnerService.hide();
        } else {
            this.spinnerService.show();
        }
        if (!(req.url.includes('/authenticate') || req.url.includes('/forgotPassword') || req.url.includes('/passwordReset') || (req.url.includes('otpValidate')))) {
            if (localStorage.getItem('token') != null || localStorage.getItem('token') != undefined) {
                req = req.clone({
                    setHeaders: { Authorization: `celcom ${localStorage.getItem('token')}` }
                });
            }
        }
        return next.handle(req)
            .pipe(
                tap(event => {
                    if (event instanceof HttpResponse) {
                        if (req.method !== 'GET') {
                            if (event?.body?.message) {
                                this.messageService.showMessage(MessageType.Success, event?.body?.message);
                            }
                        }
                    }
                }),
                catchError((err: HttpErrorResponse) => {
                    const error = (err && err.error) ? err.error.description || err.error.statusCode : 'error occured';
                    if (err instanceof HttpErrorResponse && err.error?.statusCode === 403) {
                        this.messageService.showError(err?.error?.description);
                        return throwError(() => err.error);
                    } else if (err.status === 500 || err.status === 400 || err.status !== 401) {
                        console.log("error", err);
                        this.messageService.showMessage(err?.error?.description, MessageType.Error);
                        return throwError(() => err.error);
                    }
                    else if (err instanceof HttpErrorResponse && err.status === 401) {
                        this.messageService.showMessage(err?.error?.description, MessageType.Error, true);
                        this.router.navigateByUrl('/')
                        return throwError(() => err.error);
                    } else {
                        localStorage.clear();
                        this.messageService.showMessage(err?.error?.description, MessageType.Error, true);
                        this.router.navigateByUrl('/')
                        return throwError(() => err.error);
                    }
                }),
                finalize(() => {
                    this.spinnerService.hide(); // Hide spinner after request completes (either success or error)
                })
            );

    }
}