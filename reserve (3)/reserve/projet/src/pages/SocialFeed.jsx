import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
  Heart, MessageSquare, Send, Share2, MoreHorizontal, 
  User, Image as ImageIcon, BarChart2, Smile, ArrowRight, TrendingUp, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SocialStyles = () => (
  <style>{`
    .social-app {
      background-color: #ffffff;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
    }

    .social-container {
      max-width: 1300px; /* Widened container */
      margin: 60px auto 0; /* Breathing room below Navbar */
      display: grid;
      grid-template-columns: 200px 1fr 280px; /* New Ratio: Left (200px), Center (1fr), Right (280px) */
      gap: 40px; /* Spacious Gap */
      padding: 100px 16px 40px;
    }

    /* Left Column: Profile Card */
    .profile-sidebar {
      position: sticky;
      top: 140px;
      height: fit-content;
      width: 200px; /* Fixed width matching grid column */
    }

    .profile-card {
      background: #ffffff;
      border: 1px solid #eff3f4;
      border-radius: 20px;
      padding: 24px 16px;
      text-align: center;
    }

    .profile-card-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto 16px;
      object-fit: cover;
      border: 2px solid #065f46;
      display: block;
    }

    .profile-card-name {
      font-weight: 800;
      font-size: 1.15rem;
      color: #0f1419;
      margin-bottom: 4px;
      line-height: 1.2;
    }

    .profile-card-link-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background-color: #065f46;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.8rem;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 20px;
      margin: 12px auto 0;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }

    .profile-card-link-btn:hover {
      background-color: #047857;
      transform: translateY(-1px);
    }

    /* Center Column: Wider Feed */
    .feed-column {
      display: flex;
      flex-direction: column;
    }

    .post-unit {
      background: #ffffff;
      border: 1px solid #eff3f4;
      border-radius: 16px;
      margin-bottom: 24px; /* Essential Vertical Spacing */
      padding: 20px;
      display: flex;
      gap: 16px;
    }

    .post-avatar-col {
      flex-shrink: 0;
    }

    .post-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      background: #f1f5f9;
    }

    .post-content-col {
      flex-grow: 1;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .post-author-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .post-full-name {
      font-weight: 700;
      color: #0f1419;
      font-size: 16px;
    }

    .post-meta {
      color: #536471;
      font-size: 14px;
    }

    .post-body {
      font-size: 16px; /* Slightly larger for the wider feed */
      line-height: 1.6;
      color: #0f1419;
      margin-bottom: 14px;
      white-space: pre-wrap;
    }

    .post-image-box {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #eff3f4;
      margin-bottom: 14px;
    }

    .post-image-box img {
      width: 100%;
      max-height: 600px; /* Taller images allowed in wider feed */
      object-fit: cover;
    }

    .post-actions-row {
      display: flex;
      justify-content: flex-start;
      gap: 30px;
      margin-top: 12px;
    }

    .action-button {
      background: none;
      border: none;
      color: #536471;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 8px;
      border-radius: 20px;
      transition: all 0.2s;
      font-size: 14px;
    }

    .action-button:hover.comment { color: #1d9bf0; background: rgba(29, 155, 240, 0.1); }
    .action-button:hover.like { color: #f91880; background: rgba(249, 24, 128, 0.1); }
    .action-button:hover.share { color: #00ba7c; background: rgba(0, 186, 124, 0.1); }

    .action-button {
      z-index: 10;
      pointer-events: auto;
    }

    .composer-box {
      background: #ffffff;
      border: 1px solid #eff3f4;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .preview-container {
      margin-top: 15px;
      position: relative;
      display: inline-block;
      max-width: 100%;
    }

    .preview-wrapper {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #eff3f4;
    }

    .preview-wrapper img {
      max-width: 100%;
      max-height: 300px;
      display: block;
      object-fit: contain;
    }

    .remove-preview-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(15, 20, 25, 0.75);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .remove-preview-btn:hover {
      background: rgba(15, 20, 25, 0.9);
    }

    .composer-textarea {
      width: 100%;
      border: none;
      outline: none;
      font-size: 1.25rem;
      font-family: inherit;
      resize: none;
      padding-top: 10px;
      color: #0f1419;
    }

    .emerald-button {
      background-color: #065f46;
      color: white;
      border: none;
      border-radius: 24px;
      padding: 10px 28px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .emerald-button:hover { background-color: #047857; }
    .emerald-button:disabled { opacity: 0.5; cursor: default; }

    /* Right Column: Suggested Sidebar */
    .trending-sidebar {
      position: sticky;
      top: 140px;
      height: fit-content;
      width: 280px;
    }

    .trending-box {
      background: #ffffff;
      border: 1px solid #eff3f4;
      border-radius: 20px;
      padding: 24px;
    }

    .trending-title {
      font-weight: 800;
      font-size: 1.1rem;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0f1419;
    }

    .trending-item {
      padding: 14px 0;
      border-bottom: 1px solid #eff3f4;
    }

    .trending-item:last-child { border: none; }

    .trending-label { color: #536471; font-size: 12px; }
    .trending-topic { font-weight: 700; display: block; margin: 4px 0; color: #0f1419; }

    /* Comments Area */
    .comments-area {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #eff3f4;
    }

    .comment-unit {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
    }

    .comment-bubble {
      background: #f7f9f9;
      padding: 10px 14px;
      border-radius: 16px;
      flex-grow: 1;
    }

    .comment-name { font-weight: 700; font-size: 14px; color: #0f1419; }
    .comment-text { font-size: 14px; margin-top: 3px; color: #334155; }

    @media (max-width: 1000px) {
      .social-container {
        grid-template-columns: 1fr;
        padding-top: 100px;
        margin-top: 20px;
        gap: 20px;
      }
      .profile-sidebar, .trending-sidebar {
        display: none;
      }
    }
  `}</style>
);

