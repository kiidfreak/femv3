# Faith Connect

Faith Connect is a premier faith-based commerce and directory platform designed to connect the Christian community with trusted businesses and services. Our platform fosters trust, transparency, and growth for Kingdom-minded entrepreneurs.

## 🚀 Features

*   **Trusted Directory**: Discover businesses reviewed and verified by the community.
*   **Business Dashboard**: Comprehensive tools for business owners to manage their profile, products, services, and analytics.
*   **Verification System**: Multi-level verification (Phone, Email, Church) to ensure authenticity.
*   **Review System**: Robust review mechanism with checks to prevent self-reviews and ensure integrity.
*   **Interactive Onboarding**: Smooth, step-by-step onboarding flow for new businesses.
*   **Role-Based Access**: Specialized views for Community Members, Business Owners, and Admins.

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

## 📄 License

This project is proprietary and confidential. Unauthorized copying of files via any medium is strictly prohibited.
