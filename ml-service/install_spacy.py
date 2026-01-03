#!/usr/bin/env python3
"""
Script to install spaCy model for resume analysis
"""

import subprocess
import sys

def install_spacy_model():
    """Install the required spaCy model"""
    try:
        print("Installing spaCy model 'en_core_web_sm'...")
        
        # Install the model
        result = subprocess.run([
            sys.executable, "-m", "spacy", "download", "en_core_web_sm"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ spaCy model installed successfully!")
            print("You can now run the ML service.")
        else:
            print("❌ Failed to install spaCy model:")
            print(result.stderr)
            print("\nTrying alternative installation method...")
            
            # Alternative method
            result2 = subprocess.run([
                sys.executable, "-m", "pip", "install", "https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl"
            ], capture_output=True, text=True)
            
            if result2.returncode == 0:
                print("✅ spaCy model installed successfully using alternative method!")
            else:
                print("❌ Alternative installation also failed:")
                print(result2.stderr)
                print("\nThe service will work with fallback analysis, but for best results, install the model manually:")
                print("python -m spacy download en_core_web_sm")
                
    except Exception as e:
        print(f"❌ Error during installation: {e}")
        print("\nYou can install manually with:")
        print("python -m spacy download en_core_web_sm")

if __name__ == "__main__":
    install_spacy_model()
