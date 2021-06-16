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

    public getVouchersFiltro(filter, size, page){

        if (filter['desde'] == '') {
            filter.desde = '1900-01-01'
        }
        if (filter['hasta'] == '') {
            filter.hasta = '2200-01-01'
        }
        let url = this.serviceBaseURL + "/voucher/filtro?";

        for (let filtro in filter) {
            if (filter[filtro] != '') {
                if (filter[filtro] != 'TODOS' && filter[filtro] != 'TODAS' && filter[filtro] != null) {
                    url = url + '&' + filtro + '=' + filter[filtro];
                }
            }
        }
        
        url = url + `&size=${size}&page=${page}`; 
        
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    /* DELETE METHODS */

    public delete(voucher: Voucher): Observable<void> {
        const url = this.serviceBaseURL + '/voucher/eliminar';

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
        const url = this.serviceBaseURL + '/voucher/extenderVigencia';

        const params = this.createHttpParams({});

        return this.httpClient.put<any>(url, voucher, { params })
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    public noDisponible(voucher: Voucher): Observable<void> {
        const url = this.serviceBaseURL + '/voucher/no-disponible';

        return this.httpClient.put<void>(url, voucher)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    public duplicar(voucher: Voucher): Observable<void> {
        const url = this.serviceBaseURL + '/voucher/duplicado';

        return this.httpClient.put<void>(url, voucher)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
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
