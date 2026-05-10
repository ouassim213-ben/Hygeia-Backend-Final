import os
import re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"

files = ['publications.html', 'ai-tracker.html', 'appointments.html', 'profile.html', 'doctor-profile.html']

nav_html = """    <nav class="navbar" id="navbar">
      <a href="home.html" class="nav-brand">Hygeia</a>
      <div class="nav-links">
        <a href="{home_class}" class="nav-link">Accueil</a>
        <a href="publications.html" class="nav-link">Publications</a>
        <a href="ai-tracker.html" class="nav-link">AI Tracker</a>
        <a href="appointments.html" class="nav-link">Rendez-vous</a>
        <button id="theme-toggle" class="btn btn-outline" style="border: none; font-size: 1.2rem; padding: 0.5rem;" aria-label="Toggle Dark Mode">
          <i class="fas fa-moon"></i>
        </button>
        <a href="profile.html" class="profile-icon" style="margin-left: 10px; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-secondary), var(--color-accent)); color: white; text-decoration: none; box-shadow: var(--shadow-sm); border: 2px solid var(--color-secondary);"><i class="fas fa-user-circle" style="font-size: 1.5rem;"></i></a>
        <a href="#" onclick="logout(); return false;" class="logout-icon" style="margin-left: 15px; color: #ef4444; font-size: 1.4rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='none'" title="Déconnexion"><i class="fas fa-sign-out-alt"></i></a>
      </div>
    </nav>"""

for fn in files:
    path = os.path.join(folder, fn)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # We strip mobile active classes specifically to avoid messing up
    html = nav_html.replace('{home_class}', 'home.html')
    
    # Set active highlight dynamically if applicable
    if fn == 'publications.html':
        html = html.replace('href="publications.html" class="nav-link"', 'href="publications.html" class="nav-link" style="color: var(--color-highlight);"')
    elif fn == 'appointments.html' or fn == 'doctor-profile.html':
        html = html.replace('href="appointments.html" class="nav-link"', 'href="appointments.html" class="nav-link" style="color: var(--color-highlight);"')
    elif fn == 'ai-tracker.html':
        html = html.replace('href="ai-tracker.html" class="nav-link"', 'href="ai-tracker.html" class="nav-link" style="color: var(--color-highlight);"')
        
    c = re.sub(r'<nav class="navbar" id="navbar">.*?</nav>', html, c, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

# also update subscription.html and auth.html
sub_path = os.path.join(folder, 'subscription.html')
if os.path.exists(sub_path):
    with open(sub_path, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("dashboard.html", "home.html")
    with open(sub_path, 'w', encoding='utf-8') as f:
        f.write(c)

auth_path = os.path.join(folder, 'auth.html')
if os.path.exists(auth_path):
    with open(auth_path, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("dashboard.html", "home.html")  # Just in case
    with open(auth_path, 'w', encoding='utf-8') as f:
        f.write(c)

print("Patching complete!")
