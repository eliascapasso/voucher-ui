import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceConfig } from '../serviceconfig';

import { Router } from '@angular/router';
//import { environment } from '../../../environments/environment';
import { Voucher } from 'src/app/domain/voucher.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VoucherService {
    public voucher: Voucher;
    public dataAuth: string;

    private get serviceBaseURL(): string {
        return environment.apiVoucher;
    }

    constructor(private httpClient: HttpClient, public router: Router,
        private serviceConfig: ServiceConfig) {

    }

    /* GET METHODS */

    public getVouchers() {
        const url = this.serviceBaseURL + '/voucher/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    public getVouchersEmitidos() {
        const url = this.serviceBaseURL + '/voucher/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    public getVouchersUtilizados() {
        const url = this.serviceBaseURL + '/voucher/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    public getVouchersEliminados() {
        const url = this.serviceBaseURL + '/voucher/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    /* DELETE METHODS */

    public delete(voucher: Voucher): Observable<void> {
        const url = this.serviceBaseURL + '';

        return this.httpClient.put<void>(url, voucher)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    /* SAVE METHODS */

    public save(voucher: Voucher): Observable<any> {
        const url = this.serviceBaseURL + '';

        return this.httpClient.post<any>(url, voucher)
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    /* UPDATE METHODS */

    public update(voucher: Voucher): Observable<any> {
        const url = this.serviceBaseURL + '';

        const params = this.createHttpParams({});

        return this.httpClient.put<any>(url, voucher, { params })
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    /* HELPERS */

    private handleError(error: HttpErrorResponse): Observable<never> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        this.log('error', error);
        return throwError(error);
    }

    private log(level: string, message: any): void {
        if (this.serviceConfig.debug) {
            console[level](message);
        }
    }

    private createHttpParams(values: { [index: string]: any }): HttpParams {
        let params: HttpParams = new HttpParams();

        Object.keys(values).forEach((key: string) => {
            const value: any = values[key];
            if (value !== undefined) {
                params = params.set(key, String(value));
            }
        });

        return params;
    }
}