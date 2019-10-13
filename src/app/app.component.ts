import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(private _userService: UserService) {}
    
    ngOnInit() {
        this._userService.importSessionAndRedirect()
            .subscribe({
                error: () => {},
            })
    }
}
