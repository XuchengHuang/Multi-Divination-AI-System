# Multi-Divination AI System (多元占卜AI系統)

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-latest-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-blue.svg)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini%20API-@google/genai-orange.svg)](https://developers.generativeai.google/)

Multi-Divination AI System is an innovative web application designed to provide users with personalized insights through a variety of esoteric disciplines. Powered by the Google Gemini API, this system offers a unique blend of traditional divination methods and modern AI capabilities, delivering both individual analyses and a comprehensive, integrated report. Users can also engage in a supportive chat with an AI companion, Aura, to discuss their results.

## ✨ Features

**Multi-Method Divination:**
- **生命数字 (Life Path Number):** Uncover core essence from birth date.
- **手相 (Palmistry):** Interpret palm features from an uploaded image.
- **占星 (Astrology):** Explore celestial influences from birth details.
- **MBTI 性格分析 (MBTI Personality Analysis):** Understand personality type through a quick quiz or manual input.
- **塔羅牌 (Tarot):** Seek guidance via an interactive card draw based on a user's question.

**Guided User Journey:**
- **Welcome Screen:** Collects user's name and primary question/focus.
- **Method Selection:** Allows users to choose one or more divination techniques.
- **Sequential Inputs:** Guides users step-by-step through the data entry for each selected method.

**AI-Powered Reports:**
- **Individual Reports:** Detailed analysis for each chosen divination method.
- **Integrated Comprehensive Report:** A synthesized overview combining insights from all selected methods, identifying themes, synergies, and offering actionable advice.
- **Character Archetypes:** Fun, movie/TV-style character tags generated based on the integrated report.
- **Grounding Sources:** Displays web sources used by the AI if Google Search grounding is activated for certain queries.

**Interactive AI Chat:**
- Chat with "Aura," an AI companion, to discuss and explore the generated reports in a supportive environment.

**User Experience:**
- Responsive design for various screen sizes.
- Loading states and error messages for a smooth experience.
- Visually appealing interface with Tailwind CSS.
- Interactive elements for MBTI quiz and Tarot card drawing.

**Offline Functionality:** While API calls require connectivity, the core UI and previously fetched data (if cached by the browser) might be partially accessible. True offline report generation is not a feature.

**Accessibility:** Semantic HTML and ARIA attributes (where applicable) are used to enhance accessibility.

## 🏗️ Project Structure
This project follows a decoupled frontend-backend architecture, with React + TypeScript for the frontend and FastAPI + Python for the backend.

```
Multi-Divination-AI-System/
├── Multi-Divination-AI-System-backend/          # Python Backend
│   ├── main.py                                  # FastAPI application entry point
│   ├── config.py                                # Configuration file
│   ├── database.py                              # Database configuration
│   ├── models.py                                # SQLAlchemy data models
│   ├── schemas.py                               # Pydantic schemas
│   ├── constants.py                             # Constants definition
│   ├── init_testuser.py                         # Test user initialization
│   ├── requirements.txt                         # Python dependencies
│   ├── Dockerfile                               # Docker configuration
│   ├── .env                                     # Environment variables (local, not tracked)
│   ├── .dockerignore                            # Docker ignore file
│   ├── divination.db                            # SQLite database (not tracked)
│   ├── __pycache__/                             # Python cache (not tracked)
│   ├── .venv/                                   # Virtual environment (not tracked)
│   ├── routers/                                 # API route modules
│   │   └── *.py                                 # Various API route files
│   └── services/                                # Business logic services
│       └── *.py                                 # Various service modules
└── Multi-Divination-AI-System-frontend/        # React Frontend
    ├── public/
    │   └── (Static assets if any, though currently minimal)
    ├── src/
    │   ├── components/                          # React UI components
    │   │   ├── icons/                           # SVG icon components
    │   │   ├── AstrologyInput.tsx
    │   │   ├── ChatInterface.tsx
    │   │   ├── DivinationMethodSelector.tsx
    │   │   ├── ErrorMessage.tsx
    │   │   ├── Header.tsx
    │   │   ├── LifePathNumberInput.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── MBTIInput.tsx
    │   │   ├── PalmistryInput.tsx
    │   │   ├── ReportDisplay.tsx
    │   │   ├── TarotInput.tsx
    │   │   └── WelcomeScreen.tsx
    │   ├── services/
    │   │   └── geminiService.ts                 # Logic for interacting with Google Gemini API
    │   ├── App.tsx                              # Main application component, manages state and flow
    │   ├── constants.ts                         # Application-wide constants (e.g., method names, MBTI questions)
    │   ├── index.tsx                            # Entry point for React application
    │   └── types.ts                             # TypeScript type definitions and enums
    ├── .env.example                             # Example for API key (API_KEY must be set in actual environment)
    ├── index.html                               # Main HTML file
    ├── metadata.json                            # Application metadata
    ├── package.json                             # Project dependencies and scripts (conceptual, as using esm.sh)
    └── README.md                                
```
## 📂 Directory Overview

### Frontend (Multi-Divination-AI-System-frontend)
| File/Directory | Description |
|------|-------------|
| `AstrologyInput.tsx` | Astrology input component |
| `ChatInterface.tsx` | Chat interface component |
| `DivinationMethodSelector.tsx` | Divination method selector component |
| `ErrorMessage.tsx` | Error message component |
| `Header.tsx` | Header component |
| `LifePathNumberInput.tsx` | Life path number input component |
| `LoadingSpinner.tsx` | Loading spinner component |
| `MBTIInput.tsx` | MBTI input component |
| `PalmistryInput.tsx` | Palmistry input component |
| `ReportDisplay.tsx` | Report display component |
| `TarotInput.tsx` | Tarot input component |
| `WelcomeScreen.tsx` | Welcome screen component |
| `geminiService.ts` | Logic for interacting with Google Gemini API |
| `App.tsx` | Main application component, manages state and flow |
| `constants.ts` | Application-wide constants (e.g., method names, MBTI questions) |
| `index.tsx` | Entry point for React application |
| `types.ts` | TypeScript type definitions and enums |
| `.env.example` | Example for API key |
| `index.html` | Main HTML file |
| `metadata.json` | Application metadata |
| `package.json` | Project dependencies and scripts (conceptual, as using esm.sh) |
| `README.md` | This file |


### Backend (Multi-Divination-AI-System-backend)

| File/Directory | Description |
|----------------|-------------|
| `main.py` | FastAPI application entry point with startup logic |
| `config.py` | Application configuration management and environment variables |
| `database.py` | Database connection and session management |
| `models.py` | SQLAlchemy ORM data model definitions |
| `schemas.py` | Pydantic data validation and serialization schemas |
| `constants.py` | Application constants and enum definitions |
| `init_testuser.py` | Database initialization and test user creation script |
| `routers/` | API route modules organized by functionality |
| `services/` | Business logic layer handling core functionality |


## 🔧 Tech Stack

**Frontend:**
- React 19 (using Hooks and Functional Components)
- TypeScript
- ESM imports via esm.sh for direct browser module loading (React, ReactDOM, @google/genai)
- Tailwind CSS for styling

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM for database operations)
- Pydantic (data validation and serialization)
- SQLite (development) / PostgreSQL (production recommended)
- Python 3.8+

