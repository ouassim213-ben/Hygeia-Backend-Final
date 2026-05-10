import React, { useState } from 'react';
import { Image as ImageIcon, Video, Send } from 'lucide-react';
import api from '../api';

export default function PostForm({ onPostPublished }) {
  const [newPostContent, setNewPostContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const publishPost = async () => {
    if (!newPostContent.trim()) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('content', newPostContent);
    if(imageFile) {
        // Ensuring the field name matches the backend 'image' field
        formData.append('image', imageFile);
    }
    
    try {
      await api.post('posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewPostContent('');
      setImagePreview(null);
      setImageFile(null);
      if (onPostPublished) {
        onPostPublished("Success! Your post is pending admin approval.");
      }
    } catch(e) {
      console.error("Failed to publish post:", e);
      alert("Failed to publish post. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel create-post" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--color-navy)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ 
          width: '45px', height: '45px', borderRadius: '50%', 
          overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc', flexShrink: 0 
        }}>
          <img 
            src={localStorage.getItem('profileImage') || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
            alt="My Profile" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
          />
        </div>
        <textarea 
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Start a post..." 
          style={{ width: '100%', minHeight: '45px', border: '2px solid var(--color-navy)', borderRadius: '15px', background: 'white', color: 'var(--color-navy)', resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '1.05rem', outline: 'none', padding: '12px 20px' }}
        />
      </div>
      
      {imagePreview && (
        <div style={{ marginTop: '15px', position: 'relative' }}>
          <img src={imagePreview} style={{ width: '100%', borderRadius: '12px', maxHeight: '300px', objectFit: 'cover' }} alt="Preview" />
          <button onClick={removeImage} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div className="post-actions-composer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid rgba(25,68,89,0.1)' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <label className="composer-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.7, cursor: 'pointer', padding: '8px 12px' }}>
            <ImageIcon color="#3b82f6" size={18} /> Photo
            <input type="file" name="image" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </label>
          <button className="composer-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px' }}><Video color="#10b981" size={18} /> Video</button>
        </div>
        
        <button 
          onClick={publishPost} 
          disabled={loading || !newPostContent.trim()}
          className="btn btn-primary" 
          style={{ padding: '0.6rem 2rem', borderRadius: 'var(--radius-full)', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
