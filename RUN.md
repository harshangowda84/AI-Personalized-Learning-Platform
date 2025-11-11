RUNNING THE AI Personalized Learning Platform (Quick)

This file provides the minimal commands you need to run the project locally on Windows (PowerShell).

Backend (Flask)

1. Open PowerShell and go to the project backend folder:

```powershell
cd "D:\Project\Ai Learning Platform\backend"
```

2. Activate the virtual environment (adjust folder name if different):

```powershell
.\.venv\Scripts\Activate
# or if your venv is named 'humanaize' (as in this repo):
#.\humanaize\Scripts\Activate
```

3. Ensure dependencies are installed (only once):

```powershell
pip install -r requirements.txt
```

4. Create or update `.env` with required secrets (do NOT commit this file):

```powershell
notepad .env
# Add: GEMINI_API_KEY=your_api_key_here
```

5. Run the Flask server:

```powershell
$env:FLASK_APP = "base.py"
$env:FLASK_ENV = "development"
flask run --host=127.0.0.1 --port=5000
```

Frontend (React)

1. In a separate PowerShell window, go to the repo root:

```powershell
cd "D:\Project\Ai Learning Platform"
```

2. Install node packages (first time only):

```powershell
npm install
```

3. Start the React dev server:

```powershell
npm start
```

VS Code Tasks

- Use the workspace tasks if available:
  - "Start Backend" — runs the backend in a terminal
  - "Start Frontend" — runs the frontend in a terminal
  - "Start Full Application" — runs both in parallel

Quick verification

- Frontend: open http://localhost:3000
- Backend: test an endpoint (example):

```powershell
Invoke-RestMethod http://localhost:5000/api/admin/users
```

Notes

- Keep `.env` secret. The repository already ignores `.env`.
- If you change ports, update any proxy or frontend API base URLs accordingly.

That's it — these are the minimal steps to get the project running locally.