**AI & Integration:**
- Google Gemini API integration for AI-powered divination
- RESTful API architecture for frontend-backend communication
- JSON-based data exchange
- Async/await patterns for API calls

**Environment (Current State):**
  - Runs entirely in the browser, relying on a pre-configured `process.env.API_KEY` for Gemini API access.

**Development & Deployment:**
- Docker containerization for both frontend and backend
- Nginx for production frontend serving
- Environment-based configuration management
- Hot reload development environment


## 🛢️ Database Architecture & Models

The backend utilizes SQLAlchemy ORM with a comprehensive relational database design supporting multi-divination functionality, user management, and AI-powered insights.

**Key Features:**
- Multi-provider authentication system with role-based access control
- Persona-based readings for personalized divination experiences
- Integrated analysis capability combining multiple divination methods
- Comprehensive chat system with AI personality and context preservation
- Flexible subscription management with multiple payment providers
- Optimized indexing for performance across all query patterns
- JSON fields for storing complex AI-generated data and metadata

#### Core Tables Structure

**Users Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `username` | String(255) | Unique username, nullable for social auth |
| `email` | String(255) | Unique email address |
| `hashed_password` | String(255) | Bcrypt hashed password |
| `display_name` | String(255) | User's display name |
| `google_id` | String(255) | Google OAuth ID |
| `auth_provider` | Enum | Authentication method (google/email/guest) |
| `role` | Enum | User role (free/premium/admin) |
| `is_active` | Boolean | Account status |
| `is_verified` | Boolean | Email verification status |
| `profile_picture` | String(500) | Avatar URL |
| `bio` | Text | User biography |
| `birth_date` | DateTime | Birth date for astrology |
| `timezone` | String(50) | User timezone |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last update timestamp |
| `last_login_at` | DateTime | Last login timestamp |

