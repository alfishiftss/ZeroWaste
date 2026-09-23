# 🎥 5-Minute Video Presentation Guideline
**Roles:** Member 1 (User & Auth) & Member 4 (Admin, Analytics, Notifications)

This guide provides a structured script and timeline for your 5-minute video. To keep things smooth, **have your browser windows pre-loaded** and your **VS Code open with the exact files ready to show.**

---

## ⏱️ Timeline & Script (UI Walkthrough: 4.5 mins)

### 1. Introduction & Homepage (0:00 - 0:45)
- **What to do:** Start on the main landing page of ZeroWaste.
- **What to say:** "Hi, my name is [Your Name]. For this project, I was responsible for Member 1 (User & Authentication) and Member 4 (Admin & Platform Oversight). Let's start right here on the homepage."
- **Showcase (Member 4):** Point to the **Platform Impact Stats** banner. 
  - *"Here we have the public impact banner calculating total meals saved. This makes the platform feel complete and community-driven."*

### 2. Registration & Role-Based Login (0:45 - 2:00)
- **What to do:** Click on the Register/Login buttons. Take your time to show the different options.
- **Showcase (Member 1):** 
  - Show the `Register.jsx` form. Mention that users can choose between 3 roles: Admin, Business, and Consumer.
  - Go to `Login.jsx`. Log in first as a **Business**.
  - Show that it immediately redirects you to the Business Dashboard (**Role-Based Routing**). 
  - Log out. Mention that session management automatically logs users out when the JWT expires.

### 3. Profile Management (2:00 - 2:45)
- **What to do:** Log back in as a Consumer (or stay as Business) and go to the Profile page (`Profile.jsx`).
- **Showcase (Member 1):** 
  - Show the ability to edit details, contact info, and upload a profile picture.
  - Mention Password Security: *"Users can change their passwords here, which are securely hashed using bcrypt in the database."*

### 4. Notifications & Business Analytics (2:45 - 3:30)
- **What to do:** While logged in as a Business, click the notification bell in the navbar. Then show the analytics section.
- **Showcase (Member 4):** 
  - Show the **In-App Notifications** dropdown (`NotificationBell.jsx`). Mention it fetches text alerts directly from the database on page load.
  - Show the **Business Analytics** view (Total items donated, total orders completed).

### 5. Admin Dashboard & Moderation (3:30 - 4:30)
- **What to do:** Log out, and log in as an **Admin**. Go to the Admin Dashboard (`AdminDashboard.jsx` & `M4_ContentModeration.jsx`).
- **Showcase (Member 4):** 
  - **User Management:** Show the master list of users. Demonstrate banning or deleting a bad account.
  - **Content Moderation:** Switch to the listings view. Show how the Admin can see all food posts and forcibly delete inappropriate ones.

---

## 💻 Code Walkthrough (30 Seconds)
*Switch to VS Code. You only have 30 seconds, so keep only these two files open side-by-side and point to them quickly.*

- **File 1:** `backend/models/User.js`
  - Highlight the `bcrypt.hash` line. 
  - *"For security, all passwords are automatically hashed with bcrypt before saving to the database."*
- **File 2:** `backend/routes/authRoutes.js`
  - Highlight the `authorize('Admin')` middleware.
  - *"We use JWT tokens for state management, and custom middleware to strictly protect Admin routes from regular users."*

---

## 💡 Top Tips for a Perfect Recording
1. **Pre-populate your database!** Have at least 2 consumers, 2 businesses, 1 admin, and a few food listings and notifications already created before you hit record. It looks much better than empty screens.
2. **Don't type passwords slowly:** Have credentials saved in your browser or paste them in to save time.
3. **Practice the transitions:** Moving from logging in, to logging out, to logging in as an Admin takes time. Practice this flow so it feels snappy.
4. **Tools:** Use OBS Studio, Zoom, or Windows Game Bar (`Win + G`) to record your screen and microphone.
