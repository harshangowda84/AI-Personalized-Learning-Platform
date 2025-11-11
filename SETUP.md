AI Personalized Learning Platform — Quick Install & Run (Windows / PowerShell)

This short guide shows how to set up the project manually on a different Windows machine (PowerShell). It assumes you have Git, Node.js (>=16) and Python (3.10/3.11) installed.

If you prefer a full, step-by-step script or macOS/Linux instructions, tell me and I will produce them.

---
Prerequisites
- Git (https://git-scm.com/)
- Node.js (LTS recommended) + npm (https://nodejs.org/)
- Python 3.10 or 3.11 (https://www.python.org/)
- Optional: Visual Studio Code (with PowerShell) for tasks

Ports used by default
- Frontend (React dev server): 3000
- Backend (Flask): 5000

---
1) Clone the repository
Open PowerShell and run:

```powershell
# clone the project (replace with your fork or origin if needed)
git clone https://github.com/harshangowda84/AI-Personalized-Learning-Platform.git
cd "AI-Personalized-Learning-Platform"
```

2) Backend setup (Python / Flask)

```powershell
# go to backend
cd backend

# Create a virtual environment (use .venv or env311, your choice)
python -m venv .venv

# On first use, PowerShell may block scripts; to allow the venv activation for session (temporary):
# Run as admin only if you want to change system policy. Safer: allow for this process only:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Activate the virtual environment
.\.venv\Scripts\Activate

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create the `.env` file with your API key and any other secrets (do NOT commit this file):

```powershell
# from backend folder create .env
New-Item -Path . -Name ".env" -ItemType "file" -Force
notepad .env
# add the following content (replace with your real key):
# GEMINI_API_KEY=your_real_gemini_api_key_here
```

Notes about the GEMINI API key
- Get your key from Google Generative AI / Google Cloud console.
- Keep the key secret: `.env` is already in `.gitignore` in this repo.

Run the Flask backend

```powershell
# Ensure venv is active (.\.venv\Scripts\Activate)
# Set Flask environment variables for PowerShell
$env:FLASK_APP = "base.py"
$env:FLASK_ENV = "development"

# Run the server (bind to localhost 127.0.0.1)
flask run --host=127.0.0.1 --port=5000
```

If you prefer to run in a different terminal with the pre-made VS Code task, open the workspace in VS Code and run the "Start Backend" task.

3) Frontend setup (React)

Open a new PowerShell window (leave backend running) and run:

```powershell
cd "d:\path\to\AI-Personalized-Learning-Platform"  # path where you cloned the repo
cd src/.. # ensure you're in repo root

# Install node packages
npm install

# Start the React dev server (creates localhost:3000)
npm start
```

Or use the VS Code task "Start Frontend".

4) Verify both servers
- Frontend: open http://localhost:3000 in your browser
- Backend: Check an API endpoint, e.g. with PowerShell:

```powershell
# simple GET
Invoke-WebRequest -UseBasicParsing http://localhost:5000/ | Select-Object -ExpandProperty Content

# or check port availability
Test-NetConnection -ComputerName localhost -Port 5000
```

If your backend exposes `/api/admin/users` you can test it (if running):

```powershell
Invoke-RestMethod http://localhost:5000/api/admin/users
```

5) Running both together
- Recommended: start backend in one terminal and frontend in another.
- Or run VS Code task "Start Full Application" (if present) which starts both in parallel.

6) Production notes
- To build the frontend for production:

```powershell
npm run build
# Output will be in build/ — serve with a static server or integrate into your backend
```

- For production backend consider using a WSGI server (gunicorn on Linux) and a reverse proxy (Nginx) or containerizing with Docker.

7) Security & hygiene
- Never commit `.env` or credentials. This repo's `.gitignore` already ignores `.env` and `backend/.env`.
- Rotate any API key that you suspect was pushed publicly.
- Replace plaintext password storage with hashed passwords (bcrypt/argon2). I can help implement it.

8) Optional: quick health endpoint (if you want one)
You can add a simple /health route in `backend/base.py` that returns 200 OK. Example snippet:

```python
# inside base.py (Flask app instance)
@app.route('/health')
def health():
    return {'status': 'ok'}, 200
```

Then you can `Invoke-RestMethod http://localhost:5000/health` to verify the API is up.

Troubleshooting
- If `flask` command is not found after activating venv, ensure the venv activation succeeded and `python -m pip install -r requirements.txt` completed successfully.
- If PowerShell blocks `.\venv\Scripts\Activate`, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force` prior to activation.
- If ports are in use, change ports in commands: `flask run --port 5001` and `npm start` (React will usually prompt to use another port automatically).
- If you see missing package errors, re-run `pip install -r requirements.txt` or `npm install`.

Contact & next steps
- If you want, I can:
  - Produce a single `.ps1` setup script that automates the steps above.
  - Add a `/health` endpoint and a small startup script for Windows.
  - Replace plaintext password storage with bcrypt and migrate existing users.

---
That's it — tell me if you'd like a one-click PowerShell script to automate the setup or a Linux/macOS version of this guide. 
