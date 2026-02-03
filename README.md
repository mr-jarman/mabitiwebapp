# Mabiti Web Application

Mabiti is a professional real estate platform featuring a Django backend and a React/Vite frontend.

## Project Structure

- `mabiti_backend/`: Django project for the API and server-side logic.
- `mabiti_frontend/`: React application using Vite for the user interface.

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mr-jarman/mabitiwebapp.git
cd mabitiwebapp
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd mabiti_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your `SECRET_KEY`, `GOOGLE_API_KEY`, and `GOOGLE_MAPS_API_KEY`.
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../mabiti_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your `VITE_GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Key Features

- Professional Multi-step Property Listing
- Interactive Google Maps Integration
- AI-powered real estate assistant
- Modern, responsive design with Liquid Glass aesthetics
