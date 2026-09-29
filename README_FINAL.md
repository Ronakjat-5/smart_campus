# SmartCampus — Final Hackathon Project

## Requirements
- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## 1. Backend
Open PowerShell:

```powershell
cd "C:\Users\NPC\Downloads\SmartCampus_Final\backend"
npm install
copy .env.example .env
node seed.js
node server.js
```

Backend: http://localhost:5050/api/health

## 2. Frontend
Open a second PowerShell:

```powershell
cd "C:\Users\NPC\Downloads\SmartCampus_Final\frontend"
npm install
npm run dev
```

Frontend: http://localhost:5173

## Demo accounts
- Admin: `admin@smartcampus.local` / `admin123`
- Faculty: `faculty@smartcampus.local` / `faculty123`
- Parent: `parent@smartcampus.local` / `parent123`
- Any dataset student Gmail ID / `student123`

## Important
`node seed.js` resets the demo database and recreates the complete 200-student dataset. Run it once after a fresh install.

The project does not include `node_modules` or a real `.env` file. Install dependencies and create `.env` from `.env.example` as shown above.
