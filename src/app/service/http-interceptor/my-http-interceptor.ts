import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpErrorResponse, HttpInterceptor, HttpHandler, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UsuarioService } from '../service.index';


@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  constructor(private router: Router, public usuarioService: UsuarioService) { }

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
                  localStorage.removeItem('token');
                  this.usuarioService.usuario = null;
                  this.router.navigate(['/user']);
                } else {
                  console.error('Communication error: ' + err.status);
                }
                if (err && err.error) {
                  return throwError(err.error);
                }
                return throwError('backend comm error');
              }
            }));
      }
    }
    return next.handle(req);
  }
}
