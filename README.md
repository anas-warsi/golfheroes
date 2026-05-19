# GolfHeroes ⛳🏆

A full-stack golf competition and charity platform where users compete using Stableford golf scores, win prize pools, and contribute to charities through monthly subscriptions.

Built with:

- React + Vite
- Laravel API
- PostgreSQL (Supabase)
- TailwindCSS
- JWT Authentication

---

# 🚀 Features

## 👤 Authentication System

- User Registration & Login
- JWT Token Authentication
- Protected Routes
- Admin Authorization Middleware

---

# ⛳ Stableford Score Management

Users can:

- Submit golf scores
- Edit scores
- Delete scores
- Maintain latest 5 scores automatically
- Track Stableford points

---

# 💰 Dynamic Prize Pool System

The platform dynamically generates prize pools from subscriptions.

## Prize Split Logic

| Match Tier | Prize Percentage |
|------------|------------------|
| Jackpot (5 Match) | 40% |
| 4 Match | 35% |
| 3 Match | 25% |

### Features

- Real-time pool calculation
- Dynamic distribution
- Auto-updating prize dashboard

---

# ❤️ Charity Contribution System

Users select a charity during subscription.

## PRD Logic

- Minimum 10% contribution from subscriptions
- Dynamic charity growth
- Real-time total raised updates
- Public & Admin charity dashboards sync automatically

### Charity Features

- Live contribution totals
- Featured charities
- Dynamic API rendering
- Indian currency formatting

---

# 🏆 Winner Verification System

Winners can:

- View winning status
- Upload golf score screenshot proof
- Submit verification images

Admins can:

- View uploaded screenshots
- Approve winners
- Reject winners
- Mark payouts as paid

---

# 🖼️ Image Upload System

Implemented using:

- Laravel Storage
- Public storage symlink
- File validation
- Protected upload endpoints

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- TailwindCSS
- Axios
- React Router

## Backend

- Laravel 12
- Eloquent ORM
- JWT Authentication
- REST APIs

## Database

- PostgreSQL
- Supabase

---

# 📂 Project Structure

```bash
digital-heroes/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── storage/
│   └── public/
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/golfheroes.git
```

---

# 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 3. Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

Backend runs on:

```bash
http://localhost:8000
```

---

# 🗄️ Database Setup

Update `.env`

```env
DB_CONNECTION=pgsql
DB_HOST=YOUR_SUPABASE_HOST
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_PASSWORD
```

---

# 🔐 Environment Variables

## Frontend

Create:

```bash
frontend/.env
```

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Backend

Create:

```bash
backend/.env
```

```env
APP_URL=http://localhost:8000
FILESYSTEM_DISK=public
```

---

# 📸 Winner Proof Upload API

## Upload Endpoint

```http
POST /api/winners/{id}/upload-proof
```

### Form Data

| Field | Type |
|-------|------|
| proof | image |

---

# 👨‍💻 Admin Features

- Manage charities
- Manage users
- Review winner proofs
- Approve / Reject winners
- Mark payouts as paid
- Monitor prize pool

---

# 🌐 Deployment

## Frontend

Deploy using:

- Vercel

## Backend

Deploy using:

- Render / Railway / VPS

---

# ✅ Production Optimizations

- Infinite request loop fixed
- CORB issues resolved
- Dynamic charity totals
- Image fallback protection
- Responsive layouts
- Clean API structure

---

# 📖 PRD Compliance

Implemented according to the provided PRD:

- Stableford scoring
- Prize pool logic
- Charity contribution model
- Winner verification system
- Subscription management
- Admin moderation system

---

# 📌 Future Improvements

- Real payment gateway integration
- Email notifications
- Automated draw generation
- Live leaderboards
- Mobile application
- Multi-language support

---

# 👨‍💻 Developer

Built by Anas Warsi

LinkedIn:
www.linkedin.com/in/anas-warsi-8a68a8377

Portfolio:
https://anas-warsi.github.io

---

# 📄 License

This project is for educational and evaluation purposes.
