# 🧩 GitHub Integration App

This full-stack project integrates GitHub data (repos, commits, issues, pulls, orgs, users) using **Angular** for the frontend and **Node.js/Express** with **MongoDB** for the backend.

---

## 📁 Project Structure

```
TEST-TASK-MEAN/
├── backend/       → Node.js + Express + MongoDB
├── frontend/      → Angular 19 UI (AG Grid, Material)
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js v22+
- Docker
- if you want you can have MongoDB running locally or in the cloud

### Environment

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/integrations # for local mongo connection
GITHUB_CLIENT_ID=####################
GITHUB_CLIENT_SECRET=****************************************
# GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_CALLBACK_URL=http://localhost:4200/integration
JWT_SECRET=********************************************
CLIENT_URL=http://localhost:4200

```

### Run complete stack

```
docker compose up -d
```

## 🚀 Backend Setup (Node.js + Express)

### Install and Run

```bash
cd backend
npm install
npm run dev
```

Backend will start on: `http://localhost:3000`

---

## 🌐 Frontend Setup (Angular)

### Prerequisites

- Angular CLI v19+
- Node.js v22+

### Install and Run

```bash
cd frontend
npm install
ng serve
```

App will run at: `http://localhost:4200`

### Build for Production

```bash
ng build
```

---

## 🔗 GitHub API Integration

This project fetches:

- Repositories
- Commits
- Issues
- Pull Requests
- Organization members

OAuth2 flow + token storage is used for authentication.

---

## 🛡️ Tech Stack

- **Frontend**: Angular 19, Angular Material, AG Grid
- **Backend**: Node.js, Express, Axios, Mongoose
- **Database**: MongoDB
- **Auth**: GitHub OAuth2

---

## 👨‍💻 Developer Notes

- Debounced search with AG Grid filtering
- Manual pagination logic
- Supports multiple GitHub entities dynamically

---

## Task One

![](./assets/task-one.pdf)

## Task Two

![](./assets/task-two.pdf)
