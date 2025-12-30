# 🚀 Faith Connect v3 - Railway Deployment Plan

This document outlines the standard procedure for deploying the Faith Connect v3 stack to Railway.app.

---

## 🏗️ Architecture Overview

The platform consists of:
1.  **Backend (Django)**: Python service with PostgreSQL.
2.  **Frontend (Next.js)**: Node.js service (Standalone output).
3.  **PostgreSQL**: Railway Managed Database.
4.  **S3/CloudFront**: Media storage (External).

---

## 🛠️ Step 1: Backend Deployment (Railway Service)

### Config
-   **Root Directory**: `faith_backend`
-   **Build Command**: `pip install -r requirements.txt`
-   **Start Command**: `gunicorn faith_connect_api.wsgi`

### Environment Variables
| Variable | Value/Source |
| :--- | :--- |
| `DATABASE_URL` | `${{Postgres.RAILWAY_PRIVATE_URL}}` |
| `SECRET_KEY` | Generate a secure string |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `*.railway.app, faithconnect.biz` |
| `AWS_ACCESS_KEY_ID` | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | From AWS IAM |
| `SMS_API_KEY` | From Ndovubase |
| `MOCK_SMS` | Set to `True` for testing without real SMS |

---

## 🌐 Step 2: Frontend Deployment (Railway Service)

### Config
-   **Root Directory**: `web`
-   **Build Command**: `npm install && npm run build`
-   **Start Command**: `npm run start` (or `node .next/standalone/server.js`)

### Environment Variables
| Variable | Value/Source |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.railway.app/api/v3` |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | `https://d25pwvs6zlto08.cloudfront.net` |

---

## 🎛️ Admin Access

Once deployed, the primary administrative interface (Django Admin) is available at:

**`https://your-backend-service.railway.app/admin/`**

### 🔑 Seeding the Admin Account
To quickly create a master login on Railway:
1.  Go to the **Railway Console**.
2.  Open the **Backend Service**.
3.  Click on **CMD / Terminal**.
4.  Run: `python manage.py seed_admin`

*Note: This command uses default values if environment variables `ADMIN_PHONE` and `ADMIN_PASSWORD` are not set.*

---

## 📊 Deployment Checklist

1.  [ ] **Migrations**: Ensure `python manage.py migrate` runs on build or via a post-deploy command.
2.  [ ] **CORS**: Ensure `NEXT_PUBLIC_API_URL` is correct so the browser can reach the backend.
3.  [ ] **SSL**: Railway handles SSL automatically.
4.  [ ] **Trust Verification**: Check that admin users have the correct permissions to see the campaigns and verification sections.

---

_Last updated: Dec 2024_
