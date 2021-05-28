import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpErrorResponse, HttpInterceptor, HttpHandler, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UsuarioService } from '../service.index';
import { ToastController } from '@ionic/angular';


@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  constructor(public toastController: ToastController, public usuarioService: UsuarioService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const re = '/oauth/token';
    // Exclude interceptor for login request:
    if (req.url.search(re) === -1) {
      if (localStorage.getItem('token') != null) {
        const clonedreq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
        });
        return next.handle(clonedreq)
          .pipe(
            catchError((err) => {
              if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
                  this.usuarioService.logout();
                  this.presentToastError("Sesión finalizada");
                } else if (err.status === 504) {
                  this.usuarioService.logout();
                  this.presentToastError("Hubo un fallo en el servidor");
                } else {
                  console.error('Communication error: ' + err.message);
                }
                if (err && err.error) {
                  return throwError(err.error);
                }
                return throwError(err.error);
              }
            }));
      }
    }
    return next.handle(req);
  }

  async presentToastError(msj: string) {
    const toast = await this.toastController.create({
      message: msj,
      duration: 2500,
      color: 'danger'
    });
    toast.present();
  }
}
