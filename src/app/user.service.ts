import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import * as AuthN from 'keratin-authn';
import { environment } from 'src/environments/environment';
import { Observable, from, OperatorFunction } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

export interface JWTClaims {
    iss: string;
    aud: string;
    sub: number;
    iat: number;
    exp: number;
}

export interface User {
    username: string;
    accountID: number;
    urn: string;
    phone: string;
    lastname: string;
    firstname: string;
    job: string;
    email: string;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService implements HttpInterceptor {
    constructor(private _http: HttpClient,
                private _router: Router,
                private _activeRoute: ActivatedRoute) {
        AuthN.setHost(environment.authServer);
        AuthN.setCookieStore("authn-token");
    }
    
    getProfile(): Observable<User> {
        const accountID = this.getAccountID();
        return this._http.get<User>(`${environment.iamServer}/users/${accountID}`)
    }

    saveProfile(u: User): Observable<User> {
        const accountID = this.getAccountID();
        return this._http.put<User>(`${environment.iamServer}/users/${accountID}`, {
            ...u,
            username: undefined, // remove username from request
        });
    }

    getAccountID(): number | null {
        try {
            const claims = jwt_claims(AuthN.session());
            return claims.sub;
        } catch (err) {
            return null;
        }
    }
    
    login(username: string, password: string): Observable<number> {
        return from(AuthN.login({username, password}))
            .pipe(
                map(() => AuthN.session()),
                map(session => jwt_claims(session)),
                tap(claims => console.log(claims)),
                map(claims => claims.sub),
            );
    }
    
    loginAndRedirect(username: string, password: string): Observable<number> {
        return this.login(username, password)
            .pipe(this._redirect())
    }

    importSession(): Observable<number> {
        return from(AuthN.importSession())
            .pipe(
                map(() => this.getAccountID()),
            );
    }
    
    importSessionAndRedirect(): Observable<number> {
        return this.importSession()
            .pipe(this._redirect())
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (AuthN.session() != undefined) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${AuthN.session()}`
                }
            })
        }

        return next.handle(req);
    }
    
    private _redirect<T>(): OperatorFunction<T, T> {
        return (source: Observable<T>) => {
            return source.pipe(tap(() => {
                if (this._activeRoute.snapshot.queryParamMap.has("redirect")) {
                    const target = this._activeRoute.snapshot.queryParamMap.get("redirect");
                    const url = new URL(target);
    
                    if (!url.hostname.endsWith(environment.redirectTld)) {
                        throw new Error(`invalid redirection target: ${url.hostname}`);
                    }
                    
                    window.location.replace(target);
                } else {
                    this._router.navigate(['profile'], {preserveQueryParams: true});
                }
            }))
        }
    }
}


function jwt_claims(jwt: string): JWTClaims {
    try {
        return JSON.parse(atob(jwt.split('.')[1]));
    } catch(e) {
        throw 'Malformed JWT: invalid encoding'
    }
}