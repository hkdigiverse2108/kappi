"""
Starts the Kapee backend (FastAPI) and frontend (Vite) together in this terminal.

    python start.py

First run also creates backend/venv and installs packages. Press Ctrl+C to stop both.
"""
import os
import subprocess
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
IS_WINDOWS = os.name == "nt"
VENV_PYTHON = BACKEND_DIR / "venv" / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")


def setup_backend():
    if VENV_PYTHON.exists():
        return
    print("Creating backend venv...")
    subprocess.run([sys.executable, "-m", "venv", str(BACKEND_DIR / "venv")], check=True)
    subprocess.run(
        [str(VENV_PYTHON), "-m", "pip", "install", "-r", str(BACKEND_DIR / "requirements.txt")],
        check=True,
    )


def setup_frontend():
    if (FRONTEND_DIR / "node_modules").exists():
        return
    print("Installing frontend packages...")
    subprocess.run("npm install", cwd=FRONTEND_DIR, shell=True, check=True)


def start(name, cmd, cwd, shell=False):
    # The backend uses the venv's python directly, so the venv is active without activating it
    process = subprocess.Popen(
        cmd, cwd=cwd, shell=shell,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding="utf-8", errors="replace", bufsize=1,
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
    )

    def stream():
        for line in process.stdout:
            print(f"[{name}] {line}", end="", flush=True)

    threading.Thread(target=stream, daemon=True).start()
    return process


def stop(process):
    if process.poll() is not None:
        return
    if IS_WINDOWS:
        # npm and uvicorn --reload start child processes, so kill the whole tree
        subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], capture_output=True)
    else:
        process.terminate()


def main():
    setup_backend()
    setup_frontend()

    processes = [
        start("backend", [str(VENV_PYTHON), "run.py"], BACKEND_DIR),
        start("frontend", "npm run dev", FRONTEND_DIR, shell=True),
    ]
    print("Backend and frontend starting... press Ctrl+C to stop both.")

    try:
        # If either one stops, stop the other too
        while all(p.poll() is None for p in processes):
            threading.Event().wait(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        print("\nStopping backend and frontend...")
        for p in processes:
            stop(p)


if __name__ == "__main__":
    main()
