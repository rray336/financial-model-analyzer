# Initialization
pip install -r requirements.txt

#To install fastapi
pip install fastapi uvicorn python-multipart
 

# To start the server - the reload option makes it auto-restart on code changes
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

In theory you can run with but need to make edits to the code (which haven't been done) 
python backend/app/main.py



http://localhost:8000