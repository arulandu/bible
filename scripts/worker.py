import urllib
import requests
import os, subprocess
import json
from pprint import pprint
import sys

mxch, mxv = (10000,10000) if len(sys.argv) <= 2 else (int(sys.argv[4]), int(sys.argv[5]))
stch, stv = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 2 else (1, 1)
book = sys.argv[1]

if stch + stv == 2:
    with open(f"data/{book}.json", "w") as bkf:
        bkf.writelines("{\"book\": \"" + book + "\", \"chapters\":[\n")

for ch in range(stch, mxch):
    chout = ""
    x = "{\"chapter\": " + str(ch) + ", \"verses\":["
    if ch > 1:
        x = "," + x
    
    chout += x

    valid = True
    for verse in range(stv, mxv):
        ref = f"{book} {ch}:{verse}"
        print(ref, end="\n")
        with open(f"tmp/{book}.json", "w") as tmpf:
            ret = subprocess.run(["ruby", "bg2md.rb", ref, "-v", "NRSVCE", "-r", "-n"], stdout=tmpf)
        
        if ret.returncode == 1:
            if verse == 1: valid = False
            break
        elif ret.returncode == 2:
            print("RATE LIMIT", ch, verse, end="\n")
            # chout += json.dump({verse: verse, text: "Hi"})
            exit(1)
            
        try:
            with open(f"tmp/{book}.json", "r") as tmpf:
                l = json.load(tmpf)

            l["text"] = l["verse"]
            l["verse"] = verse
            
            if verse > 1:
                chout += ","

            chout += json.dumps(l)
                
        except Exception as e:
            print(e)
            print(f"FAILED READ {book} {ch}:{verse}")
            # exit(1)
            
    chout += "]}\n"

    if not valid: break

    with open(f"data/{book}.json", "a") as bkf:
        bkf.writelines(chout)

with open(f"data/{book}.json", "a") as bkf:
    bkf.writelines("]}")