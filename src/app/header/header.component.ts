import { Component, OnInit } from "@angular/core";
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls:['./header.component.css']
})
export class HeaderComponent implements OnInit {
    userIsAuthenticated = false;
    private authListenerSubs: Subscription;
    constructor(private authService: AuthService) {}

    ngOnInit(){
        this.userIsAuthenticated = this.authService.getIsAuthenticated();
        this.authListenerSubs = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
        });
    }

    ngOnDestroy(){
        this.authListenerSubs.unsubscribe();
    }

    onLogout(){
        this.authService.logout();
    }
}