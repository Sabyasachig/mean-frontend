import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { Post } from './post.model';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService{
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router){}

  getPosts() {
    this.http.get<{message: string, posts: any}>(
        'http://localhost:3000/api/posts'
      )
      .pipe(map((postData) => {
          return postData.posts.map((post: { title: any; content: any; _id: any; }) => {
             return {
                title: post.title,
                content: post.content,
                id: post._id
              };
            });
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postUpdated.next([...this.posts]);
      });
  }

  getPost(id: string) {
    // return{...this.posts.find(p => p.id ===id)};
    return this.http
      .get<{_id: string, title: string, content: string}>('http://localhost:3000/api/posts/'+ id);
  }

  getPostUpdateListerner(){
    return this.postUpdated.asObservable();
  }

  addPost(post: Post){
    const postData: Post = {id: null, title: post.title, content: post.content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', postData)
      .subscribe((res) => {
        const postId = res.postId;
        postData.id = postId;
        this.posts.push(postData);
        this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string){
    const post: Post = {id: id, title: title, content: content};
    this.http
      .put('http://localhost:3000/api/posts/'+ id, post)
      .subscribe(response => {
        const updatePosts = [...this.posts];
        const oldPostIndex = updatePosts.findIndex(p => p.id == post.id)
        updatePosts[oldPostIndex] = post;
        this.posts = updatePosts;
        this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string){
    this.http.delete('http://localhost:3000/api/posts/'+ postId)
      .subscribe(() => {
        const updatedPost = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPost;
        this.postUpdated.next([...this.posts]);
      })
  }

}
