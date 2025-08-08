# 🚀 AI Personalized Learning Platform - Installation Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Environment Setup](#environment-setup)
- [Backend Installation](#backend-installation)
- [Frontend Installation](#frontend-installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)

---

## ✅ Prerequisites

Before installing the AI Personalized Learning Platform, ensure you have the following installed on your system:

### **Required Software**
- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8.0 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### **API Requirements**
- **Google AI Studio Account** - [Get API Key](https://aistudio.google.com/)
- **Internet Connection** - Required for AI content generation

---

## 💻 System Requirements

### **Minimum Requirements**
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **CPU**: Dual-core processor, 2.0GHz+

### **Recommended Requirements**
- **RAM**: 8GB or higher
- **Storage**: 5GB free space (for development)
- **CPU**: Quad-core processor, 2.5GHz+
- **Network**: Broadband internet connection

---

## 🔧 Environment Setup

### **Step 1: Verify Node.js Installation**
```bash
# Check Node.js version
node --version
# Should show v16.0.0 or higher

# Check npm version
npm --version
# Should show 8.0.0 or higher
```

### **Step 2: Verify Python Installation**
```bash
# Check Python version
python --version
# Should show Python 3.8.0 or higher

# Check pip version
pip --version
# Should show pip 21.0.0 or higher
```

### **Step 3: Clone the Repository**
```bash
# Clone the project
git clone https://github.com/YourUsername/AI-Learning-Platform.git

# Navigate to project directory
cd AI-Learning-Platform
```

---

## 🐍 Backend Installation

### **Step 1: Navigate to Backend Directory**
```bash
cd backend
```

### **Step 2: Create Python Virtual Environment**

#### **Windows:**
```cmd
# Create virtual environment
python -m venv humanaize

# Activate virtual environment
humanaize\Scripts\activate

# Verify activation (should show (humanaize) in prompt)
```

#### **macOS/Linux:**
```bash
# Create virtual environment
python3 -m venv humanaize

# Activate virtual environment
source humanaize/bin/activate

# Verify activation (should show (humanaize) in prompt)
```

### **Step 3: Install Python Dependencies**
```bash
# Ensure virtual environment is activated
# Install required packages
pip install -r requirements.txt

# Verify installation
pip list
```

### **Step 4: Create Environment Configuration**
```bash
# Create .env file in backend directory
touch .env  # Linux/macOS
# OR create manually on Windows
```

**Add the following to `.env` file:**
```env
# Google AI Configuration
GOOGLE_API_KEY=your_google_ai_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=base.py

# Server Configuration
HOST=127.0.0.1
PORT=5000
```

### **Step 5: Get Google AI API Key**

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing
4. Navigate to **API Keys** section
5. Click **Create API Key**
6. Copy the generated key
7. Replace `your_google_ai_api_key_here` in `.env` file

### **Step 6: Test Backend Installation**
```bash
# Ensure you're in backend directory with virtual environment activated
python base.py

# You should see:
# * Running on http://127.0.0.1:5000
# * Debug mode: on
```

---

## ⚛️ Frontend Installation

### **Step 1: Navigate to Frontend Directory**
```bash
# Open new terminal/command prompt
# Navigate to project root
cd AI-Learning-Platform
```

### **Step 2: Install Node.js Dependencies**
```bash
# Install all npm packages
npm install

# This will install:
# - React 18.3.1
# - React Router DOM 6.23.1
# - Axios 1.7.2
# - Chart.js 4.4.3
# - And all other dependencies
```

### **Step 3: Verify Installation**
```bash
# Check installed packages
npm list --depth=0

# Should show all packages from package.json
```

### **Step 4: Test Frontend Installation**
```bash
# Start development server
npm start

# You should see:
# Compiled successfully!
# Local: http://localhost:3000
# On Your Network: http://192.168.x.x:3000
```

---

## ⚙️ Configuration

### **Backend Configuration**

#### **File: `backend/.env`**
```env
# Required: Google AI API Key
GOOGLE_API_KEY=your_actual_api_key_here

# Optional: Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=base.py

# Optional: Server Settings
HOST=127.0.0.1
PORT=5000
```

#### **File: `backend/base.py`** (if needed)
```python
# API Configuration
api.config['DEBUG'] = True
api.config['TESTING'] = False

# CORS Configuration
CORS(api, origins=["http://localhost:3000"])
```

### **Frontend Configuration**

#### **File: `package.json`** (proxy already configured)
```json
{
  "proxy": "http://localhost:5000"
}
```

#### **API Base URL** (if needed to change)
```javascript
// In frontend files using axios
axios.defaults.baseURL = "http://localhost:5000";
```

---

## 🚀 Running the Application

### **Method 1: Manual Start (Recommended for Development)**

#### **Terminal 1: Start Backend**
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows:
humanaize\Scripts\activate
# macOS/Linux:
source humanaize/bin/activate

# Start Flask server
python base.py
# OR
flask run

# Backend will run on: http://localhost:5000
```

#### **Terminal 2: Start Frontend**
```bash
# Navigate to project root
cd AI-Learning-Platform

# Start React development server
npm start

# Frontend will run on: http://localhost:3000
```

### **Method 2: Using VS Code Tasks** (if configured)

If you're using VS Code with the provided task configuration:

1. **Open VS Code** in the project directory
2. **Press** `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
3. **Type** "Tasks: Run Task"
4. **Select** "Start Backend" and "Start Frontend"

### **Method 3: Using Package Scripts**
```bash
# Start frontend (from project root)
npm start

# Start backend (from project root) 
npm run backend
```

---

## 🌐 Accessing the Application

Once both servers are running:

1. **Frontend**: Navigate to `http://localhost:3000`
2. **Backend API**: Available at `http://localhost:5000`
3. **API Documentation**: Available endpoints:
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `GET /api/auth/profile` - User profile
   - `POST /api/generate-roadmap` - Generate learning roadmap
   - `POST /api/generate-quiz` - Generate quiz
   - `POST /api/generate-resource` - Generate AI content

---

## 🛠️ Troubleshooting

### **Common Installation Issues**

#### **1. Node.js Version Issues**
```bash
# Error: "Node version not supported"
# Solution: Update Node.js
node --version  # Check current version
# Download latest LTS from nodejs.org
```

#### **2. Python Virtual Environment Issues**
```bash
# Error: "python command not found"
# Windows: Use py instead of python
py -m venv humanaize

# Error: "venv not available"
# Install python3-venv (Ubuntu/Debian)
sudo apt-get install python3-venv
```

#### **3. Package Installation Issues**
```bash
# Error: npm install fails
# Solution: Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Error: pip install fails
# Solution: Upgrade pip
pip install --upgrade pip
pip install -r requirements.txt
```

#### **4. API Key Issues**
```bash
# Error: "API key not found" or "Authentication failed"
# Solution: Verify .env file

# Check if .env file exists
ls -la backend/.env

# Verify content
cat backend/.env

# Ensure no extra spaces around =
GOOGLE_API_KEY=your_key_here  # ✅ Correct
GOOGLE_API_KEY = your_key_here  # ❌ Incorrect
```

#### **5. Port Already in Use**
```bash
# Error: "Port 3000 already in use"
# Solution: Kill process or use different port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or start on different port:
PORT=3001 npm start
```

#### **6. CORS Issues**
```bash
# Error: "CORS policy error"
# Solution: Verify backend CORS configuration
# Ensure flask-cors is installed and configured
pip install flask-cors

# Check backend/base.py has:
from flask_cors import CORS
CORS(api)
```

### **Backend-Specific Issues**

#### **Module Import Errors**
```bash
# Error: "No module named 'flask'"
# Solution: Ensure virtual environment is activated
# Windows:
humanaize\Scripts\activate
# macOS/Linux:
source humanaize/bin/activate

# Then reinstall:
pip install -r requirements.txt
```

#### **Google AI API Issues**
```bash
# Error: "API quota exceeded"
# Solution: Check Google AI Studio dashboard
# Verify API key permissions and usage limits

# Error: "Invalid API response"
# Solution: Check internet connection and API key validity
```

### **Frontend-Specific Issues**

#### **React Build Issues**
```bash
# Error: "JavaScript heap out of memory"
# Solution: Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm start

# Windows:
set NODE_OPTIONS=--max-old-space-size=4096
npm start
```

#### **Dependency Version Conflicts**
```bash
# Error: "Conflicting peer dependencies"
# Solution: Install with legacy peer deps
npm install --legacy-peer-deps

# Or use yarn:
npm install -g yarn
yarn install
```

---

## 🔧 Development Setup

### **VS Code Extensions (Recommended)**
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

### **Development Scripts**
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build", 
    "test": "react-scripts test",
    "backend": "cd backend && python base.py",
    "dev": "concurrently \"npm run backend\" \"npm start\""
  }
}
```

### **Git Hooks Setup**
```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hooks
npx husky add .husky/pre-commit "npm test"
```

### **Environment Variables for Development**
```bash
# Create .env.local in project root
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

---

## 🚀 Production Deployment

### **Backend Deployment (Flask)**

#### **Option 1: Using Gunicorn**
```bash
# Install gunicorn
pip install gunicorn

# Create wsgi.py in backend/
from base import api
if __name__ == "__main__":
    api.run()

# Run with gunicorn
gunicorn --bind 0.0.0.0:5000 wsgi:api
```

#### **Option 2: Using Docker**
```dockerfile
# Dockerfile for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "base.py"]
```

### **Frontend Deployment (React)**

#### **Build for Production**
```bash
# Create production build
npm run build

# This creates optimized files in build/ directory
# Serve with any static file server
```

#### **Deploy to Netlify/Vercel**
```bash
# Install deployment tools
npm install -g netlify-cli
# OR
npm install -g vercel

# Deploy
netlify deploy --prod --dir=build
# OR
vercel --prod
```

### **Environment Variables for Production**
```env
# Backend (.env)
GOOGLE_API_KEY=your_production_api_key
FLASK_ENV=production
FLASK_DEBUG=False

# Frontend (.env.production)
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENV=production
```

---

## ✅ Installation Verification

### **Complete System Test**

1. **Start both servers** (backend on :5000, frontend on :3000)
2. **Open browser** to `http://localhost:3000`
3. **Register new user** - Test authentication system
4. **Create learning topic** - Test roadmap generation
5. **Generate AI content** - Test Google AI integration
6. **Complete a quiz** - Test quiz functionality
7. **Check profile** - Test progress tracking
8. **Change avatar style** - Test avatar system

### **Success Indicators**
✅ Both servers start without errors  
✅ Frontend loads at http://localhost:3000  
✅ User registration/login works  
✅ Roadmap generation completes  
✅ AI content generation works  
✅ Progress tracking functions  
✅ Avatar system responds  

---

## 📞 Support & Resources

### **Documentation**
- **Project Documentation**: `PROJECT_DOCUMENTATION.md`
- **API Documentation**: Available endpoints in backend code
- **Component Documentation**: Inline code comments

### **External Resources**
- **React Documentation**: https://reactjs.org/docs
- **Flask Documentation**: https://flask.palletsprojects.com/
- **Google AI Documentation**: https://ai.google.dev/docs

### **Common Commands Reference**
```bash
# Backend commands
cd backend
humanaize\Scripts\activate  # Windows
source humanaize/bin/activate  # macOS/Linux
python base.py
pip install -r requirements.txt

# Frontend commands  
npm install
npm start
npm run build
npm test

# Git commands
git clone <repository>
git pull origin main
git status
git add .
git commit -m "message"
git push origin main
```

---

**Installation Complete!** 🎉

Your AI Personalized Learning Platform should now be running successfully. If you encounter any issues, refer to the troubleshooting section or check the project documentation.

**Next Steps:**
1. Create your first user account
2. Generate a learning roadmap
3. Explore the AI-powered content generation
4. Track your learning progress

---

*Last Updated: August 8, 2025*  
*Version: 1.0.0*
