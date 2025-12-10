// script.js - Handle likes and comments with AJAX

// Initialize: load likes and comments on page load
document.addEventListener('DOMContentLoaded', () => {
  const likeButtons = document.querySelectorAll('.like-btn');
  const commentToggleButtons = document.querySelectorAll('.comment-toggle-btn');
  const commentSubmitButtons = document.querySelectorAll('.comment-submit-btn');
  const commentInputs = document.querySelectorAll('.comment-input');

  // Load initial data for all pins
  likeButtons.forEach(btn => {
    const pinId = btn.getAttribute('data-pin-id');
    loadLikes(pinId);
    loadComments(pinId);
  });

  // Like button click handler
  likeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pinId = btn.getAttribute('data-pin-id');
      toggleLike(pinId, btn);
    });
  });

  // Comment toggle buttons
  commentToggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pinId = btn.getAttribute('data-pin-id');
      const commentSection = document.getElementById(`comment-section-${pinId}`);
      commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
    });
  });

  // Comment submit buttons
  commentSubmitButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pinId = btn.getAttribute('data-pin-id');
      const input = document.querySelector(`.comment-input[data-pin-id="${pinId}"]`);
      const commentText = input.value.trim();
      
      if (commentText) {
        submitComment(pinId, commentText, input);
      }
    });
  });

  // Allow Enter key to submit comment
  commentInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const pinId = input.getAttribute('data-pin-id');
        const commentText = input.value.trim();
        
        if (commentText) {
          submitComment(pinId, commentText, input);
        }
      }
    });
  });
});

/**
 * Load like count and check if current user liked the pin
 */
function loadLikes(pinId) {
  fetch(`like.php?pin_id=${pinId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const likeBtn = document.querySelector(`.like-btn[data-pin-id="${pinId}"]`);
        likeBtn.querySelector('.like-count').textContent = data.like_count;
        
        if (data.is_liked) {
          likeBtn.classList.add('liked');
          likeBtn.querySelector('.heart').textContent = '♥';
        }
      }
    })
    .catch(err => console.error('Error loading likes:', err));
}

/**
 * Toggle like/unlike
 */
function toggleLike(pinId, likeBtn) {
  const formData = new FormData();
  formData.append('pin_id', pinId);

  fetch('like.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        likeBtn.querySelector('.like-count').textContent = data.like_count;
        
        if (data.action === 'liked') {
          likeBtn.classList.add('liked');
          likeBtn.querySelector('.heart').textContent = '♥';
        } else {
          likeBtn.classList.remove('liked');
          likeBtn.querySelector('.heart').textContent = '♡';
        }
      }
    })
    .catch(err => console.error('Error toggling like:', err));
}

/**
 * Load comments for a pin
 */
function loadComments(pinId) {
  fetch(`comment.php?pin_id=${pinId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayComments(pinId, data.comments);
      }
    })
    .catch(err => console.error('Error loading comments:', err));
}

/**
 * Display comments in the UI
 */
function displayComments(pinId, comments) {
  const commentsList = document.getElementById(`comments-list-${pinId}`);
  commentsList.innerHTML = '';

  if (comments.length === 0) {
    commentsList.innerHTML = '<p style="color: #999; font-size: 0.9rem; text-align: center;">No comments yet</p>';
    return;
  }

  comments.forEach(comment => {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.setAttribute('data-comment-id', comment.id);
    
    const timeAgo = getTimeAgo(comment.created_at);

    commentEl.innerHTML = `
      <div class="comment-author">${escapeHtml(comment.username)}</div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
      <div class="comment-time">${timeAgo}</div>
    `;

    commentsList.appendChild(commentEl);
  });
}

/**
 * Submit a new comment
 */
function submitComment(pinId, commentText, inputElement) {
  const formData = new FormData();
  formData.append('pin_id', pinId);
  formData.append('comment', commentText);

  fetch('comment.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        inputElement.value = '';
        loadComments(pinId); // Reload comments to show new one
      } else {
        alert('Error: ' + data.message);
      }
    })
    .catch(err => {
      console.error('Error submitting comment:', err);
      alert('Error submitting comment');
    });
}

/**
 * Format time as relative (e.g., "2 minutes ago")
 */
function getTimeAgo(dateString) {
  const now = new Date();
  const commentDate = new Date(dateString);
  const secondsAgo = Math.floor((now - commentDate) / 1000);

  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  
  return commentDate.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
