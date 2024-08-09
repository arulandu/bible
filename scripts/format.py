import os, subprocess, json

with open("../data/raw.json", "r") as f:
    bible = json.load(f)

with open("../data/main.json", "w") as f:
    f.write(json.dumps(bible, indent=1))