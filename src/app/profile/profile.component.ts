import { Component, OnInit } from '@angular/core';
import * as AuthN from 'keratin-authn';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    name: string = '';

    constructor(private _router: Router,
                private _userService: UserService) { }

    ngOnInit() {
        if (this._userService.getAccountID() === null) {
            this._router.navigate(['/']);
        } else {
            this._userService.getProfile().subscribe(user => {
                if (!!user.firstname || !!user.lastname) {
                    this.name = `${user.firstname} ${user.lastname}`;
                } else {
                    this.name = user.username;
                }
            });
        }
    }

    logout() {
        AuthN.logout()
            .then(() => {
                this._router.navigate(['/']);
            });
    }

}
