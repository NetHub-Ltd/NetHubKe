# Task: Fix master frontend build (Navbar JSX + services parse)

## Cause
- Navbar.tsx: broken JSX (unclosed motion.div / mismatched Link/span), missing scrolled state
- services/page.tsx: corrupted metadata object (parse error)
- contact: Math.random during render (purity)
- mpesa page: // comment as JSX text node

## Verified
- npm run lint → 0 errors
- npm run build → success