**Personas Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `user_id` | Integer (FK) | Reference to users table |
| `display_name` | String(255) | Persona name |
| `description` | Text | Persona description |
| `birth_date` | DateTime | Birth date for divination |
| `birth_time` | String(10) | Birth time (HH:MM format) |
| `birth_location` | String(255) | Birth location |
| `gender` | String(20) | Gender information |
| `character_archetypes` | JSON | AI-generated character tags |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**Readings Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `user_id` | Integer (FK) | Reference to users table |
| `persona_id` | Integer (FK) | Reference to personas table |
| `method` | Enum | Divination method (LifePathNumber/Palmistry/Astrology/MBTI/Tarot/Integrated) |
| `main_question` | Text | User's main question |
| `output_text` | Text | AI-generated reading result |
| `input_data` | JSON | Raw input data from user |
| `status` | Enum | Processing status (pending/processing/completed/failed) |
| `ai_model_used` | String(100) | AI model identifier |
| `processing_time` | Integer | Processing time in seconds |
| `confidence_score` | Integer | AI confidence score (1-100) |
| `is_favorite` | Boolean | User favorite flag |
| `user_rating` | Integer | User rating (1-5) |
| `user_feedback` | Text | User feedback text |
| `is_public` | Boolean | Public sharing flag |
| `sharing_token` | String(100) | Unique sharing token |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**Reading Sources Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `integrated_reading_id` | Integer (FK) | Reference to integrated reading |
| `source_reading_id` | Integer (FK) | Reference to source reading |
| `weight` | Integer | Weight in integrated analysis |
| `created_at` | DateTime | Creation timestamp |

**Chat Sessions Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `user_id` | Integer (FK) | Reference to users table |
| `title` | String(255) | Chat session title |
| `session_type` | Enum | Session type (general/reading_discussion/guidance) |
| `related_reading_id` | Integer (FK) | Related reading reference |
| `persona_id` | Integer (FK) | Related persona reference |
| `is_active` | Boolean | Active session flag |
| `is_archived` | Boolean | Archived session flag |
| `ai_personality` | String(50) | AI assistant personality |
| `context_data` | JSON | Session context data |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |
| `last_message_at` | DateTime | Last message timestamp |

**Chat Messages Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `session_id` | Integer (FK) | Reference to chat sessions |
| `content` | Text | Message content |
| `is_user_message` | Boolean | User vs AI message flag |
| `message_type` | String(50) | Message type (text/image/file) |
| `message_metadata` | JSON | Additional message metadata |
| `user_reaction` | String(20) | User reaction (like/dislike/love) |
| `is_edited` | Boolean | Message edited flag |
| `created_at` | DateTime | Creation timestamp |
| `edited_at` | DateTime | Edit timestamp |

