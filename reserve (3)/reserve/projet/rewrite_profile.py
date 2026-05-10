import os

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"
path = os.path.join(folder, 'profile.html')

html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hygeia | Profile</title>
    <!-- FontAwesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   <link rel="stylesheet" href="./style (2).css">
   <style>
     /* Mobile App Bottom Nav Styles */
     .mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(25, 68, 89, 0.95); backdrop-filter: blur(20px); z-index: 2000; border-top: 1px solid rgba(255,255,255,0.08); }
     .mobile-nav-items { display: flex; justify-content: space-around; padding: 0.8rem 0; }
     .mobile-nav-item { color: rgba(255,255,255,0.6); display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.75rem; transition: var(--transition-fast); text-decoration: none;}
     .mobile-nav-item i { font-size: 1.3rem; }
     .mobile-nav-item.active, .mobile-nav-item:hover { color: var(--color-highlight); }
     @media (max-width: 768px) { .mobile-bottom-nav { display: block; } body { padding-bottom: 70px; } }

     /* Light Glass Style Global for Profile */
     .glass-container { max-width: 1000px; margin: 0 auto; padding: 0 1rem; }
     
     .profile-glass-card {
       background: rgba(255, 255, 255, 0.9) !important;
       backdrop-filter: blur(15px);
       border: 1px solid rgba(255, 255, 255, 0.8);
       border-radius: var(--radius-lg);
       padding: 2rem;
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
       margin-bottom: 2.5rem;
       color: #194459;
     }

     /* Profile Header */
     .profile-header { display: flex; gap: 2.5rem; align-items: center; }
     .profile-avatar { width: 130px; height: 130px; border-radius: 50%; background-size: cover; background-position: center; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.15); flex-shrink: 0; }
     .profile-info h1 { margin: 0 0 8px; font-size: 2.2rem; font-weight: bold; color: #194459; }
     .status-badge { display: inline-block; background: linear-gradient(135deg, var(--color-secondary), var(--color-accent)); color: white; padding: 5px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-bottom: 12px; }
     .profile-info p { color: #4b5563; font-size: 1.05rem; line-height: 1.5; margin-bottom: 18px; max-width: 550px; }
     
     @media (max-width: 600px) { .profile-header { flex-direction: column; text-align: center; } }

     /* Stats Grid */
     .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
     .stat-block { padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); background: rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s; }
     .stat-block:hover { transform: translateY(-4px); box-shadow: 0 5px 15px rgba(0,0,0,0.06); background: rgba(255,255,255,0.9); }
     .stat-icon { width: 55px; height: 55px; border-radius: 50%; background: #85B599; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 15px; box-shadow: var(--shadow-sm); }
     .stat-title { font-size: 0.95rem; font-weight: bold; color: #4b5563; margin-bottom: 5px; }
     .stat-value { font-size: 1.4rem; font-weight: bold; color: #194459; }
     .stat-sub { font-size: 0.85rem; color: #6b7280; margin-top: 4px; }

     /* Feed Style (From Publications) */
     .post-card { background: rgba(255, 255, 255, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.8) !important; border-radius: 16px !important; padding: 1.5rem !important; margin-bottom: 2rem !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important; transition: transform 0.3s; }
     .post-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important; border-color: rgba(133,181,153,0.3) !important; }
     .post-image { border-radius: 12px; width: 100%; max-height: 400px; object-fit: cover; margin-top: 15px; margin-bottom: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
     .action-icon { display: flex; align-items: center; gap: 8px; color: #4b5563; cursor: pointer; transition: all 0.2s; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.95rem; }
     .action-icon:hover { background: rgba(0,0,0,0.05); color: #194459; }
   </style>
   <script>if(!localStorage.getItem('isPremium')){ window.location.href='auth.html'; }</script>
  </head>
  <body>
    <!-- Navbar -->
    <nav class="navbar" id="navbar">
      <a href="home.html" class="nav-brand">Hygeia</a>
      <div class="nav-links">
        <a href="home.html" class="nav-link">Home</a>
        <a href="publications.html" class="nav-link">Feed</a>
        <a href="ai-tracker.html" class="nav-link">AI Tracker</a>
        <a href="appointments.html" class="nav-link">Appointments</a>
        <button id="theme-toggle" class="btn btn-outline" style="border: none; font-size: 1.2rem; padding: 0.5rem;" aria-label="Toggle Dark Mode">
          <i class="fas fa-moon"></i>
        </button>
        <a href="profile.html" class="profile-icon" style="margin-left: 10px; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-secondary), var(--color-accent)); color: white; text-decoration: none; box-shadow: var(--shadow-sm); border: 2px solid var(--color-secondary);"><i class="fas fa-user-circle" style="font-size: 1.5rem;"></i></a>
        <a href="#" onclick="logout(); return false;" class="logout-icon" style="margin-left: 15px; color: #ef4444; font-size: 1.4rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='none'" title="Logout"><i class="fas fa-sign-out-alt"></i></a>
      </div>
    </nav>

    <main>
      <section class="section" style="padding-top: 130px; background-color: var(--color-bg-light); min-height: 100vh;">
        <div class="glass-container animate-fade p-0">
          
          <!-- 1. Profile Header -->
          <div class="profile-glass-card profile-header">
            <div class="profile-avatar" style="background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400');"></div>
            <div class="profile-info">
              <h1>Jane Doe</h1>
              <div class="status-badge"><i class="fas fa-star" style="margin-right:5px;"></i> Premium Member</div>
              <p>Wellness enthusiast. Focusing on hitting my protein goals and managing energy levels throughout the day with the Premium Plan.</p>
              <button class="btn btn-outline" style="border-radius: 20px; font-weight: bold; border-color: rgba(133,181,153,0.5); color: #194459; padding: 0.6rem 1.5rem;"><i class="fas fa-pen" style="margin-right: 8px;"></i> Edit Profile</button>
            </div>
          </div>

          <!-- 2. Your Stats -->
          <h2 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 1.5rem; font-weight: bold;"><i class="fas fa-chart-line" style="color: var(--color-secondary); margin-right: 10px;"></i> Your Stats</h2>
          <div class="profile-glass-card stats-grid">
            
            <div class="stat-block">
              <div class="stat-icon"><i class="fas fa-weight"></i></div>
              <div class="stat-title">Weight Tracking</div>
              <div class="stat-value">75 kg</div>
              <div class="stat-sub" style="color: #85B599; font-weight: bold;"><i class="fas fa-arrow-down"></i> -2 kg this month</div>
            </div>

            <div class="stat-block">
              <div class="stat-icon" style="background: #ffffff; color: #85B599; border: 2px solid #85B599;"><i class="fas fa-utensils"></i></div>
              <div class="stat-title">Meal Analyses</div>
              <div class="stat-value">120</div>
              <div class="stat-sub">meals analyzed</div>
            </div>

            <div class="stat-block">
              <div class="stat-icon"><i class="far fa-calendar-check"></i></div>
              <div class="stat-title">Upcoming Appointments</div>
              <div class="stat-value">3</div>
              <div class="stat-sub">Zoom calls</div>
            </div>

            <div class="stat-block">
              <div class="stat-icon" style="background: #ffffff; color: #85B599; border: 2px solid #85B599;"><i class="fas fa-heartbeat"></i></div>
              <div class="stat-title">Health Score</div>
              <div class="stat-value" style="color: #85B599;">8.5 / 10</div>
              <div class="stat-sub">excellent vitality</div>
            </div>

          </div>

          <!-- 3. Your Latest Posts (Activity Feed) -->
          <h2 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 1.5rem; font-weight: bold; margin-top: 3.5rem;"><i class="fas fa-history" style="color: var(--color-secondary); margin-right: 10px;"></i> Your Latest Posts</h2>
          <div style="max-width: 850px; margin: 0 auto;">
            
            <!-- Feed Post 1 -->
            <article class="post-card">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="width: 45px; height: 45px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                  <div style="display: flex; flex-direction: column;">
                    <h4 style="margin: 0; color: #194459; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">Jane Doe <i class="fas fa-check-circle" style="color: #2D8CFF; font-size: 0.95rem;" title="Verified"></i></h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">5 hours ago</p>
                  </div>
                </div>
                <i class="fas fa-ellipsis-h" style="color: #9ca3af; cursor: pointer;"></i>
              </div>
              
              <div style="line-height: 1.6; color: #374151; font-size: 1.05rem;">
                <p style="margin-bottom: 1rem;">First test of the high-protein meal recommended by my coach! The AI analysis detected exactly 450 Kcal. Loving this app! 🥗🚀 #HealthJourney</p>
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" class="post-image" alt="Healthy Meal">
                
                <div style="display: flex; gap: 10px; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1.2rem; padding-top: 0.8rem;">
                  <span class="action-icon"><i class="far fa-heart"></i> 124</span>
                  <span class="action-icon"><i class="far fa-comment"></i> 12</span>
                  <span class="action-icon"><i class="far fa-paper-plane"></i> Share</span>
                </div>
              </div>
            </article>

            <!-- Feed Post 2 -->
            <article class="post-card">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="width: 45px; height: 45px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                  <div style="display: flex; flex-direction: column;">
                    <h4 style="margin: 0; color: #194459; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">Jane Doe <i class="fas fa-check-circle" style="color: #2D8CFF; font-size: 0.95rem;" title="Verified"></i></h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">Yesterday</p>
                  </div>
                </div>
                <i class="fas fa-ellipsis-h" style="color: #9ca3af; cursor: pointer;"></i>
              </div>
              
              <div style="line-height: 1.6; color: #374151; font-size: 1.05rem;">
                <p style="margin-bottom: 1rem;">Just booked my monthly check-in with Dr. Jenkins. So convenient to do it via Zoom without leaving the house! 💻✨</p>
                <div style="display: flex; gap: 10px; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1.2rem; padding-top: 0.8rem;">
                  <span class="action-icon" style="color: #ef4444;"><i class="fas fa-heart"></i> 85</span>
                  <span class="action-icon"><i class="far fa-comment"></i> 4</span>
                  <span class="action-icon"><i class="far fa-paper-plane"></i> Share</span>
                </div>
              </div>
            </article>

          </div>

        </div>
      </section>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="mobile-bottom-nav">
      <div class="mobile-nav-items">
        <a href="home.html" class="mobile-nav-item"><i class="fas fa-home"></i><span>Home</span></a>
        <a href="publications.html" class="mobile-nav-item"><i class="far fa-newspaper"></i><span>Feed</span></a>
        <a href="appointments.html" class="mobile-nav-item"><i class="far fa-calendar-alt"></i><span>Appointments</span></a>
        <a href="profile.html" class="mobile-nav-item active"><i class="far fa-user-circle"></i><span>Profile</span></a>
      </div>
    </nav>

    <script src="app.js"></script>
    <script type="module" src="/main.js"></script>
  </body>
</html>"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Profile rewrite complete.")
