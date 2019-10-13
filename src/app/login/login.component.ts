import { Component, OnInit } from '@angular/core';
import * as AuthN from 'keratin-authn';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    username: string = '';
    password: string = '';

    constructor(private _router: Router,
                private _activeRoute: ActivatedRoute) {}

    ngOnInit() {
    }

    login() {
        AuthN.login({
            username: this.username,
            password: this.password,
        })
        .then(() => {
            if (this._activeRoute.snapshot.queryParamMap.has("redirect")) {
                const target = this._activeRoute.snapshot.queryParamMap.get("redirect");
                const url = new URL(target);

                if (!url.hostname.endsWith(environment.redirectTld)) {
                    throw new Error(`invalid redirection target: ${url.hostname}`);
                }
                
                window.location.replace(target);
            } else {
                this._router.navigate(['profile']);
            }
        })
        .catch((err) => {
            console.log(`login failed`, err);
        });
    }
}
