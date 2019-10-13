import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import * as AuthN from 'keratin-authn';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface JWTClaims {
    iss: string;
    aud: string;
    sub: number;
    iat: number;
    exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService implements HttpInterceptor {
    constructor(private _http: HttpClient) { }
    
    getProfile(): Observable<any> {
        const accountID = this.getAccountID();
        return this._http.get(`${environment.iamServer}/users/${accountID}`)
    }

    getAccountID(): number | null {
        try {
            const claims = jwt_claims(AuthN.session());
            console.log(`claims`, claims);
            return claims.sub;
        } catch (err) {
            return null;
        }
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
}


function jwt_claims(jwt: string): JWTClaims {
    try {
        return JSON.parse(atob(jwt.split('.')[1]));
    } catch(e) {
        throw 'Malformed JWT: invalid encoding'
    }
}