import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PostForm from '../components/PostForm';
import { Bookmark, FileText, Video, Image as ImageIcon, Calendar, Newspaper, Send, MessageSquare, Share2, Heart, MoreHorizontal, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await api.get('posts/');
      if(res.data) setPosts(res.data);
    } catch(e) {
      console.error("Error fetching posts:", e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostPublished = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
    fetchPosts();
  };

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
        <section className="section" style={{ paddingTop: '120px', minHeight: '100vh' }}>
          <div className="animate-fade p-0">
            <div className="social-layout" style={{ display: 'grid', gridTemplateColumns: '280px minmax(auto, 600px) 280px', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', justifyContent: 'center', alignItems: 'start' }}>
              
              {/* Left Sidebar: Role-Aware Mini Profile */}
              <aside className="left-sidebar">
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--color-navy)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                  {localStorage.getItem('token') && (() => {
                    const isNutritionist = localStorage.getItem('user_type')?.toLowerCase() === 'nutritionist';
                    return (
                      <>
                        <div className="mini-profile-cover" style={{ height: '75px', background: isNutritionist ? 'linear-gradient(135deg, #021B27, #0a2d3d)' : 'linear-gradient(135deg, var(--color-teal), var(--color-navy))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', margin: '-1.25rem -1.25rem 0 -1.25rem' }}></div>
                        <div className="mini-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', border: isNutritionist ? '3px solid #88B699' : '3px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', margin: '-35px auto 10px', overflow: 'hidden', background: '#f8fafc' }}>
                          <img src={localStorage.getItem('profileImage') || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }} />
                        </div>
                        <h3 className="mini-name" style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: '400', marginBottom: '2px', color: 'var(--color-navy)', fontFamily: 'var(--font-heading)' }}>
                          {isNutritionist ? 'Dr. ' : ''}{localStorage.getItem('firstName') || 'User'} {localStorage.getItem('lastName') || ''}
                        </h3>
                        <p className="mini-headline" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-navy)', opacity: 0.7, marginBottom: '15px' }}>
                          {isNutritionist ? 'Certified Nutritionist' : 'Health & Wellness Enthusiast'}
                        </p>

                        {isNutritionist ? (
                          // NUTRITIONIST SIDEBAR STATS
                          <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(25,68,89,0.1)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                              <span>Professional Rating</span>
                              <strong style={{ color: '#88B699' }}>⭐ 5.0 / 5</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(25,68,89,0.1)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                              <span>Consultations</span>
                              <strong style={{ color: 'var(--color-olive)' }}>Active</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(25,68,89,0.1)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                              <span>Account Status</span>
                              <strong style={{ color: '#15803d' }}>✓ Verified</strong>
                            </div>
                          </div>
                        ) : (
                          // PATIENT SIDEBAR STATS
                          <div style={{ marginTop: '20px' }}>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(25,68,89,0.1)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                              <span>Health Level</span>
                              <strong style={{ color: 'var(--color-olive)' }}>8.5 / 10</strong>
                            </div>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(25,68,89,0.1)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                              <span>Network</span>
                              <strong style={{ color: 'var(--color-olive)' }}>245 links</strong>
                            </div>
                            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(25,68,89,0.1)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                              <span>Target</span>
                              <strong style={{ color: 'var(--color-olive)' }}>Fat Loss</strong>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {!localStorage.getItem('token') && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <p style={{ color: 'var(--color-navy)', fontSize: '1rem', fontWeight: '500' }}>Welcome to Hygeia</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginTop: '5px' }}>Login to see your personalized health stats.</p>
                      <button onClick={() => window.location.href='/login'} className="btn btn-primary" style={{ marginTop: '15px', padding: '8px 20px', fontSize: '0.85rem' }}>Login</button>
                    </div>
                  )}
                </div>

                {localStorage.getItem('token') && (() => {
                  const isNutritionist = localStorage.getItem('user_type')?.toLowerCase() === 'nutritionist';
                  return (
                    <div className="glass-panel" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--color-navy)', borderRadius: 'var(--radius-lg)' }}>
                      {isNutritionist ? (
                        <>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--color-navy)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar color="#021B27" size={18} /> My Tools
                          </h4>
                          <a href="/schedule" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.85, textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' }}>
                            <Calendar size={16} /> My Schedule
                          </a>
                          <a href="/appointments" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.85, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                            <Newspaper size={16} /> My Patients
                          </a>
                        </>
                      ) : (
                        <>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--color-navy)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bookmark color="#B0B761" size={18} /> Bookmarked
                          </h4>
                          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.8, textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px' }}>
                            <FileText size={16} /> My Weekly Nutrition Plan
                          </a>
                          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.8, textDecoration: 'none', fontSize: '0.9rem' }}>
                            <Video size={16} /> Core Workout Video
                          </a>
                        </>
                      )}
                    </div>
                  );
                })()}
              </aside>


              {/* Center Content: Feed */}
              <div className="center-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Create Post Composer: Only for logged-in users */}
                {localStorage.getItem('token') && (
                  <PostForm onPostPublished={handlePostPublished} />
                )}

                <div id="posts-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {successMessage && (
                    <div className="glass-panel animate-fade" style={{ background: 'rgba(176, 183, 97, 0.1)', border: '1px solid var(--color-olive)', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: 'var(--color-olive)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <CheckCircle size={20} /> {successMessage}
                    </div>
                  )}
                  {posts.map(post => (
                    <article key={post.id} className="glass-panel post-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--color-navy)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #f1f5f9',
                            overflow: 'hidden', background: '#f8fafc'
                          }}>
                            <img 
                              src={post.author_profile_image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                              alt={post.author_name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ margin: 0, color: 'var(--color-navy)', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {post.author_first_name} {post.author_last_name}
                              {post.is_expert && <span style={{ color: 'var(--color-navy)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--color-yellow)', padding: '2px 8px', borderRadius: '12px' }}><CheckCircle size={12}/> Nutrition Expert</span>}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <MoreHorizontal color="var(--theme-text-muted)" style={{ cursor: 'pointer' }} />
                      </div>
                      
                      <div style={{ lineHeight: '1.6', color: 'var(--theme-text)', fontSize: '1.05rem' }}>
                        <p style={{ marginBottom: '0.8rem' }}>{post.content}</p>
                        {post.image && <img src={post.image} alt="Post media" style={{ borderRadius: '12px', width: '100%', maxHeight: '500px', objectFit: 'cover', marginTop: '12px', marginBottom: '12px' }} />}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-navy)', opacity: 0.6, fontSize: '0.85rem', borderBottom: '1px solid rgba(25,68,89,0.1)', paddingBottom: '8px', marginTop: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart color="#ef4444" fill="#ef4444" size={14} /> {post.likes_count || 0} likes</span>
                          <span>{post.comments_count || 0} comments</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', marginTop: '4px' }}>
                          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}><Heart size={18} /> Like</button>
                          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}><MessageSquare size={18} /> Comment</button>
                          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}><Share2 size={18} /> Share</button>
                          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}><Send size={18} /> Send</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right Sidebar: Trending */}
              <aside className="right-sidebar">
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--color-navy)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--color-navy)', fontFamily: 'var(--font-heading)' }}>Trending Topics</h4>
                  <div style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ textDecoration: 'none', color: 'var(--color-navy)', fontWeight: 'bold', display: 'block' }}>#HealthyLiving</a>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-navy)', opacity: 0.6 }}>34.5k posts</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ textDecoration: 'none', color: 'var(--color-navy)', fontWeight: 'bold', display: 'block' }}>#AIAnalysis</a>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-navy)', opacity: 0.6 }}>12.2k posts</span>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--color-navy)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--color-navy)', fontFamily: 'var(--font-heading)' }}>Suggested Experts</h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundImage: 'url(https://images.unsplash.com/photo-1537368910025-702850356d5a?w=100)', backgroundSize: 'cover' }}></div>
                    <div style={{ flexGrow: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-navy)', fontWeight: '600' }}>Dr. Robert</h5>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-navy)', opacity: 0.6 }}>General Medicine</p>
                    </div>
                    <button style={{ background: 'none', border: '1px solid var(--color-olive)', color: 'var(--color-olive)', borderRadius: '20px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Follow</button>
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </section>
      </main>
    </>
  );
}
