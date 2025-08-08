<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Personalized Learning Platform

This is a full-stack web application with:
- **Frontend**: React.js application using React Router, Chart.js for visualizations, and various UI libraries
- **Backend**: Flask API server using Google's Generative AI (Gemini) for creating personalized learning roadmaps
- **Features**: Personalized learning paths, progress tracking, quiz generation, and resource recommendations

## Project Structure
- `/src` - React frontend components and pages
- `/backend` - Flask API server with AI integration
- `/public` - Static assets and images

## Development Notes
- The backend uses Google Gemini API for AI-powered content generation
- Frontend communicates with backend via proxy configuration on localhost:5000
- Python virtual environment is located in `backend/humanaize/`
- Environment variables are stored in `backend/.env`

## Key Technologies
- React.js, React Router, Chart.js, Axios
- Flask, Flask-CORS, Google Generative AI
- Python virtual environment management
