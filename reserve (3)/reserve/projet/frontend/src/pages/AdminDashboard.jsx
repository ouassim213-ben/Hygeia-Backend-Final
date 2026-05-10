import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, UserMinus, Check, Trash2, Users, FileText, AlertCircle, GraduationCap, MessageSquare, Send } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('posts');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingNutritionists, setPendingNutritionists] = useState([]);
  const [supportQueries, setSupportQueries] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isSuperuser = localStorage.getItem('is_superuser') === 'true';

  const navy = '#194459';
  const gold = '#f0c27b';

  useEffect(() => {
    if (!isSuperuser) {
      navigate('/home');
      return;
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isSuperuser) {
      if (activeTab === 'messages') {
        fetchSupportInbox();
        const interval = setInterval(fetchSupportInbox, 5000); // Live sync every 5s
        return () => clearInterval(interval);
      } else {
        fetchData();
      }
    }
  }, [activeTab]);

  const fetchSupportInbox = async () => {
    try {
      const res = await api.get('admin/support-inbox/');
      setSupportQueries(res.data);
    } catch (e) {
      console.error("Error fetching support queue:", e);
    }
  };

  const handleSendQueueReply = async (receiverId) => {
    const content = replyInputs[receiverId];
    if (!content?.trim()) return;

    try {
      // Point 3: Smart Routing (Sender=Me, Receiver=User)
      await api.post('messages/', {
        content: content,
        receiver: receiverId
      });
      
      // Clear input and refresh
      setReplyInputs({ ...replyInputs, [receiverId]: '' });
      fetchSupportInbox();
      alert("Reply sent successfully!");
    } catch (e) {
      console.error("Error sending queue reply:", e);
      alert("Failed to send reply.");
    }
  };

  const fetchInitialData = async () => {
    try {
      const [postsRes, usersRes, nutriRes, supportRes] = await Promise.all([
        api.get('admin/pending-posts/'),
        api.get('admin/users/'),
        api.get('admin/pending-nutritionists/'),
        api.get('admin/support-inbox/')
      ]);
      setPendingPosts(postsRes.data);
      setUsers(usersRes.data);
      setPendingNutritionists(nutriRes.data);
      setSupportQueries(supportRes.data);
    } catch (e) {
      console.error("Error fetching initial admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    // Keep this for refreshing a single tab if needed, 
    // but fetchInitialData handles the starting state.
    try {
      if (activeTab === 'posts') {
        const res = await api.get('admin/pending-posts/');
        setPendingPosts(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('admin/users/');
        setUsers(res.data);
      } else if (activeTab === 'nutritionists') {
        const res = await api.get('admin/pending-nutritionists/');
        setPendingNutritionists(res.data);
      } else if (activeTab === 'messages') {
        fetchConversations();
      }
    } catch (e) {
      console.error("Error refreshing admin tab:", e);
    }
  };

  const handleValidatePost = async (id) => {
    try {
      await api.post(`admin/validate-post/${id}/`);
      setPendingPosts(pendingPosts.filter(p => p.id !== id));
    } catch (e) {
      alert("Failed to validate post.");
    }
  };

  const handleApproveNutritionist = async (id) => {
    try {
      await api.post(`admin/approve-nutritionist/${id}/`);
      setPendingNutritionists(pendingNutritionists.filter(n => n.id !== id));
      alert("Nutritionist approved successfully!");
    } catch (e) {
      alert("Failed to approve nutritionist.");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`admin/validate-post/${id}/`);
      setPendingPosts(pendingPosts.filter(p => p.id !== id));
    } catch (e) {
      alert("Failed to delete post.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action is permanent!")) return;
    try {
      await api.delete(`admin/users/${id}/delete/`);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  if (!isSuperuser) return null;

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '100px' }}>
        <div className="container animate-fade">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem', padding: '2rem', backgroundColor: navy, borderRadius: '20px', color: 'white' }}>
            <h1 className="section-title" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px', color: gold, margin: 0, fontFamily: 'serif' }}>
              <ShieldCheck size={40} /> Admin Console
            </h1>
            <p style={{ opacity: 0.8, marginTop: '10px' }}>Community management and professional approvals.</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '30px', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setActiveTab('posts')}
              style={{ background: 'none', border: 'none', color: activeTab === 'posts' ? navy : '#64748b', fontSize: '1.1rem', fontWeight: activeTab === 'posts' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'posts' ? `3px solid ${gold}` : 'none', paddingBottom: '1rem', marginBottom: '-1.1rem' }}
            >
              <FileText size={20} /> Pending Posts ({pendingPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab('nutritionists')}
              style={{ background: 'none', border: 'none', color: activeTab === 'nutritionists' ? navy : '#64748b', fontSize: '1.1rem', fontWeight: activeTab === 'nutritionists' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'nutritionists' ? `3px solid ${gold}` : 'none', paddingBottom: '1rem', marginBottom: '-1.1rem' }}
            >
              <GraduationCap size={20} /> Nutritionist Requests ({pendingNutritionists.length})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ background: 'none', border: 'none', color: activeTab === 'users' ? navy : '#64748b', fontSize: '1.1rem', fontWeight: activeTab === 'users' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'users' ? `3px solid ${gold}` : 'none', paddingBottom: '1rem', marginBottom: '-1.1rem' }}
            >
              <Users size={20} /> User Management ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              style={{ background: 'none', border: 'none', color: activeTab === 'messages' ? navy : '#64748b', fontSize: '1.1rem', fontWeight: activeTab === 'messages' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'messages' ? `3px solid ${gold}` : 'none', paddingBottom: '1rem', marginBottom: '-1.1rem' }}
            >
              <MessageSquare size={20} /> Messages ({supportQueries.length})
            </button>
          </div>

          {loading ? (
            <div style={{ color: navy, textAlign: 'center', padding: '3rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Fetching Data...</div>
          ) : (
            <div className="dashboard-content">
              {activeTab === 'posts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {pendingPosts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#64748b', backgroundColor: 'white', borderRadius: '20px' }}>
                      <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p>No pending posts to moderate.</p>
                    </div>
                  ) : (
                    pendingPosts.map(post => (
                      <div key={post.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: navy, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {post.author_name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, color: navy }}>{post.author_name}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(post.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <p style={{ color: '#1e293b', lineHeight: '1.5' }}>{post.content}</p>
                        {post.image && <img src={post.image} style={{ width: '100%', borderRadius: '15px', maxHeight: '200px', objectFit: 'cover' }} alt="Pending" />}
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px' }}>
                          <button 
                            onClick={() => handleValidatePost(post.id)}
                            style={{ flex: 1, backgroundColor: navy, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' }}
                          >
                            <Check size={18} /> Approve
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                          >
                            <Trash2 size={18} /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'nutritionists' && (
                <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: navy, color: gold }}>
                        <th style={{ padding: '1.5rem' }}>Name</th>
                        <th style={{ padding: '1.5rem' }}>Specialty</th>
                        <th style={{ padding: '1.5rem' }}>Bio</th>
                        <th style={{ padding: '1.5rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingNutritionists.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No pending nutritionist requests.</td>
                        </tr>
                      ) : (
                        pendingNutritionists.map(nutri => (
                          <tr key={nutri.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '1.5rem' }}>
                              <div style={{ fontWeight: 'bold', color: navy }}>{nutri.first_name} {nutri.last_name}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{nutri.email}</div>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                              <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                {nutri.profile?.specialty_type || 'General'}
                              </span>
                            </td>
                            <td style={{ padding: '1.5rem', maxWidth: '300px' }}>
                              <p style={{ fontSize: '0.9rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={nutri.profile?.bio}>
                                {nutri.profile?.bio || 'No bio provided'}
                              </p>
                            </td>
                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                              <button 
                                onClick={() => handleApproveNutritionist(nutri.id)}
                                style={{ backgroundColor: gold, color: navy, border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(240, 194, 123, 0.3)' }}
                              >
                                Approve
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'users' && (
                <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: navy, color: gold }}>
                        <th style={{ padding: '1.5rem' }}>ID</th>
                        <th style={{ padding: '1.5rem' }}>Full Name</th>
                        <th style={{ padding: '1.5rem' }}>Email</th>
                        <th style={{ padding: '1.5rem' }}>Role</th>
                        <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '1.5rem', color: '#64748b' }}>#{user.id}</td>
                          <td style={{ padding: '1.5rem', fontWeight: 'bold', color: navy }}>{user.first_name} {user.last_name}</td>
                          <td style={{ padding: '1.5rem', color: '#475569' }}>{user.email}</td>
                          <td style={{ padding: '1.5rem' }}>
                            {user.is_superuser ? (
                              <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>Admin</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                                {user.profile?.role || 'Member'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                            {!user.is_superuser && (
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                                title="Delete User"
                              >
                                <UserMinus size={20} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'messages' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: navy, margin: 0 }}>Patient Support Queue</h2>
                    <button 
                      onClick={fetchSupportInbox}
                      style={{ backgroundColor: 'white', border: `1px solid ${navy}`, color: navy, padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Refresh Queue
                    </button>
                  </header>

                  {supportQueries.length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '4rem', textAlign: 'center', color: '#64748b', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                      <Check size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p>All queries answered! Your inbox is clear.</p>
                    </div>
                  ) : (
                    supportQueries.map(query => (
                      <div key={query.id} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: navy, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                              {query.sender_image ? <img src={query.sender_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : query.sender_name.charAt(0)}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, color: navy }}>{query.sender_name}</h4>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(query.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          {!query.is_read && <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>New Activity</span>}
                        </div>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.6' }}>{query.content}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                          <input 
                            type="text" 
                            placeholder={`Reply to ${query.sender_name}...`}
                            value={replyInputs[query.sender] || ''}
                            onChange={(e) => setReplyInputs({ ...replyInputs, [query.sender]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendQueueReply(query.sender)}
                            style={{ flex: 1, padding: '12px 18px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', transition: 'all 0.2s' }}
                          />
                          <button 
                            onClick={() => handleSendQueueReply(query.sender)}
                            disabled={!replyInputs[query.sender]?.trim()}
                            style={{ 
                              backgroundColor: navy, color: 'white', border: 'none', padding: '12px 24px', 
                              borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', 
                              display: 'flex', alignItems: 'center', gap: '8px',
                              opacity: replyInputs[query.sender]?.trim() ? 1 : 0.5 
                            }}
                          >
                            <Send size={18} /> Send Reply
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
