import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators'
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = []
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

    constructor(private httpClient: HttpClient, private router: Router ){}

    getPosts(postsPerPage: number, currentPage: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.httpClient.get<{Currentposts:Post[], maxPosts: number}>('http://localhost:3003/posts' + queryParams)
        .pipe(map((postData) =>{
            return {
                Currentposts: postData.Currentposts.map(post =>{
                    return{
                        title: post.title,
                        content: post.content,
                        _id: post._id,
                        //creator: post.creator
                    }
                }),
                maxPosts: postData.maxPosts
            }
        }))
        .subscribe(transformedPost =>{
            debugger
            this.posts = transformedPost.Currentposts;
            this.postsUpdated.next({
                posts: [...this.posts], 
                postCount:transformedPost.maxPosts
            });
        }); 
    }

    getPostUpdatedListener(){
        return this.postsUpdated.asObservable();
    }

    getPost(_id: string){
        return this.httpClient.get<{ _id: string, title: string, content: string}>
        ('http://localhost:3003/posts/'+ _id);
    } 

    addPost(title: string, content:string){
        const post: Post = {_id:null, title:title, content: content};
        this.httpClient
        .post<{message: string, postId: string}>('http://localhost:3003/posts',post)
        .subscribe(responseData =>{
            this.router.navigate(['/posts']);
        })
    }

    updatePost(id: string, title: string, content: string){
        const post: Post = {_id: id, title: title, content: content};
        this.httpClient.put('http://localhost:3003/posts/'+ id, post)
        .subscribe(response => {
            this.router.navigate(['/posts']);
        }) 
    }

    deletePost(postId: string){
        //debugger
        return this.httpClient
        .delete('http://localhost:3003/posts/'+ postId);
    }
}