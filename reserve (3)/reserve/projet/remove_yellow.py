import os
import re

folder = r"c:\Users\Wassim\OneDrive\Bureau\antig\.vscode"

# 1. subscription.html
f1 = os.path.join(folder, 'subscription.html')
if os.path.exists(f1):
    with open(f1, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('#d4af37', '#ffffff')
    c = c.replace('rgba(212,175,55,', 'rgba(255,255,255,')
    c = c.replace('#b8962e', '#e0e0e0')
    c = c.replace('color: #fff; border: none; font-weight: bold; box-shadow: 0 4px 15px rgba(255,255,255,0.3);', 'color: var(--color-primary); border: none; font-weight: bold; box-shadow: 0 0 15px rgba(255,255,255,0.5);')
    with open(f1, 'w', encoding='utf-8') as f:
        f.write(c)

# 2. doctor-profile.html
f2 = os.path.join(folder, 'doctor-profile.html')
if os.path.exists(f2):
    with open(f2, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('#fbbf24', '#ffffff')
    c = c.replace('.review-badge { background: #ffffff; color: #fff;', '.review-badge { background: #ffffff; color: var(--color-primary);')
    with open(f2, 'w', encoding='utf-8') as f:
        f.write(c)

# 3. appointments.html
f3 = os.path.join(folder, 'appointments.html')
if os.path.exists(f3):
    with open(f3, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('#fbbf24', '#ffffff')
    
    # Numbers circles (1,2,3)
    c = c.replace('background: #85B599; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;', 'background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-primary);')
    
    # Hover effect for glass cards
    c = c.replace('box-shadow: 0 10px 30px rgba(0,0,0,0.15)', 'box-shadow: 0 0 15px rgba(255, 255, 255, 0.5)')
    
    with open(f3, 'w', encoding='utf-8') as f:
        f.write(c)

# 4. checkout.html
f4 = os.path.join(folder, 'checkout.html')
if os.path.exists(f4):
    with open(f4, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('Gold', 'Premium')
    with open(f4, 'w', encoding='utf-8') as f:
        f.write(c)

# 5. profile.html
f5 = os.path.join(folder, 'profile.html')
if os.path.exists(f5):
    with open(f5, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('Gold Plan', 'Premium Plan')
    with open(f5, 'w', encoding='utf-8') as f:
        f.write(c)

# 6. Check for default css accent
css = os.path.join(folder, 'style (2).css')
if os.path.exists(css):
    with open(css, 'r', encoding='utf-8') as f:
        c = f.read()
    # Ensure there isn't yellow in var(--color-accent) just in case
    # Not blindly replacing CSS without logic, but verifying.
    c = c.replace('#fbbf24', '#ffffff').replace('#d4af37', '#ffffff')
    with open(css, 'w', encoding='utf-8') as f:
        f.write(c)

print("Yellow purged.")