**Subscriptions Table**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Primary key, auto-increment |
| `user_id` | Integer (FK) | Reference to users table |
| `tier` | Enum | Subscription tier (free/basic/premium/lifetime) |
| `status` | Enum | Subscription status (active/cancelled/expired/pending) |
| `start_date` | DateTime | Subscription start date |
| `end_date` | DateTime | Subscription end date |
| `trial_end_date` | DateTime | Trial period end date |
| `payment_provider` | Enum | Payment provider (stripe/paypal/alipay/wechat) |
| `external_subscription_id` | String(255) | External subscription ID |
| `price_paid` | Decimal(10,2) | Amount paid |
| `currency` | String(3) | Currency code |
| `monthly_reading_limit` | Integer | Monthly reading limit |
| `current_monthly_usage` | Integer | Current month usage |
| `auto_renew` | Boolean | Auto-renewal flag |
| `next_billing_date` | DateTime | Next billing date |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |
| `cancelled_at` | DateTime | Cancellation timestamp |

## ⚙️ Setup and Running (Frontend)
This application is designed to run directly in the browser using ES modules and requires no separate build step for its frontend dependencies if served correctly.

### 1. API Key Configuration:

- The application **requires** a Google Gemini API key.
- This key **must** be available as an environment variable named `API_KEY` in the execution context where the application is served or run.
- **Crucially,** `process.env.API_KEY` is accessed directly in the code. You need to ensure this variable is defined. For local development, one way is to use a tool that injects environment variables when serving static files, or by manually replacing `process.env.API_KEY` in `geminiService.ts` before serving (not recommended for production).
- Create a `.env` file (if your serving mechanism supports it) with your API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```
### 2. Serving the Application:

- You need a simple HTTP server to serve `index.html` and the associated `.tsx` files. Browsers restrict `file://` access for ES modules and API calls.
- One common way is to use `live-server` (install via `npm install -g live-server`):

   ```bash
   live-server .
   ```

- Or Python's built-in HTTP server (Python 3):

   ```bash
   python -m http.server
   ```

- Navigate to the local address provided by the server (e.g., `http://localhost:8080` or `http://localhost:8000`).

### 3. Dependencies:

- Frontend dependencies (React, @google/genai) are loaded directly via CDN (`esm.sh`) as specified in `index.html`'s `importmap`. No `npm install` is strictly necessary for these to run in the browser once the API key is handled.



## ⚙️ ️Setup and Running (Backend - Python FastAPI)

This FastAPI backend application requires Python environment setup and database configuration for local development.

### 1. Python Virtual Environment Setup:

- Create a Python virtual environment to isolate dependencies:
    ```
    python -m venv .venv
    ```
- activate the virtual environment:

    **Windows:**
    ```
    .venv\Scripts\activate
    ```
    
    **macOS/Linux:**
    ```
    source .venv/bin/activate
    ```
    
    
### 2. Install Dependencies:
- Install required Python packages from requirements.txt:
    ```
    pip install -r requirements.txt
    ```
    
### 3. Environment Configuration:
- Create a .env file in the backend root directory with the following content:
    ```
    # Local development environment configuration
    ENVIRONMENT=development
    DEBUG=true

    # Application basic settings
    APP_NAME=Multi-Divination-AI-System-Backend
    VERSION=1.0.0

    # Database settings (using SQLite locally)
    DATABASE_URL=sqlite:///./divination.db
    
    # Authentication settings (local development secret key)
    SECRET_KEY=your-local-development-secret-key-change-this-in-production
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    
    # CORS settings (local frontend addresses)
    ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8080","http://127.0.0.1:3000","http://127.0.0.1:8080"]
    ```
