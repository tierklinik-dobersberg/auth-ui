import { Component, OnInit } from '@angular/core';
import * as AuthN from 'keratin-authn';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    username: string;
    password: string;
    accountID: number | null = null;
    
    constructor(private _router: Router,
                private _activeRoute: ActivatedRoute,
                private _userService: UserService) {}
    
    ngOnInit() {
        AuthN.setHost(environment.authServer);
        AuthN.setCookieStore("authn-token");

        AuthN.importSession()
            .then(() => {
                this.accountID = this._userService.getAccountID();
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
            .catch(() => {})
    }
}
