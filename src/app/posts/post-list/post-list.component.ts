import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  public posts: Post[] = [];
  public isLoading: boolean = false;
  public totalPosts: number = 0;
  public postsPerPage: number = 2;
  public pageSizeOptions: number[] = [1, 2, 5, 10];
  public currentPage: number = 1;
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  public userIsAuthenticated: boolean = false;

  constructor(public postService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    console.log(this.postsPerPage);
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postService.getPostUpdateListerner()
      .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();  
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onChangePage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(){
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
        this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

}
