# Playto – Community Feed (Engineering Challenge Submission)

This repository contains a full-stack prototype built for the **Playto Engineering Challenge**.

The application implements a community feed with threaded discussions and a dynamic leaderboard based on user activity over the last 24 hours.

---

## Tech Stack

### Backend
- Django
- Django REST Framework

### Frontend
- React
- Tailwind CSS

### DataBase
- SQLite

---

## Features

- Community feed with text posts
- Author and like count for each post
- Threaded (nested) comments (Reddit-style)
- Likes on posts and comments
- Karma system
  - Like on a post → +5 karma
  - Like on a comment → +1 karma
- Leaderboard showing top 5 users based on karma earned in the last 24 hours
- Token based authentication (login & registration)
- Race-condition safe like system (no double likes)
- Efficient loading of nested comments

---

## Project Structure

```text
backend/
    backend/
    feed/
    manage.py
frontend/
    src/
```

## Running the project locally
### Backend
- Navigate to the backend directory:

```Bash
cd backend
```

- Create a virtual environment:

```Bash
python -m venv venv
```

- Activate venv (Windows):

```Bash
venv\Scripts\activate
(Or source venv/bin/activate on macOS/Linux)
```

- Install dependencies:

```Bash
pip install -r requirements.txt
```

- Run migrations:

```Bash
python manage.py migrate
```

- (Optional) Create admin user:

```Bash
python manage.py createsuperuser
```

- Start backend:

```Bash
python manage.py runserver
```

Backend URL: http://127.0.0.1:8000

### Frontend
- Navigate to the frontend directory:

```Bash
cd frontend
```

- Install dependencies:

```Bash
npm install
```

- Start development server:

```Bash
npm run dev
```

Frontend URL: http://localhost:5173

### Authentication
The backend uses Django REST Framework token authentication.

After login or registration, the frontend sends:

```bash
HTTP Authorization: Token <your_token_here> for authenticated requests.
```

### API Endpoints
- GET /api/feed/

- GET /api/posts/<id>/

- POST /api/posts/create/

- POST /api/comments/

- POST /api/like/

- GET /api/leaderboard/

- POST /api/register/

- POST /api/login/

### Demo Data
A management command is provided to seed the database:

```bash
python manage.py seed_demo
```

It creates:

- multiple users
- multiple posts
- nested comments
- likes
- karma transactions

This allows reviewers to immediately explore:

- the feed
- nested comment trees
- concurrency-safe likes
- the 24-hour leaderboard logic

### Automated Test (Bonus)

One meaningful test is included:

leaderboard calculation only counts karma from the last 24 hours

Run tests:
```bash
python manage.py test
```

## Deployment
### Frontend:

Vercel

### Backend:

Railway

- The backend is configured with the project root set to the Django backend directory.

- In production, the same API and authentication flow is used as in local development.

### DataBase
SQLite is used for local development and demo deployment.

The leaderboard and karma system are calculated dynamically from
the transaction history and do not rely on cached or denormalized
daily counters.

## Notes
This project focuses on:

- database integrity
- concurrency safety
- efficient query usage
- dynamic aggregation for leaderboard
- avoiding N+1 queries