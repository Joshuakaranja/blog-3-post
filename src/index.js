// Wait for the page to load
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  setupNewPostForm();
});

// Constants
const DEFAULT_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrPYwxUp3JKC6jOxAZeioI-VF4o_Chj9yF2A&s';
const API_URL = 'http://localhost:3000/posts';

// 1. Load and display all posts
const loadPosts = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to load posts');
    
    const posts = await response.json();
    const postList = document.getElementById('post-list');
    postList.innerHTML = '';
    
    posts.forEach(post => {
      const postItem = document.createElement('div');
      postItem.className = 'post-item';
      postItem.dataset.id = post.id;
      
      const postTitle = document.createElement('h3');
      postTitle.textContent = post.title;
      
      const postImage = document.createElement('img');
      postImage.src = post.image || DEFAULT_IMAGE;
      postImage.alt = post.title;
      postImage.className = 'post-image';
      
      postItem.append(postTitle, postImage);
      postList.appendChild(postItem);
      
      // Add click event to show post details
      postItem.addEventListener('click', () => showPostDetails(post.id));
    });
    
    // Show first post by default
    if (posts.length > 0) {
      await showPostDetails(posts[0].id);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    // You might want to show an error message to the user here
  }
};

// 2. Show details of a single post
const showPostDetails = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/${postId}`);
    if (!response.ok) throw new Error('Failed to load post details');
    
    const post = await response.json();
    const postDetail = document.getElementById('post-detail');
    
    postDetail.innerHTML = `
      <article>
        <h2>${post.title}</h2>
        <img src="${post.image || DEFAULT_IMAGE}" 
             alt="${post.title}" class="detail-image">
        <p class="post-content">${post.content}</p>
        <p class="post-author">By ${post.author}</p>
        <div class="post-actions">
          <button id="edit-post" class="btn-edit">Edit</button>
          <button id="delete-post" class="btn-delete">Delete</button>
        </div>
      </article>
    `;
    
    // Setup edit and delete buttons
    setupEditPost(post);
    setupDeletePost(postId);
  } catch (error) {
    console.error('Error loading post details:', error);
  }
};

// 3. Handle new post form submission
const setupNewPostForm = () => {
  const form = document.getElementById('new-post-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const newPost = {
      title: formData.get('title'),
      content: formData.get('content'),
      author: formData.get('author'),
      image: formData.get('image') || DEFAULT_IMAGE
    };
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost)
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      
      form.reset();
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  });
};

// 4. Edit post functionality
const setupEditPost = (post) => {
  const editBtn = document.getElementById('edit-post');
  const editForm = document.getElementById('edit-post-form');
  
  editBtn.addEventListener('click', () => {
    editForm.classList.remove('hidden');
    document.getElementById('edit-title').value = post.title;
    document.getElementById('edit-content').value = post.content;
  });
  
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updatedPost = {
      title: document.getElementById('edit-title').value,
      content: document.getElementById('edit-content').value
    };
    
    try {
      const response = await fetch(`${API_URL}/${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost)
      });
      
      if (!response.ok) throw new Error('Failed to update post');
      
      editForm.classList.add('hidden');
      await loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  });
  
  document.getElementById('cancel-edit').addEventListener('click', () => {
    editForm.classList.add('hidden');
  });
};

// 5. Delete post functionality
const setupDeletePost = (postId) => {
  const deleteBtn = document.getElementById('delete-post');
  
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`${API_URL}/${postId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete post');
        
        document.getElementById('post-detail').innerHTML = 
          '<p>Select a post to view details</p>';
        await loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  });
};