export default function SocialFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [specialists, setSpecialists] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      const res = await api.get('specialists/');
      setSpecialists(res.data.slice(0, 3)); // Get top 3
    } catch (err) {
      console.error("Error fetching specialists:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('posts/');
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('auth/user/');
      const rawUser = res.data;
      const fName = (rawUser.first_name + ' ' + rawUser.last_name).trim();
      const displayName = fName || (rawUser.username.includes('@') ? rawUser.username.split('@')[0] : rawUser.username);
      setCurrentUser({ ...rawUser, displayName });
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const handleLikeToggle = async (postId) => {
    const previousPosts = [...posts];
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_liked: !post.is_liked,
          likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
        };
      }
      return post;
    }));

    try {
      await api.post(`posts/${postId}/toggle-like/`);
    } catch (err) {
      console.error("Error toggling like:", err);
      setPosts(previousPosts);
    }
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));
  };

  return (
    <div className="social-app">
      <SocialStyles />
      <Navbar />
      
      <div className="social-container">
        
        {/* Left Sidebar (200px) */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <img 
              src={currentUser?.profile?.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
              className="profile-card-avatar" 
              alt="Me" 
            />
            <div className="profile-card-name">{currentUser?.displayName || 'Loading...'}</div>
            <a href="/profile" className="profile-card-link-btn">
              View Profile <ArrowRight size={14} />
            </a>
          </div>
        </aside>

        {/* Center Feed (1fr / approx 740px) */}
        <main className="feed-column">
          <PostComposer onPostPublished={fetchPosts} />

          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#536471' }}>Warming up the feed...</div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostItem 
                key={post.id} 
                post={post} 
                onLikeToggle={handleLikeToggle} 
                onCommentAdded={handleCommentAdded}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#536471' }}>Your feed is empty. Start by posting something!</div>
          )}
        </main>

        {/* Right Sidebar (280px) */}
        <aside className="trending-sidebar">
          <div className="trending-box">
            <div className="trending-title">
              <Users size={20} color="#065f46" /> Top Nutritionists
            </div>
            
            {specialists.length > 0 ? specialists.map((specialist) => (
              <div 
                key={specialist.id} 
                className="trending-item" 
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => navigate(`/specialist/${specialist.id}`)}
              >
                <span className="trending-label">{specialist.specialty_type || 'Nutrition Specialist'}</span>
                <span className="trending-topic" style={{ color: '#065f46' }}>{specialist.full_name}</span>
              </div>
            )) : (
              <div className="trending-item">
                <span className="trending-label">Loading experts...</span>
              </div>
            )}

            <div className="trending-title" style={{ marginTop: '24px' }}>
              <Users size={20} color="#065f46" /> Suggested Experts
            </div>
            <p style={{ fontSize: '13px', color: '#536471', margin: '0 0 16px' }}>Verified health professionals worth following.</p>
            <a href="/appointments" className="profile-card-link-btn" style={{ margin: 0, width: '100%' }}>
                Explore Experts
            </a>
          </div>
        </aside>

      </div>
    </div>
  );
}

