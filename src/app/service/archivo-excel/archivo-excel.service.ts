import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceConfig } from '../serviceconfig';

import { Router } from '@angular/router';
//import { environment } from '../../../environments/environment';
import { ArchivoExcel } from 'src/app/domain/archivo-excel.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ArchivoExcelService {
    public archivoExcel: ArchivoExcel;
    public dataAuth: string;

    private get serviceBaseURL(): string {
        return environment.apiVoucher;
    }

    constructor(private httpClient: HttpClient, public router: Router,
        private serviceConfig: ServiceConfig) {

    }

    /* GET METHODS */

    public getArchivosExcel() {
        const url = this.serviceBaseURL + '/excel/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    /* DELETE METHODS */

    public cancelar(excel: ArchivoExcel): Observable<void> {
        const url = this.serviceBaseURL + '/excel/cancelar';

        return this.httpClient.put<void>(url, excel)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    /* SAVE METHODS */

    public save(archivoExcel: ArchivoExcel): Observable<any> {
        const url = this.serviceBaseURL + '/excel/importar';

        const data: FormData = new FormData();
        data.append('file', archivoExcel.archivo);


        return this.httpClient.post<any>(url, data)
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    /* UPDATE METHODS */

    public update(archivoExcel: ArchivoExcel): Observable<any> {
        const url = this.serviceBaseURL + '/excel/modificacion';

        const params = this.createHttpParams({});

        return this.httpClient.put<any>(url, archivoExcel, { params })
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    public disponibilizar(archivoExcel: ArchivoExcel): Observable<any> {
        const url = this.serviceBaseURL + '/excel/disponible';

        const params = this.createHttpParams({});

        return this.httpClient.put<any>(url, archivoExcel, { params })
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
