# Book of Grit - Production Architecture (Online Version)

## 1. Overview
This document outlines the logical architecture for the **Live/Online** version of Book of Grit.
Unlike the local prototype which uses `localStorage` and mock timers, the online version relies on **Server-Side Verification**, **Real Payments**, and **Cloud Synchronization**.

## 2. Core Systems Comparison

| Feature | Local Prototype (Current) | Production (Online Version) |
| :--- | :--- | :--- |
| **Identity** | `localStorage` ("Callsign" only) | **Firebase Auth** (Google/Email/Anon) |
| **Persistence** | Browser Cache (Lost on clear) | **Firestore Database** (Synced across devices) |
| **Payment** | Mock timer (`setTimeout`) | **Stripe Checkout** (Real monetary transaction) |
| **Fulfillment** | Instant client-side unlock | **Webhook Fulfillment** (Secure server updates) |

---

## 3. Online User Flow (Revised)

### A. Authentication (The Gatekeeper)
Instead of just asking for a name, we must securely identify the user to link their purchases.
1.  **Visitor Lands**: Sees the site as an "Unregistered Operator".
2.  **Enlistment**:
    *   User enters Callsign.
    *   **System Action**: Triggers `signInAnonymously` or `signInWithGoogle`.
    *   **Result**: User gets a `uid` in Firebase Auth. All data is now attached to this `uid`.

### B. The Shop (Secure Data)
1.  **Fetching Products**:
    *   App queries Firestore `products` collection (read-only for public).
    *   **Security Rule**: `allow read: if true;`
2.  **Checking Ownership**:
    *   App listens to `users/{uid}/purchases` collection in real-time.
    *   **Sync**: If the user buys a book on their phone, it instantly unlocks on their desktop.

### C. Checkout Process (Stripe Integration)
This is the most critical change from the wireframe.

1.  **Initiate**: User clicks "ACQUIRE ($3)".
2.  **Cloud Function Call**:
    *   App calls `createStripeCheckoutSession({ productId: 'CH_01', uid: 'user_123' })`.
3.  **Server Processing**:
    *   Cloud Function validates the request.
    *   Generates a **Stripe Checkout URL** (hosted by Stripe).
4.  **Redirect**: App redirects user to Stripe.com to enter card details.
5.  **Payment**: User pays securely on Stripe.
6.  **Return**: Stripe redirects user back to `bookofgrit.com/success`.

---

## 4. Backend Logic (Invisible/Server-Side)

### A. The Webhook (The Listener)
The app frontend *never* tells the database "I paid". That is insecure. Stripe tells the database.
1.  **Event**: Stripe detects successful payment (`checkout.session.completed`).
2.  **Webhook**: Stripe sends a secure ping to `https://api.bookofgrit.com/stripe-webhook`.
3.  **Fulfillment Function**:
    *   Verifies the Stripe signature.
    *   Reads the `metadata.uid` and `metadata.productId`.
    *   **Writes to Firestore**: Adds document to `users/{uid}/purchases/{productId}`.

### B. Security Rules (Firestore)
*   **Products**: Public Readable. Admin Writable.
*   **User Data**: Readable only by `request.auth.uid == userId`. Writable ONLY by Server (Admin SDK). **Users cannot write to their own 'purchases' collection.**

---

## 5. Technology Stack For Deployment

### Frontend (Hosting)
- **Vite React App**: Built and deployed to **Firebase Hosting** (CDN).
- **Domain**: `www.bookofgrit.com`

### Backend (Serverless)
- **Firebase Functions**: Node.js environment.
    - `createCheckoutSession`: Handles Stripe logic.
    - `handleStripeWebhook`: Handles fulfillment.
- **Firestore**: NoSQL Database.

### 3rd Party
- **Stripe**: Payment Gateway (Credit Cards, Apple Pay).
- **SendGrid (Optional)**: For sending email receipts/PDF backups.

---

## 6. Detailed Data Schema (Online)

**Collection: `users` (Private)**
```json
{
  "uid_12345": {
    "email": "operator@gmail.com",
    "callsign": "MAVERICK",
    "joinedAt": "timestamp",
    "isSubscriber": true, // synced from Stripe
    "purchases": {
        "CH_01": { "purchasedAt": "timestamp", "price": 300 },
        "CH_02": { "purchasedAt": "timestamp", "price": 300 }
    }
  }
}
```

**Collection: `products` (Public)**
```json
{
  "CH_01": {
    "name": "The Void",
    "active": true,
    "stripePriceId": "price_Hks83..." // Links to Stripe
  }
}
```
