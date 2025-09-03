
# 多元占卜AI系統 (Multi-Divination AI System)

[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-latest-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini_API-%40google/genai-orange)](https://ai.google.dev/docs/gemini_api_overview)

**多元占卜AI系統** is an innovative web application designed to provide users with personalized insights through a variety of esoteric disciplines. Powered by the Google Gemini API, this system offers a unique blend of traditional divination methods and modern AI capabilities, delivering both individual analyses and a comprehensive, integrated report. Users can also engage in a supportive chat with an AI companion, Aura, to discuss their results.

## ✨ Features

*   **Multi-Method Divination:**
    *   **生命數字 (Life Path Number):** Uncover core essence from birth date.
    *   **手相 (Palmistry):** Interpret palm features from an uploaded image.
    *   **占星 (Astrology):** Explore celestial influences from birth details.
    *   **MBTI 性格分析 (MBTI Personality Analysis):** Understand personality type through a quick quiz or manual input.
    *   **塔羅牌 (Tarot):** Seek guidance via an interactive card draw based on a user's question.
*   **Guided User Journey:**
    *   **Welcome Screen:** Collects user's name and primary question/focus.
    *   **Method Selection:** Allows users to choose one or more divination techniques.
    *   **Sequential Inputs:** Guides users step-by-step through the data entry for each selected method.
*   **AI-Powered Reports:**
    *   **Individual Reports:** Detailed analysis for each chosen divination method.
    *   **Integrated Comprehensive Report:** A synthesized overview combining insights from all selected methods, identifying themes, synergies, and offering actionable advice.
    *   **Character Archetypes:** Fun, movie/TV-style character tags generated based on the integrated report.
    *   **Grounding Sources:** Displays web sources used by the AI if Google Search grounding is activated for certain queries.
*   **Interactive AI Chat:**
    *   Chat with "Aura," an AI companion, to discuss and explore the generated reports in a supportive environment.
*   **User Experience:**
    *   Responsive design for various screen sizes.
    *   Loading states and error messages for a smooth experience.
    *   Visually appealing interface with Tailwind CSS.
    *   Interactive elements for MBTI quiz and Tarot card drawing.
*   **Offline Functionality:** While API calls require connectivity, the core UI and previously fetched data (if cached by the browser) might be partially accessible. True offline report generation is not a feature.
*   **Accessibility:** Semantic HTML and ARIA attributes (where applicable) are used to enhance accessibility.

## 🛠️ Tech Stack

*   **Frontend:**
    *   React 19 (using Hooks and Functional Components)
    *   TypeScript
    *   Tailwind CSS for styling
    *   ESM imports via `esm.sh` for direct browser module loading (React, ReactDOM, @google/genai)
*   **AI & Backend (Conceptual - Current State):**
    *   Google Gemini API (`@google/genai` library) for:
        *   Generating individual divination reports.
        *   Creating integrated comprehensive analyses.
        *   Generating character archetype tags.
        *   Powering the conversational AI chat.
*   **Environment (Current State):**
    *   Runs entirely in the browser, relying on a pre-configured `process.env.API_KEY` for Gemini API access.

## 📂 Project Structure

```
.
├── public/
│   └── (Static assets if any, though currently minimal)
├── src/
│   ├── components/                # React UI components
│   │   ├── icons/                 # SVG icon components
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
│   │   └── geminiService.ts       # Logic for interacting with Google Gemini API
│   ├── App.tsx                    # Main application component, manages state and flow
│   ├── constants.ts               # Application-wide constants (e.g., method names, MBTI questions)
│   ├── index.tsx                  # Entry point for React application
│   └── types.ts                   # TypeScript type definitions and enums
├── .env.example                 # Example for API key (API_KEY must be set in actual environment)
├── index.html                   # Main HTML file
├── metadata.json                # Application metadata
├── package.json                 # Project dependencies and scripts (conceptual, as using esm.sh)
└── README.md                    # This file
```

## ⚙️ Setup and Running (Current Frontend-Only Version)

This application is designed to run directly in the browser using ES modules and requires no separate build step for its frontend dependencies if served correctly.

1.  **API Key Configuration:**
    *   The application **requires** a Google Gemini API key.
    *   This key **must** be available as an environment variable named `API_KEY` in the execution context where the application is served or run.
    *   **Crucially, `process.env.API_KEY` is accessed directly in the code.** You need to ensure this variable is defined. For local development, one way is to use a tool that injects environment variables when serving static files, or by manually replacing `process.env.API_KEY` in `geminiService.ts` before serving (not recommended for production).
    *   Create a `.env` file (if your serving mechanism supports it) with your API key:
        ```
        API_KEY=YOUR_GEMINI_API_KEY
        ```

2.  **Serving the Application:**
    *   You need a simple HTTP server to serve `index.html` and the associated `.tsx` files. Browsers restrict `file://` access for ES modules and API calls.
    *   One common way is to use `live-server` (install via `npm install -g live-server`):
        ```bash
        live-server .
        ```
    *   Or Python's built-in HTTP server (Python 3):
        ```bash
        python -m http.server
        ```
    *   Navigate to the local address provided by the server (e.g., `http://localhost:8080` or `http://localhost:8000`).

3.  **Dependencies:**
    *   Frontend dependencies (React, @google/genai) are loaded directly via CDN (`esm.sh`) as specified in `index.html`'s `importmap`. No `npm install` is strictly necessary for these to run in the browser once the API key is handled.

## 🚀 How It Works (Current Frontend-Only Version)

The application guides the user through a multi-step process:

1.  **Demographics:** The user provides their name and a primary question or area of focus.
2.  **Method Selection:** The user chooses one or more divination methods they are interested in.
3.  **Data Input:** For each selected method, the user is prompted to provide the necessary information (e.g., date of birth for Numerology, palm image for Palmistry, MBTI quiz answers).
4.  **AI Analysis:** Once all inputs are collected:
    *   The `geminiService.ts` sends requests to the Google Gemini API for each selected method, including user data and their main question.
    *   It then requests an integrated report, synthesizing all individual analyses.
    *   Finally, it requests character archetype tags based on the integrated report.
5.  **Display Reports:** The application displays the individual reports, the integrated comprehensive analysis, and the character tags. Grounding sources from Google Search (if used by the AI) are also listed.
6.  **Chat with AI:** The user can choose to chat with "Aura," an AI companion. The `geminiService.ts` initializes a chat session with Gemini, providing the context of the user's reports. The `ChatInterface.tsx` component handles the message display and user input.

## 🔮 Key Services & Components (Current Frontend-Only Version)

*   **`App.tsx`:** The core component that orchestrates the entire application flow, manages state (current step, user inputs, reports, chat messages), and renders the appropriate UI for each step.
*   **`geminiService.ts`:** A crucial module responsible for all interactions with the Google Gemini API. It formats prompts, sends requests, and processes responses for generating reports and handling chat conversations.
*   **Input Components (e.g., `LifePathNumberInput.tsx`, `PalmistryInput.tsx`):** Dedicated components for collecting user data for each divination method.
*   **`ReportDisplay.tsx`:** Renders individual and integrated reports with basic markdown formatting.
*   **`ChatInterface.tsx`:** Provides the user interface for the conversational AI chat with Aura.

## 💡 Potential Future Enhancements (Beyond Current Scope)

*   User accounts to save and revisit past readings (requires backend).
*   More sophisticated Tarot animations (e.g., card shuffling, detailed card imagery).
*   Ability to customize report appearance or share reports.
*   Integration of additional divination methods.
*   Localization for other languages.
*   Persistent chat history across sessions (requires backend).

---

## 🚧 Backend Development TODO & Considerations (For Commercial Platform)

As this project transitions to a commercial platform with a Python backend and Google Gmail login, the following areas will need to be developed and considered:

### I. Core Backend Functionality (Python - FastAPI)

1.  **User Authentication & Authorization:**
    *   **Google Gmail OAuth 2.0 Integration:** Securely implement "Sign in with Google."
    *   **Session Management:** JWT (JSON Web Tokens) or server-side sessions.
    *   **User Profile Management:** Store user details (name, email, preferences, subscription status).
    *   **Role-Based Access Control (RBAC):** Define roles (e.g., free_user, premium_user, admin) and permissions.
2.  **Database Design & Management:**
    *   **Choose a Database:** PostgreSQL is often favored with Python for robustness; MySQL or even NoSQL (MongoDB) for certain data could be options.
    *   **Schema:** Design tables for users, divination requests, generated reports (individual & integrated), payment transactions, subscription status, chat history (optional, or key summaries).
    *   **ORM:** Use an Object-Relational Mapper like SQLAlchemy (FastAPI/Flask) or Django ORM.
3.  **API Endpoints:**
    *   **Authentication:** `/auth/google/login`, `/auth/google/callback`, `/auth/logout`, `/auth/me` (get current user).
    *   **User Management:** `/users/profile` (CRUD for user preferences).
    *   **Divination Services:**
        *   `/divination/initiate`: Frontend sends selected methods and inputs. Backend validates, stores, and then calls Gemini.
        *   `/divination/reports/{report_id}`: Retrieve a specific report.
        *   `/divination/history`: List user's past reports.
    *   **Chat Services:**
        *   `/chat/start_session/{report_id}`: Initialize a chat session linked to a report context.
        *   `/chat/send_message`: Send user message, get AI response.
        *   `/chat/history/{session_id}`: (Optional) Retrieve chat history.
    *   **Payment & Subscription:**
        *   `/payments/create_checkout_session` (e.g., for Stripe).
        *   `/payments/webhook`: Handle events from payment provider (e.g., successful payment, subscription updates).
        *   `/subscriptions/status`: Check current user's subscription.
4.  **Gemini API Integration (Backend-Side):**
    *   **Secure API Key Management:** Store the Google Gemini API key securely on the backend (e.g., environment variables, secrets manager). **DO NOT expose it to the frontend.**
    *   **Proxy Requests:** All calls to Gemini API must go through your backend.
    *   **Error Handling & Retries:** Robust handling of Gemini API errors, rate limits, and implement retry logic (e.g., exponential backoff).
5.  **Payment System Integration:**
    *   **Choose a Provider:** Stripe, PayPal, Braintree, etc.
    *   **Subscription Logic:** Handle different tiers (e.g., free tier with limited readings, premium tier with unlimited/more features).
    *   **Securely Handle Transactions:** PCI compliance considerations if handling card data directly (usually offloaded to provider).
    *   **Invoice/Receipt Generation:** (Optional, often handled by provider).

### II. Advanced Features & Considerations

6.  **Task Queues / Background Jobs (e.g., Celery with Redis/RabbitMQ):**
    *   Offload long-running Gemini API calls to background workers to prevent blocking API requests and improve responsiveness.
    *   Sending emails (welcome, payment confirmation, etc.).
7.  **Content Management System (CMS) or Admin Panel:**
    *   Manage descriptions of divination methods, promotional text, FAQs.
    *   User management (view users, manage subscriptions manually if needed).
    *   View site statistics, API usage.
8.  **Logging & Monitoring:**
    *   Comprehensive logging for requests, errors, API calls (e.g., ELK stack, Sentry, Datadog).
    *   Performance monitoring and alerts.
9.  **Rate Limiting & Abuse Prevention:**
    *   Implement rate limiting on API endpoints to prevent abuse.
    *   Consider bot detection.
10. **Email Notifications:**
    *   Welcome emails, password resets (if not solely OAuth), payment confirmations, subscription reminders.
11. **Scalability & Performance:**
    *   Design for horizontal scaling (stateless application servers where possible).
    *   Database optimization (indexing, connection pooling).
    *   Caching strategies (e.g., Redis for frequently accessed data, API responses).
12. **Image Handling (for Palmistry):**
    *   Securely upload and store user palm images (e.g., AWS S3, Google Cloud Storage).
    *   Implement access control for these images.
    *   Consider image processing/validation on the backend.

### III. Critical Non-Functional Requirements

13. **Security:**
    *   **HTTPS Everywhere.**
    *   **Input Validation & Sanitization:** On all backend inputs.
    *   **Protection against common vulnerabilities:** OWASP Top 10 (XSS, CSRF, SQL Injection, etc.).
    *   **Dependency Scanning:** Regularly check for vulnerabilities in libraries.
    *   **Regular Security Audits.**
14. **Data Privacy & Compliance:**
    *   **GDPR/CCPA (or relevant local regulations):** Understand obligations for handling personal and sensitive divination data.
    *   **Data Encryption:** At rest and in transit.
    *   **Clear Privacy Policy & Terms of Service.**
    *   **Data Deletion/Export Capabilities** for users.
15. **Backup & Disaster Recovery:**
    *   Regular database backups.
    *   Plan for service restoration in case of outages.
16. **API Versioning:**
    *   Plan for future API changes without breaking existing clients.
17. **Testing:**
    *   Unit tests, integration tests, end-to-end tests for backend logic.

This TODO list is extensive but covers the major areas for building a professional, commercial-grade AI platform. Prioritize based on your launch timeline and resources.