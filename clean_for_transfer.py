import os
import shutil
from pathlib import Path

def clean_project(project_root):
    print("="*50)
    print("Cleaning project for transfer/zipping...")
    print("="*50)

    # Directories to remove
    dirs_to_remove = [
        "node_modules",
        "frontend/node_modules",
        "backend/.venv",
        ".venv",
        "backend/__pycache__",
        "frontend/dist",
        "frontend/build"
    ]
    
    # Extensions/files to remove
    extensions_to_remove = [".pyc", ".pyo", ".log"]

    root = Path(project_root)

    # Remove specified directories
    for d in dirs_to_remove:
        dir_path = root / d
        if dir_path.exists() and dir_path.is_dir():
            print(f"Removing directory: {dir_path}")
            shutil.rmtree(dir_path, ignore_errors=True)

    # Remove pycache everywhere
    for pycache in root.rglob('__pycache__'):
        print(f"Removing __pycache__: {pycache}")
        shutil.rmtree(pycache, ignore_errors=True)

    # Remove specific file types
    for ext in extensions_to_remove:
        for file in root.rglob(f'*{ext}'):
            print(f"Removing file: {file}")
            file.unlink(missing_ok=True)

    print("="*50)
    print("Cleanup complete! The project is now lightweight and ready to be transferred.")
    print("Remember to run 'npm install' (frontend) and 'pip install -r requirements.txt' (backend) on the new system.")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    clean_project(current_dir)