const PostComposer = ({ onPostPublished }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await api.post('posts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setContent('');
      removeImage();
      onPostPublished();
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="composer-box">
      <div className="post-avatar-col">
        <img 
          src={localStorage.getItem('profileImage') || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
          className="post-avatar" 
          alt="Avatar" 
        />
      </div>
      <div className="post-content-col">
        <textarea 
          className="composer-textarea"
          placeholder="What's happening in health?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={content.split('\n').length || 1}
        />

        {imagePreview && (
          <div className="preview-container">
            <div className="preview-wrapper">
              <img src={imagePreview} alt="Selected" />
              <button className="remove-preview-btn" onClick={removeImage}>
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #eff3f4' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleImageChange}
            />
            <button 
              className="action-button" 
              style={{ color: '#065f46' }}
              onClick={() => fileInputRef.current.click()}
            >
              <ImageIcon size={20} />
            </button>
            <button className="action-button" style={{ color: '#065f46' }}><Smile size={20} /></button>
          </div>
          <button 
            className="emerald-button"
            disabled={isSubmitting || (!content.trim() && !image)}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PostItem = ({ post, onLikeToggle, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`posts/${post.id}/add-comment/`, { text: commentText });
      onCommentAdded(post.id, res.data);
      setCommentText('');
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-unit">
      <div className="post-avatar-col">
        <img 
          src={post.author_profile_image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
          className="post-avatar" 
          alt={post.author_username} 
          onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
        />
      </div>

      <div className="post-content-col">
        <div className="post-header">
          <div className="post-author-info">
            <span className="post-full-name">{post.full_name}</span>
            <span className="post-meta">· {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <MoreHorizontal size={18} color="#536471" />
        </div>

        <div className="post-body">{post.content}</div>

        {post.image && (
          <div className="post-image-box">
            <img src={post.image} alt="Post content" />
          </div>
        )}

        <div className="post-actions-row">
          <button 
            className="action-button like" 
            onClick={() => onLikeToggle(post.id)}
            style={{ color: post.is_liked ? '#f91880' : '' }}
          >
            <Heart size={18} fill={post.is_liked ? '#f91880' : 'none'} /> {post.likes_count || 0}
          </button>

          <button className="action-button comment" onClick={() => setShowComments(!showComments)}>
            <MessageSquare size={18} /> {post.comments?.length || 0}
          </button>
        </div>

        {showComments && (
          <div className="comments-area">
            <div style={{ marginBottom: '16px' }}>
              {post.comments?.map(comment => (
                <div key={comment.id} className="comment-unit">
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} color="#536471" />
                   </div>
                   <div className="comment-bubble">
                      <div className="comment-name">{comment.full_name}</div>
                      <div className="comment-text">{comment.text}</div>
                   </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="comment-input"
                placeholder="Reply to this news..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flexGrow: 1, background: '#eff3f4', border: 'none', borderRadius: '20px', padding: '10px 16px', outline: 'none', fontSize: '14px' }}
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !commentText.trim()}
                className="emerald-button"
                style={{ padding: '6px 20px', fontSize: '14px' }}
              >
                Reply
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
