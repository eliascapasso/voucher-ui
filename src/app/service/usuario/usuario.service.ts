import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ServiceConfig } from '../serviceconfig';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MenuController } from '@ionic/angular';

import { Usuario } from '../../domain/usuario.model';
import { ResetPassword } from '../../domain/reset.password';
import { UsuarioLogin } from '../../domain/usuario-login.model';
import { UsuarioRequest } from '../../domain/usuario-request.model';
import { Role } from 'src/app/domain/role.model';
import { Empresa } from 'src/app/domain/empresa.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    public usuario: Usuario;
    public usuarioLoginNotification = new BehaviorSubject<Usuario>({ email: 'SIN IDENTIFICACION' });

    private get serviceBaseURL(): string {
        return environment.apiUrl;
    }

    constructor(private httpClient: HttpClient, public router: Router,
        private serviceConfig: ServiceConfig, public menuCtrl: MenuController) {

    }

    /* GET METHODS */

    public getUsuarios() {
        const url = this.serviceBaseURL + '/usuario/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<any>(url, { params }).toPromise();
    }

    public getUserMe(): Observable<Usuario> {
        const url = this.serviceBaseURL + '/usuario/' + localStorage.getItem('email');
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

    public getRoles() {
        const url = this.serviceBaseURL + '/role/todos';
        const params = this.createHttpParams({});

        return this.httpClient.get<Role[]>(url, { params }).toPromise();
    }

    public getEmpresas() {
        const url = this.serviceBaseURL + '/empresa/todas';
        const params = this.createHttpParams({});

        return this.httpClient.get<Empresa[]>(url, { params }).toPromise();
    }

    /* DELETE METHODS */

    public delete(usuario: Usuario): Observable<void> {
        const url = this.serviceBaseURL + '/user/';
        const params = this.createHttpParams({});

        return this.httpClient.delete<void>(url + usuario.email, { params })
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    /* SAVE METHODS */

    public save(usuario: UsuarioRequest): Observable<any> {
        const url = this.serviceBaseURL + '/auth/signup';

        return this.httpClient.post<any>(url, usuario)
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    /* UPDATE METHODS */

    public update(usuario: UsuarioRequest): Observable<any> {
        const url = this.serviceBaseURL + '/usuario/modificacion';

        return this.httpClient.put<any>(url, usuario)
            .pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    /* OTHERS */

    logout() {
        this.usuario = null;
        localStorage.clear();
        this.menuCtrl.enable(false);
        this.usuarioLoginNotification.next({ email: 'SIN IDENTIFICAR' });
        this.router.navigate(['/login']);
    }

    login(usuarioLogin: UsuarioLogin) {
        var url = this.serviceBaseURL + "/auth/signin";

        let body = {
            email: usuarioLogin.email,
            password: usuarioLogin.password
        }

        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        };

        return this.httpClient.post<any>(url, body, httpOptions)
            .pipe(
                map((data: any) => {
                    console.info(data);
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('email', usuarioLogin.email);
                    this.getUserMe();
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
