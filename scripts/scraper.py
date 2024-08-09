import subprocess

with open("./books.txt", "r") as f:
    books = [s.strip() for s in f.readlines() if len(s.strip()) > 0]

for book in books:
    p = subprocess.run(['python', 'worker.py', book])

print(len(books), books)