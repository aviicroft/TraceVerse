import os

os.makedirs('frontend/public', exist_ok=True)
with open('landing_page.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update openConsole function to navigate top window to /app
content = content.replace(
    'function openConsole() {',
    'function openConsole() { window.top.location.href = "/app"; return;'
)

with open('frontend/public/landing.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated frontend/public/landing.html with top-level /app navigation")
