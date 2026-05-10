import os, re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"

html_files = [
    'index (3).html', 'about.html', 'auth.html', 'subscription.html',
    'home.html', 'publications.html', 'ai-tracker.html',
    'appointments.html', 'doctor-profile.html', 'profile.html'
]

# SVG Profile icon (feather-style thin stroke)
PROFILE_SVG = '''<a href="profile.html" id="nav-profile-icon" style="margin-left:14px; color:var(--theme-text,white); display:flex; align-items:center; transition:all 0.2s;" title="My Profile" onmouseover="this.style.color='#85B599'" onmouseout="this.style.color=''">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>'''

# SVG Logout icon (feather-style thin stroke)
LOGOUT_SVG = '''<a href="#" onclick="logout(); return false;" id="nav-logout-icon" style="margin-left:10px; color:#ef4444; display:flex; align-items:center; transition:all 0.2s;" title="Logout" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#ef4444'">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </a>'''

def replace_profile_icon(c):
    # Remove old FontAwesome profile icon anchor
    c = re.sub(
        r'<a href="profile\.html"[^>]*class="profile-icon"[^>]*>.*?</a>',
        PROFILE_SVG,
        c, flags=re.DOTALL
    )
    # Also handle simpler <a href="profile.html"...><i class="fas fa-user-circle"...>
    c = re.sub(
        r'<a href="profile\.html"[^>]*>\s*<i class="fas fa-user-circle[^<]*</i>\s*</a>',
        PROFILE_SVG,
        c, flags=re.DOTALL
    )
    return c

def replace_logout_icon(c):
    # Remove old FontAwesome logout anchor variations
    c = re.sub(
        r'<a href="#"[^>]*onclick="logout\(\)[^"]*"[^>]*class="logout-icon"[^>]*>.*?</a>',
        LOGOUT_SVG,
        c, flags=re.DOTALL
    )
    c = re.sub(
        r'<a href="#"[^>]*onclick="logout\(\); return false;"[^>]*class="logout-icon"[^>]*>.*?</a>',
        LOGOUT_SVG,
        c, flags=re.DOTALL
    )
    # Handle pattern where class comes after onclick
    c = re.sub(
        r'<a href="#" onclick="logout\(\); return false;" class="logout-icon"[^>]*>.*?</a>',
        LOGOUT_SVG,
        c, flags=re.DOTALL
    )
    # Handle the pattern without class attr but with logout in onclick
    c = re.sub(
        r'<a href="#"\s+onclick="logout\(\); return false;"[^>]*title="Logout"[^>]*>.*?</a>',
        LOGOUT_SVG,
        c, flags=re.DOTALL
    )
    return c

updated = 0
for fn in html_files:
    path = os.path.join(folder, fn)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    orig = c
    c = replace_profile_icon(c)
    c = replace_logout_icon(c)

    if c != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"  Updated: {fn}")
        updated += 1
    else:
        print(f"  No match found in: {fn}")

print(f"\nDone. {updated} files updated.")
