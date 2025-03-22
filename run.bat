@echo off
echo Starting Web Application Security Audit Tool

echo Starting Django backend...
start cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

echo Starting Next.js frontend...
start cmd /k "cd frontend && npm run dev"

echo Started both servers:
echo Backend running at http://localhost:8000/
echo Frontend running at http://localhost:3000/ 