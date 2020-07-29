import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit{
    posts: Post[] = [];
    totalPosts = 0;
    postPerPage = 5;
    currentPage = 1;
    pageSizeOptions = [5, 10, 20, 50];

    userIsAuthenticated = false;
    private postsSub: Subscription;
    private authStatusSub: Subscription;

    constructor(
        public postsService: PostsService,
        private authService: AuthService
    ){}

    ngOnInit(){
        this.postsService.getPosts(this.postPerPage, this.currentPage);
        this.postsSub = this.postsService
        .getPostUpdatedListener()
        .subscribe((postData: {posts: Post[], postCount: number})=>{
            this.totalPosts = postData.postCount;
            this.posts = postData.posts;
        }) ;
        this.userIsAuthenticated = this.authService.getIsAuthenticated();
        this.authStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
        })
    }

    onChangePage(pageData: PageEvent){
        this.currentPage = pageData.pageIndex + 1;
        this.postPerPage = pageData.pageSize;
        this.postsService.getPosts(this.postPerPage, this.currentPage);

    }

    onDelete(postId: string){
        this.postsService.deletePost(postId).subscribe(() => {
            this.postsService.getPosts(this.postPerPage, this.currentPage  )
        });   
    }

    ngOnDestroy(){
        this.postsSub.unsubscribe();
        this.authStatusSub.unsubscribe();
    }
}