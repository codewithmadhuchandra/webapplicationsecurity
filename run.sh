#!/bin/bash
echo "Starting Web Application Security Audit Tool"

echo "Starting Django backend..."
cd backend && source venv/bin/activate && python manage.py runserver &
BACKEND_PID=$!

echo "Starting Next.js frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "Started both servers:"
echo "Backend running at http://localhost:8000/"
echo "Frontend running at http://localhost:3000/"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes and capture signals
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait 