import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { NgForm } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  public enteredContent = '';
  public enteredTitle = '';
  public post: Post;
  public isLoading: boolean = false;
  private mode: string = 'create';
  private postId: string;

  constructor(public postService: PostsService, public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')){
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {id: postData._id, title: postData.title, content: postData.content};
        });
      }else{
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    if(form.invalid){
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create'){
      const post: Post = {
        id: null,
        title: form.value.title,
        content: form.value.content
      };
      this.postService.addPost(post);
    }else{
      this.postService.updatePost(
        this.postId,
        form.value.title,
        form.value.content
      )
    }
    form.resetForm();
  }

}
