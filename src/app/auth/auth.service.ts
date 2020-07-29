import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { iAuthData } from "./auth-data.model";

@Injectable({providedIn: "root"})
export class AuthService {
    private token: string;
    private authStatusListener = new Subject<boolean>()
    private isAuthenticated = false;
    private tokenTimer: any;
    constructor(private http: HttpClient, private router: Router){}

    getToken() {
        return this.token;
    }

    getIsAuthenticated(){
        return this.isAuthenticated;
    }

    getAuthStatusListener(){
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string){
        const authData: iAuthData = {email: email, password: password}
        this.http.post('http://localhost:3003/signup', authData)
        .subscribe(response => {
            console.log(response)
        })
    }

    login(email:string, password: string){
        const authData: iAuthData = {email: email, password: password}
        this.http.post<{token: string, expiresIn: number}>('http://localhost:3003/login', authData)
        .subscribe(response =>{
            const token = response.token;
            this.token = token;
            if (token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.isAuthenticated = true;
                this.authStatusListener.next(true);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                this.saveAuthData(token, expirationDate);
                this.router.navigate(['/posts'])
            }
        })
    }

    autoAuthUser(){
        const authInformation = this.getAuthData()
        if (!authInformation) {
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated =true;
            this.setAuthTimer(expiresIn/1000)
            this.authStatusListener.next(true);
        }
    }

    logout(){
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.clearAuthData();
        this.router.navigate(['/posts'])
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout()
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date) {
      localStorage.setItem("token", token);
      localStorage.setItem("expiration", expirationDate.toISOString());  
    }

    private getAuthData() {
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration")
        if (!token || !expirationDate) {
            return;
        }
        return{
            token: token,
            expirationDate: new Date(expirationDate)
        }
    }

    private clearAuthData() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
    }
}