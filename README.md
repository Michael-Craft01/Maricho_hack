# 🛍️ Maricho - Next-Gen Virtual Try-On PWA

A hybrid, high-performance E-Commerce Progressive Web App (PWA) built to bridge the gap between digital shopping and physical reality. This platform leverages Generative AI for virtual try-ons, introduces a print-on-demand supplier model, and implements a demand-driven bidding system.

---

## 🚦 Current Project Status

> **Maintainer Note:** Update the value below to reflect the current active development sprint.

**CURRENT PHASE:** `PHASE 1` 
*(Options: PHASE 1 | PHASE 2 | PHASE 3 | PHASE 4)*

---

## 🛠️ Tech Stack & Architecture

This project utilizes a modern, serverless-first architecture optimized for performance and scalability.

* **Frontend Framework:** Next.js (React)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **PWA Engine:** Next-PWA (Service Workers, Manifest)
* **Backend & Auth:** Firebase (Firestore, Authentication, Cloud Functions)
* **AI & Image Gen:** Gemini API (Model: Nano Banana)
    * *Usage:* Image-to-Image generation for Virtual Try-On.
* **Deployment:** Vercel (Recommended) / DigitalOcean App Platform

> **⚠️ Living Document:** The technical details below represent the architectural vision. As development proceeds, actual implementation details (API endpoints, schema structures) may diverge. Developers are required to update this README to maintain alignment with the codebase.

---

## 🗺️ Development Roadmap & Phase Breakdown

The project is divided into four distinct technical phases (Sprints).

### 🟢 Phase 1: The "Virtual Mirror" (Core E-Commerce)
**Objective:** Establish the base e-commerce platform with the signature AI Virtual Try-On feature.

* **Core Features:**
    * User Authentication (Google Auth via Firebase).
    * Product Browsing & Filtering.
    * **AI Virtual Try-On:** The "Killer Feature."
* **Technical Implementation:**
    * **Input:** The system accepts two image inputs (User Photo + Product Image) and a text prompt (e.g., *"Person wearing [Product] in [Style] style"*).
    * **Processing:** These inputs are sent to the **Gemini API (Nano Banana)**.
    * **Output:** A generated composite image showing the user wearing the selected clothing item.
    * **Frontend:** Custom React hooks to handle image file uploads and API state states (loading, error, success).
    * **Storage:** User generated "try-on" results are cached temporarily in Firebase Storage to optimize costs.

### 🟡 Phase 2: "Print-on-Demand" (Zero-Inventory Protocol)
**Objective:** Enable a safe, dropshipping-like model where suppliers list virtual inventory that is produced/sourced only upon order.

* **Core Features:**
    * Supplier Dashboard for uploading "Virtual" products.
    * Order Routing System.
* **Technical Implementation:**
    * **Database Schema:** Introduce `is_on_demand` flag in the `Products` collection.
    * **Workflow:**
        1.  Supplier uploads product mockups (no physical stock required).
        2.  User places an order.
        3.  **Cloud Function Trigger:** `onCreate` order trigger notifies the specific supplier via email/in-app notification.
        4.  Supplier confirms production start.
    * **Safety:** Funds are authorized but not settled until the supplier confirms the "Print" or "Source" action (precursor to Escrow).

### 🟠 Phase 3: "The Market Pulse" (Reverse Bidding & Visual Search)
**Objective:** Invert the traditional retail model. Users demand specific items visually, and suppliers bid to fulfill that demand in real-time.

* **Core Features:**
    * Visual Request Creation (User takes a photo of a desired item).
    * Supplier Bidding System.
    * Real-time Notification Engine.
* **Technical Implementation:**
    * **Visual Search:** Users upload a reference image with specific requirements (size, fabric, max price).
    * **Broadcast Logic:** This request is created as a `DemandRequest` document in Firestore.
    * **Targeting:** Suppliers subscribed to specific tags (e.g., "Sneakers", "Denim") receive a push notification via Firebase Cloud Messaging (FCM).
    * **Bidding UI:** Suppliers can view the request and submit a `Bid` (Price + Estimated Delivery).
    * **Selection:** User selects the best bid, converting the `DemandRequest` into a standard `Order`.

### 🔴 Phase 4: "The Trust Layer" (Escrow & Expansion)
**Objective:** Financial security for the marketplace and expanding support beyond apparel.

* **Core Features:**
    * Secure Escrow Payment System.
    * Category Expansion (Electronics, Accessories, etc.).
* **Technical Implementation:**
    * **Escrow Logic:**
        * Payment status tracks: `PENDING` -> `HELD_IN_ESCROW` -> `RELEASED`.
        * Funds are released to the supplier **only** after the user confirms delivery (or after a set auto-release window, e.g., 48 hours post-delivery).
    * **Polymorphic Product Schema:** Refactor the Firestore `Products` schema to handle variable attributes (e.g., Clothing has `Size/Color`, Electronics have `Voltage/Specs`).
    * **Dispute Resolution:** A basic admin interface to freeze Escrow funds if a dispute is flagged.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Firebase Project Credentials
* Gemini API Key

## 📱 PWA Features
This app is designed to be installed on mobile devices.
* **Offline Mode:** Basic product browsing cached via Service Workers.
* **Installability:** Manifest file included for "Add to Home Screen" functionality.

---

## 🤝 Contribution Guidelines

Please check the **Current Phase** at the top of this document before opening a Pull Request. Ensure your code aligns with the active or previous phases. Do not submit code for future phases (e.g., Escrow logic during Phase 1) unless explicitly authorized.

*Documentation is a continuous process. If you change the code, change the README.*