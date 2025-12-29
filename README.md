# Faith Connect

Faith Connect is a premier faith-based commerce and directory platform designed to connect the Christian community with trusted businesses and services. Our platform fosters trust, transparency, and growth for Kingdom-minded entrepreneurs.

## 🚀 Features

*   **Trust-Centric Marketplace**: Church-verified business directory with advanced trust scoring (0-100).
*   **Business Dashboard v2**: Real-time analytics, referral source tracking, and comprehensive business settings (no more mock data).
*   **Media Management**: 
    *   **Banner Uplift**: Custom business profile banners.
    *   **Offering Gallery**: Support for multiple professional images (up to 3) per product or service.
*   **Favorites & Saves**: Cross-platform system to save businesses and individual products/services for later.
*   **Robust Review System**: Secure reviews with product/service tagging and community moderation.
*   **Premium Verification**: Workflow for Church Admin approval and verification badges.
*   **Role-Based Access**: Specialized dashboards for Members, Business Owners, and Church Administrators.

## 🛠️ Technology Stack

### Backend
*   **Framework**: Django REST Framework (Python)
*   **Database**: PostgreSQL
*   **Authentication**: JWT (JSON Web Tokens)
*   **Services**:
    *   **Email**: Brevo (via Anymail)
    *   **SMS**: NdovuBase
    *   **Storage**: AWS S3
*   **Containerization**: Docker & Docker Compose

### Frontend
*   **Framework**: Next.js 14+ (React)           
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI + Radix UI
*   **State Management**: React Hooks & Context
*   **Icons**: Lucide React

## 📦 Prerequisites

*   **Docker Desktop**: For containerized deployment.
*   **Node.js 18+**: For local frontend development.
*   **Python 3.11+**: For local backend development.
*   **Git**: For version control.

## 🚀 Getting Started

### Option 1: Quick Start with Docker (Recommended)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kiidfreak/femv3.git
    cd femv3
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (copy from `.env.example` if available).
    ```bash
    # See 'Environment Variables' section below for required keys
    ```

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    *   Frontend: [http://localhost:3000](http://localhost:3000)
    *   Backend API: [http://localhost:8000/api/v3/](http://localhost:8000/api/v3/)

### Option 2: Manual Local Development

#### Backend Setup
1.  Navigate to `faith_backend`:
    ```bash
    cd faith_backend
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run migrations and start server:
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

#### Frontend Setup
1.  Navigate to `web`:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following keys:

```ini
# CORE
ENVIRONMENT=dev
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=*

# DATABASE
DATABASE_URL=postgresql://user:password@host:port/dbname

# EMAIL (Brevo/Sendinblue)
BREVO_API_KEY=xkeysib-...
DEFAULT_FROM_EMAIL=noreply@faithconnect.biz

# SMS (Ndovubase)
SMS_API_KEY=...
SMS_FROM_NUMBER=Swiftt_OTP

# AWS S3 (Optional for media)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=...
USE_S3=False

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:8000
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feat/amazing-feature`).
3.  Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4.  Push to the branch (`git push origin feat/amazing-feature`).
5.  Open a Pull Request.

## 📈 Recent Technical Updates (v2.1)

*   **Integrity Fix**: Resolved backend `IntegrityError` ensuring `business_id` is always tracked during favorite toggles.
*   **Aesthetic Polish**: Implemented interactive heart icons for all offerings with real-time UI synchronization.
*   **Stability**: Switched to `unoptimized` image loading for external CDNs (CloudFront/S3) to prevent 400/404 errors.
*   **Personalization**: Enhanced Personal Settings allowing users to customize profiles and manage notification preferences.

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of files via any medium is strictly prohibited.
