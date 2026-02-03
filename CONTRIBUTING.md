# Contributing Guidelines

This project follows a **simple Git workflow** to keep collaboration easy and clean.  
Recommended Git workflow video: [Watch here](https://youtu.be/pJYOG6klqj8?si=76GN4q_ejbXcd05n)

---

## 🌱 Branch Rules (IMPORTANT)

### ❌ Do NOT commit to `main`
- `main` is reserved for stable code only
- Never push directly to `main`

---

## ✅ Development Rule (Very Simple)

Each developer works on **their own dev branch**.

### Branch Names
- `fs-dev` → Firman  
- `an-dev` → Andek  
- `ni-dev` → Nina  

> Always push your changes to **your own dev branch only**.

---

## 🔧 Getting Started (First Time Only)

```bash
# Create and switch to your dev branch (example: Firman)
git checkout -b fs-dev
git push -u origin fs-dev

📝 Commit Message Rules

Always write clear and meaningful commit messages:

<initials>-<type>: short description


Examples:

fs-feat: create login page layout
fs-feat: add form validation
fs-fix: handle empty input error
an-feat: integrate wallet connection
ni-docs: update README


Typical Git workflow:

git add .
git commit -m "fs-feat: create login page layout"
git push origin fs-dev

🤝 FINAL NOTE

Work on your own dev branch.
Write good commit messages.