### 4. Database Initialization: 
- Initialize the database and create test user:
    ```
    python init_testuser.py
    ```
- **Note:** This step is for the local database test if you have not create your SQL database on Google Cloud Platform


### 5. Running the Backend Server:
- Start the FastAPI development server:
    ```
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
- The server will start on http://localhost:8000
- API documentation will be available at http://localhost:8000/docs (Swagger UI)
- Alternative documentation at http://localhost:8000/redoc


## 🚀Deployment-backend (Google Cloud Platform)
Complete deployment guide for Google Cloud Platform using Cloud SQL and Cloud Run. (The relevent Dockerfiles is provided). In this part, the backend will be deployed first!!!

### 1. Setup Project Variables:
```
export PROJECT_ID="YOUR_PROJECT_ID"
export REGION="us-central1"  
export INSTANCE_NAME="YOUR_DB_INSTANCE_NAME"
export DATABASE_NAME="YOUR_DATABASE_NAME" 
export DB_USER="YOUR_DB_USER"
export DB_PASSWORD="YOUR_SECURE_PASSWORD"
export SERVICE_NAME="YOUR_SERVICE_NAME"
```
### 2. Configure Default Project:
```
gcloud config set project $PROJECT_ID
```

### 3. Enable Required APIs:
```
gcloud services enable \
    sqladmin.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com
```

### 4. Create Cloud SQL PostgreSQL Instance:
```
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password=$DB_PASSWORD \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time=03:00
```

### 5. Create Database and User:
```
gcloud sql databases create $DATABASE_NAME \
    --instance=$INSTANCE_NAME

gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD
```

### 6. Get Database Connection Information:
```
echo "=== Database Connection Information ==="
echo "Connection Name: $PROJECT_ID:$REGION:$INSTANCE_NAME"
gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)"
```

### 7. Build and Push Docker Image:
```
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
```
### 8. Deploy to Cloud Run:
```
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8000 \
    --set-env-vars ENVIRONMENT=production \
    --set-env-vars DEBUG=false \
    --set-env-vars DB_HOST=/cloudsql/$PROJECT_ID:$REGION:$INSTANCE_NAME \
    --set-env-vars DB_NAME=$DATABASE_NAME \
    --set-env-vars DB_USER=$DB_USER \
    --set-env-vars DB_PASSWORD=$DB_PASSWORD \
    --set-env-vars SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY \
    --set-env-vars APP_NAME="Multi-Divination-AI-System-Backend" \
    --set-env-vars VERSION="1.0.0" \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$INSTANCE_NAME
```

### 9. Check Deployment Status:
```
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
```

## 🚀Deployment-frontend (Google Cloud Platform)
- **Note:** Please make sure you have finished the backend deployment!

### 1. Local Build with Platform Specification:
```
docker build \
    --platform linux/amd64 \
    --build-arg GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
    --build-arg BACKEND_URL="https://YOUR_BACKEND_URL.us-central1.run.app" \
    -t gcr.io/YOUR_PROJECT_ID/YOUR_FRONTEND_SERVICE_NAME .
```

### 2. Push to Google Container Registry:
```
docker push gcr.io/YOUR_PROJECT_ID/YOUR_FRONTEND_SERVICE_NAME
```

### 3. Deploy to Cloud Run:
```gcloud run deploy YOUR_FRONTEND_SERVICE_NAME \
    --image gcr.io/YOUR_PROJECT_ID/YOUR_FRONTEND_SERVICE_NAME \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 80 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10
```

## 📝 Important Notes

**Files Not Under Version Control:**
- `.env` / `.env.local` - Contains sensitive configuration
- `divination.db` - Local SQLite database file
- `node_modules/` - Node.js dependencies
- `dist/` - Frontend build output
- `__pycache__/` - Python bytecode cache
- `.venv/` - Python virtual environment

**Docker Support:**
- Both frontend and backend include complete Docker configurations
- Supports containerized deployment and development environments