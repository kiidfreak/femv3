# Faith Connect v3 - Docker Deployment

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- `.env` file configured (see `.env.example`)

### Production Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Services

### Backend (Django)
- **Port:** 8000
- **URL:** http://localhost:8000/api/v3/
- **Admin:** http://localhost:8000/admin/

### Frontend (Next.js)
- **Port:** 3000
- **URL:** http://localhost:3000

### Nginx (Reverse Proxy)
- **Port:** 80 (HTTP), 443 (HTTPS)
- **URL:** http://localhost

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Railway PostgreSQL connection
- `SECRET_KEY` - Django secret key
- `BREVO_API_KEY` - Email service
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - S3 storage

### Database Migrations

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## 🛠️ Development

### Build individual services

```bash
# Backend only
docker-compose up backend

# Frontend only
docker-compose up frontend
```

### Access containers

```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh
```

### Rebuild after code changes

```bash
docker-compose up -d --build --force-recreate
```

## 📊 Health Checks

Services include health checks:
- Backend: `http://localhost:8000/api/v3/`
- Frontend: `http://localhost:3000/`

## 🔒 Production Security

1. **Update `.env`:**
   - Change `SECRET_KEY`
   - Set `DEBUG=False`
   - Configure `ALLOWED_HOSTS`

2. **SSL/TLS:**
   - Add certificates to `nginx/certs/`
   - Update nginx config for HTTPS

3. **Database:**
   - Secure Railway database credentials
   - Use connection pooling

## 📝 Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🧹 Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## 🚨 Troubleshooting

### Port conflicts
If ports 80, 3000, or 8000 are in use:
```bash
# Check what's using the port
netstat -ano | findstr :8000
```

### Database connection issues
- Verify `DATABASE_URL` in `.env`
- Check Railway database is accessible
- Ensure network connectivity

### Build failures
```bash
# Clean rebuild
docker-compose build --no-cache
```

## 📱 Accessing the App

- **Frontend:** http://localhost (via Nginx) or http://localhost:3000
- **Backend API:** http://localhost/api/v3/ or http://localhost:8000/api/v3/
- **Django Admin:** http://localhost/admin/ or http://localhost:8000/admin/
