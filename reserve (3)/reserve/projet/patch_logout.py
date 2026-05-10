import os
import re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"

# 1. Patch app.js
app_js_path = os.path.join(folder, 'app.js')
with open(app_js_path, 'r', encoding='utf-8') as f:
    app_js_txt = f.read()

logout_func = """

/* --- 7. Global Logout Function --- */
window.logout = function() {
    localStorage.removeItem('isPremium');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(25,68,89,0.95); color:white; padding:15px 30px; border-radius:30px; z-index:9999; backdrop-filter:blur(10px); box-shadow:0 10px 30px rgba(0,0,0,0.3); font-weight:bold; font-family:var(--font-heading, sans-serif); border:1px solid rgba(133,181,153,0.3); display:flex; align-items:center; gap:10px; transition: opacity 0.5s;';
    toast.innerHTML = '<i class="fas fa-sign-out-alt" style="color:#ef4444; font-size:1.2rem;"></i> Déconnexion réussie. À bientôt !';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'index (3).html';
        }, 500);
    }, 1000);
};
"""
if "window.logout = function" not in app_js_txt:
    with open(app_js_path, 'a', encoding='utf-8') as f:
        f.write(logout_func)

# 2. Patch HTML files
premium_files = ['dashboard.html', 'profile.html', 'appointments.html', 'ai-tracker.html', 'doctor-profile.html']
logout_btn = r'\1\n        <a href="#" onclick="logout(); return false;" class="logout-icon" style="margin-left: 15px; color: #ef4444; font-size: 1.4rem; transition: transform 0.2s;" onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'none\'" title="Déconnexion"><i class="fas fa-sign-out-alt"></i></a>'
head_script = r"\n    <script>if(!localStorage.getItem('isPremium')){ window.location.href='auth.html'; }</script>\n  </head>"

for fn in premium_files:
    path = os.path.join(folder, fn)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    if "isPremium" not in c.split("</head>")[0]:
        c = re.sub(r'</head>', head_script, c, count=1)
        
    if "logout()" not in c:
        c = re.sub(r'(<a href="profile\.html" class="profile-icon".*?</a>)', logout_btn, c)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

# 3. auth.html patch
auth_path = os.path.join(folder, 'auth.html')
if os.path.exists(auth_path):
    with open(auth_path, 'r', encoding='utf-8') as f:
        c = f.read()
    if "setItem('isLoggedIn'" not in c:
        c = c.replace("window.location.href='subscription.html';", "localStorage.setItem('isLoggedIn', 'true'); window.location.href='subscription.html';")
    with open(auth_path, 'w', encoding='utf-8') as f:
        f.write(c)

print("All patched!")
