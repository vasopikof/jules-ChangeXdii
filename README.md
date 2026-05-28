# EventConnect: Next-Gen Interview Event Platform

EventConnect is a mobile-first, real-time platform designed to streamline student-company interactions during career events. Using QR-driven flows and persistent sessions, it eliminates friction for participants while providing administrators with live oversight.

## 🚀 UX Onboarding Guides

### 🎓 For Students (Participants)
1.  **Check-in:** Upon arrival, scan the Front Desk QR code. Enter your name and assign your unique ID (provided at entry).
2.  **Dashboard:** Your home screen shows your personalized schedule and real-time notifications.
3.  **Booking:** Scan any **Company QR Code** at their booth. The system automatically identifies you and the company, allowing you to book a slot with one tap.
4.  **Notifications:** Receive instant alerts if an administrator changes your schedule or if a company submits your evaluation.

### 🏢 For Company Representatives
1.  **Setup:** Enter your organization name and ID to initialize your booth portal.
2.  **Queue Management:** See a live list of students who have booked slots at your booth.
3.  **Student Check-in:** When a student arrives, scan their **Student Badge QR**. This opens their assessment form immediately.
4.  **Assessment:** Rate the interview and add internal notes. Submitting the form automatically marks the interview as 'Completed' and notifies the student.

### ⚖️ For Administrators (Lecturers)
1.  **Access:** Enter the Master Passcode at the Admin Portal.
2.  **Command Center:** Monitor all activity across the event floor in real-time.
    -   Track total, completed, and pending interviews.
    -   Identify "hotspots" or busy companies.
3.  **Intervention:** Edit or delete any booking if conflicts arise. Both the student and company will receive an instant in-app notification of the change.
4.  **Reporting:** View the live schedule table to ensure the event is running on time.

---

## 🛠 Technical Setup

### Prerequisites
- Node.js (v18+)
- Firebase Project

### 1. Firebase Configuration
1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Cloud Firestore**.
3.  Enable **Anonymous Authentication** (optional, for security) or just use Firestore rules.
4.  Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 2. Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

### 3. QR Code Schema
To facilitate auto-filling, generate QR codes with the following URL structures:
- **Company Booking:** \`https://[your-domain]/book?cid=[COMPANY_ID]\`
- **Student ID (for Reps):** Just the \`STUDENT_ID\` string or \`https://[your-domain]/?id=[STUDENT_ID]\`

---

## ✨ Features
- **Zero-Friction Prefilling:** QR codes pass context directly to forms.
- **Persistent Sessions:** No re-login required; state is saved in LocalStorage.
- **Real-Time Sync:** Powered by Firestore snapshots for instant updates without page refreshes.
- **Notification Hub:** Non-intrusive alert system for schedule changes.
- **Responsive Design:** Laptop-optimized for Admin, Mobile-optimized for Participants.
