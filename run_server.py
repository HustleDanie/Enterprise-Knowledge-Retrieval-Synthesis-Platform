# Launches uvicorn in a separate process group to avoid Windows signal issues.
import sys
import os
import asyncio
import subprocess

if __name__ == "__main__":
    # Launch uvicorn in a new process group so VS Code terminal signals
    # do not reach it.
    env = os.environ.copy()

    cmd = [
        sys.executable, "-c",
        (
            "import asyncio, sys;"
            "asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy());"
            "import uvicorn;"
            "uvicorn.run('src.main:app', host='0.0.0.0', port=8000, log_level='info', http='h11')"
        ),
    ]

    CREATE_NEW_PROCESS_GROUP = 0x00000200
    try:
        proc = subprocess.Popen(
            cmd,
            cwd=os.path.dirname(os.path.abspath(__file__)) or ".",
            env=env,
            creationflags=CREATE_NEW_PROCESS_GROUP,
            stdout=sys.stdout,
            stderr=sys.stderr,
        )
        proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        proc.terminate()
        proc.wait(timeout=10)
