# Book of Grit: Complete Project Overview

## 1. Project Essence
**Book of Grit** is a premium, immersive web experience designed for individuals seeking personal development through high-intensity mental and tactical discipline. The application serves as a digital archive and marketplace for "Field Manuals" and elite memberships, wrapped in a high-tech, gritty "cyber-brutalist" aesthetic.

---

## 2. Key Features

### 📡 Field Manuals (Archive)
- **Digital Assets**: Users can purchase individual manuals (Chapters) for $3 each.
- **Instant Decryption**: Upon purchase, the system generates a secure, classified PDF manifest for the user.
- **Persistence**: Unlocked assets are tied to the user's identity and remain accessible across sessions.

### ⚡ The Movement (Membership)
- **Subscription Model**: An elite tier priced at $10/month.
- **Exclusive Access**: Unlocks the entire grit archive and adds the operator to a global decentralized network.
- **Tactical Drills**: Provides members with recurring mental and physical operational procedures.

### 🆔 Operator Identity
- **Callsign System**: Users initialize their identity with a unique "Callsign".
- **Real-time Status**: Tracking of mission progress and acquired assets.

### 🛡️ Admin Command Center
- **Asset Management**: Full CRUD capabilities for the manual archive, including title, description, and price management.
- **Operational Oversight**: Secure login to manage the live environment.

---

## 3. Technical Stack

### **Frontend**
- **React (Vite)**: Modern, high-performance SPA framework.
- **Tailwind CSS**: Utility-first styling for the unique "Brutalist" UI.
- **Framer Motion**: Advanced micro-animations and "glitch" effects.
- **jsPDF / html2canvas**: Client-side generation of secure digital manifests.

### **Backend & Storage**
- **Firebase Firestore**: Real-time NoSQL database for assets, users, and purchases.
- **Firebase Auth**: Secure operator authentication and session management.
- **Firebase Storage**: Hosting for PDF assets and tactical imagery.
- **PHP (Hostinger)**: Server-side logic for the Stripe gateway.

### **Payments (Production Locked)**
- **Stripe API**: Live integration for both one-time payments (Chapters) and recurring subscriptions (The Movement).
- **Secure Key Storage**: `stripe_secrets.php` server-side configuration with restrictive permissions (chmod 600).

---

## 4. UI/UX Philosophy: "Cyber-Grit"
The application avoids traditional "clean" web design in favor of an immersive "Combat Terminal" experience:
- **Typography**: Heavily features `Rubik Mono One` (Bombed) and `Courier Prime` (Technical).
- **Color Palette**: Pitch black backgrounds accented with Neon Cyan (Primary), Fire Orange (Alert), and Neon Magenta (Elite).
- **Micro-interactions**: Use of scanlines, ticker tapes, and terminal-style authorization sequences.

---

## 5. Deployment Workflow
The project implements a robust **Git-based automation** deployment to Hostinger:
- **`main` Branch**: Source of truth for development.
- **`deploy` Branch**: Production-ready builds.
- **Automation Scripts**: Custom `expect` and `scp` scripts handle:
    - Code synchronization across global web-roots.
    - Automatic permissions enforcement.
    - Secure Stripe key injection on the remote server.

---

## 6. Access Protocols
- **Live URL**: [thebookofgrit.com](https://thebookofgrit.com)
- **Support**: secure_line@thebookofgrit.com
- **Operational Status**: **FULL-ACTIVE**
