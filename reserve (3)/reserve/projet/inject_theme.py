import os, re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"

html_files = [
    'index (3).html', 'about.html', 'auth.html', 'subscription.html',
    'home.html', 'publications.html', 'ai-tracker.html',
    'appointments.html', 'doctor-profile.html', 'profile.html'
]

THEME_SCRIPT = '    <script src="./theme.js"></script>\n'

for fn in html_files:
    path = os.path.join(folder, fn)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. Inject theme.js ONCE at the very start of <head> (after <head> tag)
    if 'theme.js' not in c:
        c = c.replace('<head>', '<head>\n' + THEME_SCRIPT.rstrip(), 1)

    # 2. Ensure the toggle button has the right ID (already id="theme-toggle" in most)
    #    If a page has no toggle button at all, we skip that page gracefully.

    # 3. Light mode nav links — ensure these nav links get the right class to inherit theme text
    # Nothing needed here since CSS handles it globally via [data-theme="light"] .navbar

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

print(f"theme.js injected into {len(html_files)} pages.")

# Additionally patch ai-tracker step cards to use CSS variables for step icon ring color
ai_path = os.path.join(folder, 'ai-tracker.html')
with open(ai_path, 'r', encoding='utf-8') as f:
    c = f.read()

# Make step-icon use CSS variable for border and color
c = c.replace(
    '.step-icon { width: 70px; height: 70px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: white; margin: 0 auto 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.15); background: rgba(255,255,255,0.05); transition: background 0.3s; }',
    '.step-icon { width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--theme-step-circle-color, #ffffff); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--theme-step-circle-color, #ffffff); margin: 0 auto 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.15); background: var(--theme-step-circle-bg, rgba(255,255,255,0.05)); transition: background 0.3s; }'
)

with open(ai_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("AI Tracker step icons now use CSS theme variables.")
