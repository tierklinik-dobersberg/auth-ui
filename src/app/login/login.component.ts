import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    username: string = '';
    password: string = '';
    error = false;
    loading = false;

    constructor(private _userService: UserService) {}

    ngOnInit() {
    }

    login() {
        this.loading = true;

        this._userService.loginAndRedirect(this.username, this.password)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => this.error = false,
                error: err => {
                    console.log(err);
                    this.error = true;
                }
            })
    }
}
