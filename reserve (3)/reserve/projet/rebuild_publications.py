import os
import re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"
pub_path = os.path.join(folder, 'publications.html')

with open(pub_path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update Post Card and Create Post CSS
new_css = """
     /* Professional Glassmorphism & Thin Borders for Posts */
     .post-card { 
       background: rgba(255, 255, 255, 0.9) !important;
       backdrop-filter: blur(15px) !important;
       -webkit-backdrop-filter: blur(15px) !important;
       border: 1px solid rgba(255, 255, 255, 0.8) !important; 
       border-radius: 16px !important;
       padding: 1.5rem !important; 
       margin-bottom: 2rem !important; 
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
       transition: transform 0.3s ease, box-shadow 0.3s ease;
     }
     .post-card:hover { border-color: rgba(133, 181, 153, 0.3) !important; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important; transform: translateY(-2px); }

     .post-image { border-radius: 12px; width: 100%; max-height: 500px; object-fit: cover; margin-top: 15px; margin-bottom: 10px; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

     /* Action Icons Hover FX */
     .action-icon { display: flex; align-items: center; gap: 8px; color: #4b5563; cursor: pointer; transition: all 0.2s; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.95rem; }
     .action-icon:hover { background: rgba(0,0,0,0.05); color: #194459; }
     .action-icon.like:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

     .create-post { background: rgba(255,255,255,0.95) !important; border-radius: 16px !important; padding: 1.5rem !important; box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important; border: 1px solid rgba(255,255,255,1) !important; }
"""

c = re.sub(r'/\* Professional Glassmorphism.*?\.action-icon\.like:hover.*?\}', new_css, c, flags=re.DOTALL)

# 2. Update Create Post Area
create_post_html = """
            <!-- Create Post Area -->
            <div class="create-post skeleton-target" style="margin-bottom: 2.5rem;">
              <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; flex-shrink: 0; box-shadow: var(--shadow-sm);"></div>
                <textarea id="new-post-content" placeholder="Quoi de neuf aujourd'hui ?" style="width: 100%; min-height: 60px; border: none; background: transparent; color: #194459; resize: none; font-family: var(--font-body); font-size: 1.1rem; outline: none; padding-top: 12px;"></textarea>
              </div>
              
              <!-- Image Preview Container -->
              <div id="image-preview-container" style="display: none; margin-left: 66px; margin-bottom: 15px; position: relative;">
                <img id="post-image-preview" src="" style="width: 100%; border-radius: 12px; max-height: 400px; object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <button onclick="removeImage()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center;"><i class="fas fa-times"></i></button>
              </div>

              <!-- Actions Bottom Bar -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-left: 66px; margin-top: 10px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.05);">
                <div style="color: #4b5563; font-size: 1.4rem; cursor: pointer; padding: 10px; border-radius: 50%; transition: all 0.2s; background: rgba(0,0,0,0.03);" onclick="document.getElementById('post-image-upload').click();" class="hover-circle" title="Ajouter une photo">
                  <i class="fas fa-camera"></i>
                </div>
                <input type="file" id="post-image-upload" accept="image/*" style="display: none;" onchange="previewImage(this)">
                
                <button class="btn btn-primary" onclick="publishPost()" id="publish-btn" style="padding: 0.6rem 2rem; border-radius: 30px; font-weight: bold; background: #85B599; border: none; color: white;">Publier</button>
              </div>
            </div>
"""

c = re.sub(r'<!-- Create Post Area.*?</div>\s*</div>\s*</div>', create_post_html, c, flags=re.DOTALL)

# 3. Update Post 1
post1_html = """
              <!-- Post 1 with Image -->
              <article class="post-card skeleton-target">
                <div class="post-author" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                    <div class="author-info" style="display: flex; flex-direction: column;">
                      <h4 style="margin: 0; color: #194459; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">Jane Doe <i class="fas fa-check-circle" style="color: #2D8CFF; font-size: 0.95rem;" title="Vérifié"></i></h4>
                      <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">Il y a 5 heures</p>
                    </div>
                  </div>
                  <i class="fas fa-ellipsis-h" style="color: #9ca3af; cursor: pointer;"></i>
                </div>
                
                <div class="post-content" style="line-height: 1.6; color: #374151; font-size: 1.05rem;">
                  <p style="margin-bottom: 1rem;">Premier test du repas riche en protéines recommandé par mon coach ! L'analyse par l'IA a détecté exactement 450 Kcal. J'adore cette appli ! 🥗🚀 #HealthJourney</p>
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" class="post-image" alt="Healthy Meal">
                  
                  <!-- Post Interactions -->
                  <div class="post-actions" style="display: flex; gap: 10px; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1.2rem; padding-top: 0.8rem;">
                    <span class="action-icon like" onclick="toggleLike(this)"><i class="far fa-heart"></i> <span class="like-count">124</span></span>
                    <span class="action-icon" onclick="toggleComments(this)"><i class="far fa-comment"></i> <span class="comment-count">12</span></span>
                    <span class="action-icon"><i class="far fa-paper-plane"></i> Partager</span>
                  </div>

                  <!-- Hidden Comments -->
                  <div class="comments-section" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                    <div class="comments-list"></div>
                    <div style="display: flex; gap: 15px; margin-top: 15px; align-items: center;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; flex-shrink: 0;"></div>
                      <input type="text" class="comment-input" placeholder="Ajouter un commentaire..." style="flex-grow: 1; padding: 1rem; border-radius: 30px; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.02); color: #194459; font-family: var(--font-body); outline: none; transition: border-color 0.3s;" onkeydown="if(event.key === 'Enter') postComment(this.nextElementSibling)">
                      <button class="btn btn-primary" onclick="postComment(this)" style="border-radius: 50%; width: 50px; height: 50px; padding: 0; flex-shrink: 0; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); background: #85B599; border:none; color: white;"><i class="fas fa-paper-plane"></i></button>
                    </div>
                  </div>
                </div>
              </article>
"""

c = re.sub(r'<!-- Post 1 with Image -->.*?</article>', post1_html, c, flags=re.DOTALL)


# 4. Update Post 2
post2_html = """
              <!-- Post 2 Without Image (Expert) -->
              <article class="post-card skeleton-target">
                <div class="post-author" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'); background-size: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                    <div class="author-info" style="display: flex; flex-direction: column;">
                      <h4 style="margin: 0; color: #194459; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">Dr. Sarah Jenkins <i class="fas fa-check-circle" style="color: #2D8CFF; font-size: 0.95rem;" title="Expert Vérifié"></i></h4>
                      <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">Nutritionniste • Il y a 12 heures</p>
                    </div>
                  </div>
                  <i class="fas fa-ellipsis-h" style="color: #9ca3af; cursor: pointer;"></i>
                </div>
                
                <div class="post-content" style="line-height: 1.6; color: #374151; font-size: 1.05rem;">
                  <p style="margin-bottom: 1rem;">Un rappel essentiel : les pics de cortisol sont plus élevés le matin. Casser votre jeûne avec des glucides rapides peut provoquer une chute brutale d'insuline peu de temps après. Optez toujours pour une source de protéines et de bonnes graisses en premier ! 🥑🍳</p>
                  
                  <!-- Post Interactions -->
                  <div class="post-actions" style="display: flex; gap: 10px; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1.2rem; padding-top: 0.8rem;">
                    <span class="action-icon like" style="color: #ef4444;" onclick="toggleLike(this)"><i class="fas fa-heart"></i> <span class="like-count">342</span></span>
                    <span class="action-icon" onclick="toggleComments(this)"><i class="far fa-comment"></i> <span class="comment-count">45</span></span>
                    <span class="action-icon"><i class="far fa-paper-plane"></i> Partager</span>
                  </div>

                  <!-- Hidden Comments -->
                  <div class="comments-section" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                    <div class="comments-list"></div>
                    <div style="display: flex; gap: 15px; margin-top: 15px; align-items: center;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'); background-size: cover; flex-shrink: 0;"></div>
                      <input type="text" class="comment-input" placeholder="Ajouter un commentaire..." style="flex-grow: 1; padding: 1rem; border-radius: 30px; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.02); color: #194459; font-family: var(--font-body); outline: none; transition: border-color 0.3s;" onkeydown="if(event.key === 'Enter') postComment(this.nextElementSibling)">
                      <button class="btn btn-primary" onclick="postComment(this)" style="border-radius: 50%; width: 50px; height: 50px; padding: 0; flex-shrink: 0; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); background: #85B599; border:none; color: white;"><i class="fas fa-paper-plane"></i></button>
                    </div>
                  </div>
                </div>
              </article>
"""

c = re.sub(r'<!-- Post 2 Without Image \(Expert\).*?</article>', post2_html, c, flags=re.DOTALL)

with open(pub_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Publications feed fully overhauled!")
