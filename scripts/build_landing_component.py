import re

with open('landing_page.html', 'r', encoding='utf-8') as f:
    raw = f.read()

style_match = re.search(r'<style>(.*?)</style>', raw, re.DOTALL)
style_content = style_match.group(1) if style_match else ''

body_match = re.search(r'<body[^>]*>(.*?)<script>', raw, re.DOTALL)
body_content = body_match.group(1) if body_match else ''

# Replace button onclick='openConsole()' with onclick='window.location.href="/app"'
body_content = body_content.replace('onclick="openConsole()"', 'onclick="window.location.href=\'/app\'"')

# Escape backticks and template string syntax for JSX
style_escaped = style_content.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')
body_escaped = body_content.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')

header_code = """'use client';

import React, { useEffect } from 'react';

export const LandingPageContent: React.FC = () => {
  useEffect(() => {
    // Initialize Lucide icons
    const initIcons = () => {
      if (typeof window !== 'undefined' && (window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    };
    initIcons();
    const timer = setTimeout(initIcons, 600);

    // Smooth scroll for nav links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // Intersection observer for reveal elements and progress bars
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.bar-fill[data-w]').forEach((bar) => {
              const w = bar.getAttribute('data-w');
              if (w) (bar as HTMLElement).style.width = w + '%';
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section').forEach((s) => {
      s.classList.add('reveal');
      observer.observe(s);
    });

    // Hero bars immediate animation
    const heroTimer = setTimeout(() => {
      document.querySelectorAll('#hero .bar-fill[data-w]').forEach((bar) => {
        const w = bar.getAttribute('data-w');
        if (w) (bar as HTMLElement).style.width = w + '%';
      });
    }, 400);

    // Global console navigation fallback
    (window as any).openConsole = () => {
      window.location.href = '/app';
    };

    return () => {
      clearTimeout(timer);
      clearTimeout(heroTimer);
      document.removeEventListener('click', handleAnchorClick);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060A12] text-[#E2E8F0] font-sans antialiased overflow-x-hidden">
"""

footer_code = """    </div>
  );
};
"""

full_code = header_code + f"      <style dangerouslySetInnerHTML={{{{ __html: `{style_escaped}` }}}} />\n      <div dangerouslySetInnerHTML={{{{ __html: `{body_escaped}` }}}} />\n" + footer_code

with open('frontend/components/LandingPageContent.tsx', 'w', encoding='utf-8') as f:
    f.write(full_code)

print("Generated frontend/components/LandingPageContent.tsx successfully!")
