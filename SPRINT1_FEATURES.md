# Sprint 1: The Core Foundation (My Work — Member 1 & Member 4)

**Goal:** Prove the system works. Users can register, log in, manage profiles, and Admin can oversee users.

---

## My Features (Member 1 + Member 4)

### Member 1 — User & Authentication Module

| Feature | Description | Frontend Files | Backend Files |
|---------|-------------|----------------|---------------|
| **F1 — JWT Auth** | Secure signup/login for three user types (Admin, Business, Consumer) using JWT. Passwords hashed with bcrypt. | `components/member1/Login.jsx` | `models/User.js` |
| | | `components/member1/Register.jsx` | `controllers/authController.js` |
| | | `components/member1/Auth.css` | `routes/authRoutes.js` |
| | | `api.js` (JWT interceptor) | `middleware/auth.js` |
| **F2 — Global Shell** | React navigation bar, main routing setup, footer, and role-based redirects so other members can plug in their pages. | `components/member1/Navbar.jsx` | — |
| | | `components/member1/Navbar.css` | |
| | | `App.js` (routing) | |
| | | `styles/theme.css` (design system) | |
| **Profile Management** | Users can update name, email, phone and upload profile picture. | `components/member1/Profile.jsx` | `controllers/authController.js` |
| | | `components/member1/Profile.css` | `middleware/upload.js` |
| **Password Change** | Securely change password with current password verification. | _(inside Profile.jsx)_ | `controllers/authController.js` |

---

### Member 4 — Admin, Analytics & Notifications

| Feature | Description | Frontend Files | Backend Files |
|---------|-------------|----------------|---------------|
| **F16 — Admin Users** | Admin can view all registered users in a table with role badges and join dates. Stats show count of Admins, Businesses, and Consumers. | `components/member4/AdminDashboard.jsx` | `controllers/authController.js` (getAllUsers) |
| | | `components/member4/AdminDashboard.css` | `routes/authRoutes.js` (admin-only route) |

---

## Teammates' Work (Not Yet Implemented)

| Member | Sprint 1 Feature | What They Need To Build |
|--------|-----------------|------------------------|
| **Member 2** | F6 — Create Listing | `models/Listing.js`, `controllers/listingController.js`, `routes/listingRoutes.js`, `components/member2/CreateListing.jsx` |
| **Member 3** | F11 — Discovery Feed | `components/member3/Home.jsx` (homepage grid displaying all active food listings) |

> **Note for teammates:** Create your component directories (`member2/`, `member3/`) inside `frontend/src/components/`, then add your routes to `App.js` and nav links to `Navbar.jsx`.

---

## Project File Structure

```
ZeroWaste/
├── backend/
│   ├── controllers/
│   │   └── authController.js       ← Auth logic (register, login, profile, password, admin)
│   ├── middleware/
│   │   ├── auth.js                 ← JWT protect & role authorize
│   │   └── upload.js               ← Multer for profile pictures
│   ├── models/
│   │   └── User.js                 ← User schema (name, email, password, role, phone, pic)
│   ├── routes/
│   │   └── authRoutes.js           ← /api/auth/* endpoints
│   ├── server.js                   ← Express server entry point
│   └── .env                        ← MongoDB URI + JWT secret
│
├── frontend/
│   ├── src/
│   │   ├── api.js                  ← Axios instance with JWT interceptor
│   │   ├── App.js                  ← Main routing (member 1 + member 4 pages)
│   │   ├── index.js                ← React entry point
│   │   ├── index.css               ← Imports theme.css
│   │   ├── styles/
│   │   │   └── theme.css           ← Design system (tokens, components, animations)
│   │   └── components/
│   │       ├── member1/            ← Login, Register, Navbar, Profile + CSS
│   │       ├── member2/            ← (empty — teammate builds CreateListing here)
│   │       ├── member3/            ← (empty — teammate builds Home/Feed here)
│   │       └── member4/            ← AdminDashboard + CSS
│   └── package.json
│
└── SPRINT1_FEATURES.md             ← This file
```
