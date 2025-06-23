// src/index.js

// Main initialization when DOM loads
document.addEventListener('DOMContentLoaded', main);

function main() {
  displayPosts();       // Core 1: Load and display all posts
  addNewPostListener(); // Core 3: Setup new post form
  
  // Advanced: Auto-display first post
  fetchFirstPost();
}

// CORE 1: Fetch and display all posts
function displayPosts() {
  fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(posts => {
      const postList = document.getElementById('post-list');
      postList.innerHTML = posts.map(post => `
        <div class="post-item" data-id="${post.id}">
          <h3>${post.title}</h3>
          <img src="${post.image || 'https://via.placeholder.com/150'}" 
               alt="${post.title}" class="post-image">
        </div>
      `).join('');
      
      // Add click handlers to each post
      document.querySelectorAll('.post-item').forEach(item => {
        item.addEventListener('click', handlePostClick);
      });
    })
    .catch(error => console.error('Error loading posts:', error));
}

// CORE 2: Display post details when clicked
function handlePostClick(event) {
  const postId = event.currentTarget.dataset.id;
  fetch(`http://localhost:3000/posts/${postId}`)
    .then(response => response.json())
    .then(post => {
      document.getElementById('post-detail').innerHTML = `
        <article>
          <h2>${post.title}</h2>
          <img src="${post.image || 'https://via.placeholder.com/300'}" 
               alt="${post.title}" class="detail-image">
          <p class="post-content">${post.content}</p>
          <p class="post-author">By ${post.author}</p>
          <div class="post-actions">
            <button id="edit-post" class="btn-edit">Edit</button>
            <button id="delete-post" class="btn-delete">Delete</button>
          </div>
        </article>
      `;
      
      setupEditForm(post);
      setupDeleteButton(postId);
    });
}

// CORE 3: Handle new post submission
function addNewPostListener() {
  document.getElementById('new-post-form').addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newPost = {
      title: formData.get('title'),
      content: formData.get('content'),
      author: formData.get('author'),
      image: formData.get('image') || 'https://via.placeholder.com/150'
    };

    fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost)
    })
    .then(() => {
      e.target.reset();
      displayPosts();
    });
  });
}

// ADVANCED: Display first post on load
function fetchFirstPost() {
  fetch('http://localhost:3000/posts')
    .then(res => res.json())
    .then(posts => {
      if (posts.length > 0) {
        const firstPost = document.querySelector('.post-item');
        if (firstPost) firstPost.click();
      }
    });
}

// ADVANCED: Edit post functionality
function setupEditForm(post) {
  const form = document.getElementById('edit-post-form');
  const editBtn = document.getElementById('edit-post');
  
  editBtn.addEventListener('click', () => {
    form.classList.remove('hidden');
    document.getElementById('edit-title').value = post.title;
    document.getElementById('edit-content').value = post.content;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const updatedPost = {
      title: document.getElementById('edit-title').value,
      content: document.getElementById('edit-content').value
    };

    fetch(`http://localhost:3000/posts/${post.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPost)
    })
    .then(() => {
      form.classList.add('hidden');
      displayPosts();
    });
  });

  document.getElementById('cancel-edit').addEventListener('click', () => {
    form.classList.add('hidden');
  });
}

// ADVANCED: Delete post functionality
function setupDeleteButton(postId) {
  document.getElementById('delete-post').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this post?')) {
      fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'DELETE'
      })
      .then(() => {
        document.getElementById('post-detail').innerHTML = 
          '<p class="empty-message">Select a post to view details</p>';
        displayPosts();
      });
    }
  });
}