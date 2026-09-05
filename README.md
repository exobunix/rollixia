# Rollixia — Premium Digital Commerce Platform

<p align="center">
  <strong>The global marketplace platform for high-converting digital products, production software, UI kits, templates, and creator tools.</strong>
</p>

---

## ✨ Features

- **Storefront & Catalog**: Modern dark-mode UI with dynamic filtering, live search, instant previews, and category browsing.
- **Admin Center**: Full-featured product builder, file manager, live revenue analytics, coupon manager, and category controls.
- **Multi-Tier Licensing**: Personal, Commercial, and Extended Developer licensing options with automated discount calculations.
- **ImageKit Cloud Storage & CDN**: Direct asset uploads and optimized media delivery.
- **MongoDB Atlas Integration**: Cloud data persistence alongside local high-performance SQLite engine.
- **Instant Tokenized Delivery**: Cryptographic download tokens with configurable download limits and expiration.
- **Dual Currency Support**: Dynamic switcher between INR (₹) and USD ($).
- **Light & Dark Mode**: Modern design system built with custom CSS tokens and glassmorphism.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS Design System, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, SQLite (`sql.js`), Mongoose (`MongoDB Atlas`), ImageKit Node SDK.
- **Authentication**: JWT, bcrypt password hashing, role-based authorization.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/exobunix/rollixia.git
cd rollixia
```

Install backend and frontend dependencies:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cp .env.example .env

# Install client dependencies
cd ../client
npm install
cp .env.example .env
```

### 3. Database Setup
```bash
cd server
npm run seed
```

### 4. Running Locally

Start the backend:
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

Start the frontend:
```bash
cd client
npm run dev
# Running on http://localhost:3000
```

Or run both concurrently from root:
```bash
npm run server:dev
npm run client
```

---

## 📁 Project Structure

```
rollixia/
├── client/                 # React Vite frontend
│   ├── src/
│   │   ├── components/     # UI components (Store, Admin, Common)
│   │   ├── context/        # Auth, Cart, Theme, Currency state
│   │   ├── pages/          # Storefront and Admin views
│   │   └── utils/          # API helpers & ImageKit integration
├── server/                 # Express backend API
│   ├── config/             # Database, MongoDB, and ImageKit configs
│   ├── routes/             # Storefront & Admin REST endpoints
│   ├── services/           # Cloud upload & token services
│   └── seed/               # Initial sample data & migrations
└── package.json            # Root workspace scripts
```

---

## 📄 License
Commercial License — Built for creators by Rollixia Inc.
