@echo off
echo Setting up Backend with Python 3.12...
cd backend

REM Use a new environment name to avoid conflicts with the broken 3.14 venv
if not exist "backend_env" (
    echo Creating fresh virtual environment backend_env...
    py -3.12 -m venv backend_env
)

echo Activating virtual environment...
call backend_env\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt
pip install onnxruntime

echo Starting Server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
