import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../../domain/usuario.model';
import { ServiceConfig } from '../serviceconfig';

import { Router } from '@angular/router';
import { ResetPassword } from '../../domain/reset.password';
import { UsuarioLogin } from '../../domain/usuario.login.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    public usuario: Usuario;
    public usuarioLoginNotification = new BehaviorSubject<Usuario>({ email: 'SIN IDENTIFICACION' });
    public dataAuth: string;

    private get serviceBaseURL(): string {
        return environment.ssoUrl;
    }

    private get serviceOauthURL(): string {
        return environment.oauthUrl;
    }

    constructor(private httpClient: HttpClient, public router: Router,
        private serviceConfig: ServiceConfig) {

    }

    /* GET METHODS */

    public getUsuarios(){
        const url = 'http://localhost:8090/api/usuario/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, {params}).toPromise();
    }

    public getUserMe(): Observable<Usuario> {
        const url = this.serviceBaseURL + '/userDetails';
        const params = this.createHttpParams({});

        return this.httpClient.get<Usuario>(url, { params })
            .pipe(
                map((data: Usuario) => {
                    this.usuarioLoginNotification.next(data);
                    return this.usuario = data;
                }),
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    public getUsuarioById(id: string): Observable<Usuario> {
        const url = this.serviceBaseURL + '/users/' + id + '';
        const params = this.createHttpParams({});

        return this.httpClient.get<Usuario>(url, { params })
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    public getUsuarioByDni(dni) {
        const url = this.serviceBaseURL + '/user/dni/' + dni;
        const params = this.createHttpParams({});
        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    /* DELETE METHODS */

    public delete(usuario: Usuario): Observable<void> {
        const url = this.serviceBaseURL + '/user/';
        const params = this.createHttpParams({});

        return this.httpClient.delete<void>(url + usuario.email, { params })
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    /* SAVE METHODS */

    public save(usuario: Usuario): Observable<any> {
        const url = this.serviceBaseURL + '/user/register';
        const httpOptions = {
            headers: new HttpHeaders({ Authorization: 'Bearer ' + String(localStorage.getItem('token')) })
        };

        return this.httpClient.post<any>(url, usuario, httpOptions)
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    /* UPDATE METHODS */

    public update(usuario: Usuario): Observable<any> {
        const url = this.serviceBaseURL + '/user';
        const httpOptions = {
            headers: new HttpHeaders({ Authorization: 'Bearer ' + String(localStorage.getItem('token')) })
        };

        return this.httpClient.put<any>(url, usuario, httpOptions)
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    logout() {

        this.router.navigate(['/login']);

        //DESCOMENTAR
        // this.usuario = null;
        // localStorage.removeItem('token');
        // this.usuarioLoginNotification.next({username: 'SIN IDENTIFICAR'});
        // this.router.navigate(['/login']);
    }

    login(usuarioLogin: UsuarioLogin) {
        var url = "localhost:8090/api/auth/login";
        
        this.dataAuth = "username=" + usuarioLogin.username 
                        + "&password=" + usuarioLogin.password;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        }; 

        return this.httpClient.post<any>(url, this.dataAuth, httpOptions)
        .pipe(
                map((data: any) => {
                    console.log('login with ' + data.access_token);
                    localStorage.setItem('token', data.access_token);
                }),
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    public changePassword(resetPassword: ResetPassword): Observable<Usuario> {
        const url = this.serviceBaseURL + '/user/updatePassword';

        resetPassword.username = this.usuario.email;

        const params = this.createHttpParams({});

        return this.httpClient.post<any>(url, resetPassword, { params })
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    public recuperarPassword(email: string): Observable<Usuario> {
        const url = this.serviceBaseURL + '/user/public/recoveryPass';
        const params = this.createHttpParams({});

        return this.httpClient.post<any>(url, email, { params })
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
