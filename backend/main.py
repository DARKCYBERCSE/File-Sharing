from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os, uuid, sqlite3, time, hashlib, secrets, io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2.service_account import Credentials
import json
from google.oauth2.service_account import Credentials

service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON"))
creds = Credentials.from_service_account_info(service_account_info, scopes=SCOPES)

# ----------------------------
# Config
# ----------------------------
app = FastAPI(title="File Sharing Online - Backend")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "files.db")

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "service_account.json")  # download from Google Cloud
FOLDER_ID = "1ACYVSr9fOVWb2o3nehEytyxB7ZEF1-ip"  # replace with your Drive folder ID

creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=creds)

# ----------------------------
# SQLite setup
# ----------------------------
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cur = conn.cursor()
cur.execute("""CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT,
    size INT,
    uploaded_at INT,
    expire_at INT,
    mime TEXT,
    drive_id TEXT,
    drive_link TEXT
)""")
cur.execute("""CREATE TABLE IF NOT EXISTS shares (
    token TEXT PRIMARY KEY,
    file_id TEXT,
    expires_at INT,
    password_hash TEXT,
    downloads INTEGER DEFAULT 0
)""")
conn.commit()

def now_ts():
    return int(time.time())

# ----------------------------
# Endpoints
# ----------------------------

@app.post("/upload")
async def upload(file: UploadFile, expire_hours: int = Form(24)):
    """Upload file to Google Drive with expiry."""
    file_id = str(uuid.uuid4())
    safe_name = file.filename.replace("/", "_")

    # Upload to Google Drive
    media = MediaIoBaseUpload(io.BytesIO(await file.read()), mimetype=file.content_type, resumable=True)
    uploaded_file = drive_service.files().create(
        body={"name": safe_name, "parents": [FOLDER_ID]},
        media_body=media,
        fields="id, webViewLink, size"
    ).execute()

    drive_id = uploaded_file["id"]
    drive_link = uploaded_file["webViewLink"]
    size = int(uploaded_file.get("size", 0))
    uploaded_at = now_ts()
    expire_at = uploaded_at + int(expire_hours) * 3600

    cur.execute(
        "INSERT INTO files VALUES (?,?,?,?,?,?,?,?)",
        (file_id, safe_name, size, uploaded_at, expire_at, file.content_type, drive_id, drive_link)
    )
    conn.commit()

    return {
        "file_id": file_id,
        "filename": safe_name,
        "size": size,
        "expires_at": expire_at,
        "download_url": f"/download/{file_id}",
        "drive_link": drive_link
    }

@app.post("/share")
async def create_share(file_id: str = Form(...), hours: int = Form(24), password: str = Form(None)):
    """Create a share link with optional password."""
    cur.execute("SELECT id FROM files WHERE id=?", (file_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="file not found")

    token = secrets.token_urlsafe(12)
    expires_at = now_ts() + int(hours) * 3600
    password_hash = hashlib.sha256(password.encode()).hexdigest() if password else None

    cur.execute("INSERT INTO shares VALUES (?,?,?,?,?)", (token, file_id, expires_at, password_hash, 0))
    conn.commit()

    return {"share_url": f"/s/{token}", "token": token, "expires_at": expires_at}

@app.get("/s/{token}")
async def public_share(token: str, password: str = None):
    """Access a share link."""
    cur.execute("SELECT file_id, expires_at, password_hash, downloads FROM shares WHERE token=?", (token,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="share not found")

    file_id, expires_at, password_hash, downloads = row
    if now_ts() > expires_at:
        raise HTTPException(status_code=410, detail="share expired")

    if password_hash:
        if not password:
            raise HTTPException(status_code=401, detail="password required")
        if hashlib.sha256(password.encode()).hexdigest() != password_hash:
            raise HTTPException(status_code=403, detail="wrong password")

    # increment downloads
    cur.execute("UPDATE shares SET downloads = downloads + 1 WHERE token=?", (token,))
    conn.commit()

    cur.execute("SELECT drive_link FROM files WHERE id=?", (file_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="file not found")
    drive_link = row[0]

    return JSONResponse(content={"download_url": drive_link})

@app.get("/download/{file_id}")
async def download(file_id: str):
    """Get direct download link from Google Drive."""
    cur.execute("SELECT filename, drive_link, expire_at FROM files WHERE id=?", (file_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="file not found")

    filename, drive_link, expire_at = row
    if now_ts() > expire_at:
        raise HTTPException(status_code=410, detail="link expired")

    return {"download_url": drive_link}

@app.get("/files")
async def list_files():
    """List all uploaded files."""
    cur.execute("SELECT id, filename, size, uploaded_at, expire_at, mime, drive_link FROM files ORDER BY uploaded_at DESC")
    rows = cur.fetchall()
    items = []
    for r in rows:
        items.append({
            "id": r[0],
            "name": r[1],
            "size": f"{r[2] / (1024*1024):.2f} MB",
            "uploaded_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(r[3])),
            "expire_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(r[4])),
            "mime": r[5],
            "link": r[6]
        })
    return items

@app.get("/health")
async def health():
    return {"status": "ok"}
