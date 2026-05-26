$ErrorActionPreference = "Stop"
python -m pip install -r "$PSScriptRoot\requirements.txt"
python -m playwright install chromium
