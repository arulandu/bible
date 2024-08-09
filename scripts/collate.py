import os, subprocess
import json

with open("./books.txt", "r") as f:
    books = [s.strip() for s in f.readlines() if len(s.strip()) > 0]

bible = []
for book in books:
    try:
        with open(f"./data/{book}.json", "r") as f:
            bk = json.load(f)
            bible.append(bk)
    except:
        print(book)

with open("bible.json", "w") as f:
    f.write(json.dumps({"bible": bible}))