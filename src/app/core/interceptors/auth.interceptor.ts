import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar token a las peticiones a la API
    if (req.url.includes('/api/')) {
      return this.addTokenToRequest(req, next);
    }

    return next.handle(req);
  }

  private addTokenToRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return new Observable(observer => {
      this.authService.getAccessToken().then(token => {
        let authReq = req;
        
        if (token) {
          authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        next.handle(authReq).subscribe({
          next: (event) => observer.next(event),
          error: (error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              this.handle401Error(authReq, next).subscribe({
                next: (event) => observer.next(event),
                error: (err) => observer.error(err)
              });
            } else {
              observer.error(error);
            }
          },
          complete: () => observer.complete()
        });
      });
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokenData: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenData.accessToken);
          
          // Reintentar la petición original con el nuevo token
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${tokenData.accessToken}`
            }
          });
          
          return next.handle(authReq);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    } else {
      // Si ya se está refrescando el token, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authReq);
        })
      );
    }
  }
}
