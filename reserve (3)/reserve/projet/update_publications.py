import os
import re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"
files = [
    'index (3).html', 'about.html', 'auth.html', 'subscription.html', 
    'home.html', 'publications.html', 'ai-tracker.html', 'appointments.html', 
    'doctor-profile.html', 'profile.html'
]

# 1. Global Rename Feed -> Publications
for fn in files:
    path = os.path.join(folder, fn)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        c = c.replace('>Feed<', '>Publications<')
        c = c.replace('<span>Feed</span>', '<span>Publications</span>')
        c = c.replace('>Your Feed<', '>Your Publications<')
        if fn == 'publications.html':
            c = c.replace('<title>Hygeia | Dashboard</title>', '<title>Hygeia | Publications</title>')
            c = c.replace('<title>Hygeia | Feed</title>', '<title>Hygeia | Publications</title>')
            # Fix Section Title
            c = c.replace('>Your Feed</h2>', '>Your Publications</h2>')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)

# 2. Rewrite publications.html layout specifically
pub_path = os.path.join(folder, 'publications.html')
with open(pub_path, 'r', encoding='utf-8') as f:
    c = f.read()

# Make sure CSS has dashboard-layout max-width 650px
if '.dashboard-layout { max-width: 800px;' in c:
    c = c.replace('.dashboard-layout { max-width: 800px;', '.dashboard-layout { max-width: 650px;')
else:
    c = re.sub(r'\.dashboard-layout\s*\{\s*max-width:\s*\d+px;', r'.dashboard-layout { max-width: 650px;', c)

# Rewrite Create Post Area
create_post_html = """
            <!-- Create Post Area -->
            <div class="create-post skeleton-target" style="margin-bottom: 2.5rem;">
              <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; flex-shrink: 0; box-shadow: var(--shadow-sm);"></div>
                <textarea id="new-post-content" placeholder="What's on your mind?" style="width: 100%; min-height: 60px; border: none; background: transparent; color: #194459; resize: none; font-family: var(--font-body); font-size: 1.1rem; outline: none; padding-top: 12px;"></textarea>
              </div>
              
              <!-- Image Preview Container -->
              <div id="image-preview-container" style="display: none; margin-left: 66px; margin-bottom: 15px; position: relative;">
                <img id="post-image-preview" src="" style="width: 100%; border-radius: 12px; max-height: 400px; object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <button onclick="removeImage()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center;"><i class="fas fa-times"></i></button>
              </div>

              <!-- Actions Bottom Bar -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-left: 66px; margin-top: 10px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.05);">
                <div style="color: white; font-size: 1.1rem; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; background: #85B599; box-shadow: 0 2px 8px rgba(133,181,153,0.4);" onclick="document.getElementById('post-image-upload').click();" title="Add a photo">
                  <i class="fas fa-camera"></i>
                </div>
                <input type="file" id="post-image-upload" accept="image/*" style="display: none;" onchange="previewImage(this)">
                
                <button class="btn btn-primary" onclick="publishPost()" id="publish-btn" style="padding: 0.6rem 2rem; border-radius: 30px; font-weight: bold; background: #85B599; border: none; color: white;">Post</button>
              </div>
            </div>
"""
c = re.sub(r'<!-- Create Post Area -->.*?</div>\s*</div>\s*</div>', create_post_html, c, flags=re.DOTALL)

# Replace Post 1 HTML structure (Image BEFORE Text)
post1_html = """
              <!-- Post 1 with Image -->
              <article class="post-card skeleton-target">
                <div class="post-author" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                    <div class="author-info" style="display: flex; flex-direction: column;">
                      <h4 style="margin: 0; color: #194459; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">Jane Doe <i class="fas fa-check-circle" style="color: #2D8CFF; font-size: 0.95rem;" title="Verified Expert"></i></h4>
                      <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">5 hours ago</p>
                    </div>
                  </div>
                  <i class="fas fa-ellipsis-h" style="color: #9ca3af; cursor: pointer;"></i>
                </div>
                
                <div class="post-content" style="line-height: 1.6; color: #374151; font-size: 1.05rem;">
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" class="post-image" alt="Healthy Meal" style="margin-top: 5px; margin-bottom: 12px;">
                  <p style="margin-bottom: 0.5rem;">First test of the high-protein meal recommended by my coach! The AI analysis detected exactly 450 Kcal. Loving this app! 🥗🚀 #HealthJourney</p>
                  
                  <!-- Post Interactions -->
                  <div class="post-actions" style="display: flex; gap: 15px; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1.2rem; padding-top: 0.8rem;">
                    <span class="action-icon like" onclick="toggleLike(this)"><i class="far fa-heart"></i> <span class="like-count">124</span></span>
                    <span class="action-icon" onclick="toggleComments(this)"><i class="far fa-comment"></i> <span class="comment-count">12</span></span>
                    <span class="action-icon"><i class="far fa-paper-plane"></i></span>
                  </div>

                  <!-- Hidden Comments -->
                  <div class="comments-section" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                    <div class="comments-list"></div>
                    <div style="display: flex; gap: 15px; margin-top: 15px; align-items: center;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; flex-shrink: 0;"></div>
                      <input type="text" class="comment-input" placeholder="Add a comment..." style="flex-grow: 1; padding: 1rem; border-radius: 30px; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.02); color: #194459; font-family: var(--font-body); outline: none; transition: border-color 0.3s;" onkeydown="if(event.key === 'Enter') postComment(this.nextElementSibling)">
                      <button class="btn btn-primary" onclick="postComment(this)" style="border-radius: 50%; width: 50px; height: 50px; padding: 0; flex-shrink: 0; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); background: #85B599; border:none; color: white;"><i class="fas fa-paper-plane"></i></button>
                    </div>
                  </div>
                </div>
              </article>
"""
c = re.sub(r'<!-- Post 1 with Image -->.*?</article>', post1_html, c, flags=re.DOTALL)

# Fix Javascript new post generation so image comes first
js_replace="""
              ${imageHtml}
              <p style="margin-bottom: 0.5rem; margin-top: ${currentImageBase64 ? '12px' : '0'};">${content}</p>
"""
# We must find the template literal in publishPost()
# It contains: <p style="...">${content}</p> \n ${imageHtml}
c = re.sub(r'<p[^>]*>\$\{content\}</p>\s*\$\{imageHtml\}', js_replace.strip(), c, flags=re.DOTALL)

with open(pub_path, 'w', encoding='utf-8') as f:
    f.write(c)

# 3. Synchronize Profile.html image sequence
profile_path = os.path.join(folder, 'profile.html')
if os.path.exists(profile_path):
    with open(profile_path, 'r', encoding='utf-8') as f:
        cp = f.read()

    # Replace <p>text</p> <img> with <img> <p>text</p> for Jane Doe's profile post 1
    cp = re.sub(
        r'<p style="margin-bottom: 1rem;">(First test.*?)</p>\s*<img src="(.*?)" class="post-image" alt="Healthy Meal">',
        r'<img src="\2" class="post-image" alt="Healthy Meal" style="margin-top: 5px; margin-bottom: 12px;">\n                <p style="margin-bottom: 0.5rem;">\1</p>',
        cp
    )
    with open(profile_path, 'w', encoding='utf-8') as f:
        f.write(cp)

print("Update completed successfully.")
