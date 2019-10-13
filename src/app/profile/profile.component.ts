import { Component, OnInit } from '@angular/core';
import * as AuthN from 'keratin-authn';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, User } from '../user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    name = '';
    saveInProgress = false;
    logoutInProgress = false;
    
    editMode: Observable<boolean>;

    profile: User;
    editModel: User = ({} as User); // required for first time load

    constructor(private _router: Router,
                private _activeRoute: ActivatedRoute,
                private _userService: UserService) { }
                

    ngOnInit() {
        this.editMode = this._activeRoute.queryParamMap
            .pipe(
                map(params => params.get("edit")),
                map(val => val !== null)
            )

        if (this._userService.getAccountID() === null) {
            this._router.navigate(['/']);
        } else {
            this._userService.getProfile().subscribe(user => {
                if (!!user.firstname || !!user.lastname) {
                    this.name = `${user.firstname} ${user.lastname}`;
                } else {
                    this.name = user.username;
                }

                this.profile = user;
                // we need to copy the model for editMode ASAP if
                // we directly enter it via ?edit
                this.editModel = {...user};
            });
        }
    }

    logout() {
        this.logoutInProgress = true;
        AuthN.logout()
            .then(() => {
                this.logoutInProgress = false;
            })
            .then(() => {
                this._router.navigate(['/']);
            });
    }

    editProfile() {
        this.editModel = {...this.profile};
        this._router.navigate([], {queryParams: {edit: ''}});
    }

    saveProfile() {
        this.saveInProgress = true;
        this._userService.saveProfile(this.editModel)
            .subscribe(user => {
                this.saveInProgress = false;
                this.profile = user;
                this.editModel = {...user};
                this._router.navigate([]);
            });
    }
    
    abortEdit() {
        this._router.navigate([]);
    }
}
