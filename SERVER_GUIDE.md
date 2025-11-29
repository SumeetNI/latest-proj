# Server Management Guide

This guide explains how to start and stop the development servers for your Water Consumption Forecasting project.

## Frontend Server (React + Vite)

### Starting the Frontend Server

1. **Open a terminal** in your project directory: `s:\MajorProject(Latest)`

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - The server will start and display a URL (typically `http://localhost:5173` or `http://localhost:3000`)
   - Open this URL in your browser to view the application

### Stopping the Frontend Server

**Method 1: Using Ctrl+C**
- In the terminal where the server is running, press `Ctrl + C`
- This will gracefully stop the development server

**Method 2: Close the Terminal**
- Simply close the terminal window
- The server process will terminate automatically

---

## Backend Server (Python Flask)

> **Note:** Based on your project history, you have a Python Flask backend for ML predictions and chat functionality.

### Starting the Backend Server

1. **Navigate to your backend directory** (if separate from frontend)

2. **Activate the Python virtual environment:**
   ```bash
   # On Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Or on Windows Command Prompt
   .\venv\Scripts\activate.bat
   ```

3. **Run the Flask server:**
   ```bash
   python app.py
   ```
   Or:
   ```bash
   flask run
   ```

4. **The backend will typically run on:**
   - `http://localhost:5000`

### Stopping the Backend Server

**Method 1: Using Ctrl+C**
- In the terminal where the Flask server is running, press `Ctrl + C`
- This will stop the Flask development server

**Method 2: Close the Terminal**
- Close the terminal window running the backend

---

## Quick Reference

### Current Status
- **Frontend**: Currently running at `http://localhost:3000`
- **Backend**: Not currently running

### Common Commands

| Action | Command |
|--------|---------|
| Start frontend | `npm run dev` |
| Stop frontend | `Ctrl + C` in terminal |
| Start backend | `python app.py` (after activating venv) |
| Stop backend | `Ctrl + C` in terminal |
| Check running processes | `netstat -ano \| findstr :3000` (frontend)<br>`netstat -ano \| findstr :5000` (backend) |

---

## Tips

1. **Keep terminals open**: Don't close the terminal windows while servers are running
2. **Multiple terminals**: You'll need separate terminals for frontend and backend
3. **Port conflicts**: If you get a "port already in use" error, stop the existing server first
4. **Auto-restart**: The Vite dev server automatically reloads when you save files
5. **Environment variables**: Make sure your `.env` file is configured if using API keys (like Gemini AI)

---

## Troubleshooting

### Frontend won't start
- Check if `node_modules` exists (run `npm install` if not)
- Check if another process is using the port
- Try a different port: `npm run dev -- --port 3001`

### Backend won't start
- Ensure virtual environment is activated
- Check if required packages are installed: `pip install -r requirements.txt`
- Verify Python version compatibility
- Check if port 5000 is already in use

### Both servers needed?
- **Yes**, if you're using ML predictions, chat features, or any backend API
- **Frontend only** works for static UI testing without backend features
