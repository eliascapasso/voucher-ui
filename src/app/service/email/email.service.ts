import { HttpClient, HttpParams, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ServiceConfig } from '../serviceconfig';

import { Router } from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {EmailModel} from '../../domain/email.model';

@Injectable({
    providedIn: 'root'
})
export class EmailoService {

    public mockEndPoint = 'http://10.4.101.107:8002/api/gestorplantillas';

    private get serviceBaseURL(): string {
        return  this.mockEndPoint;
    }

    constructor(private httpClient: HttpClient, public router: Router, private serviceConfig: ServiceConfig) {

    }

    public sendEmail(emailModel: EmailModel): Observable<any> {
        const url = this.serviceBaseURL + '/v1/send-email';
        const params = this.createHttpParams({});

        return this.httpClient.post<any>(url, emailModel, { params })
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

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