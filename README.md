# Inventory API & React Frontend

This repository contains a full-stack application consisting of a Flask-based Inventory API and a React-based frontend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup & Configuration](#setup--configuration)
  - [Backend (Inventory API)](#backend-inventory-api)
  - [Frontend (React + Vite)](#frontend-react--vite)
  - [Running the Application](#running-the-application)
  - [Testing](#testing)

## Prerequisites

- **Python 3.8+** and **pip**
- **MySQL Server** (Ensure it is installed and running)
- **Node.js 18+** and **npm**
- **Docker** (Optional, for containerized deployment)

---

## Setup & Configuration

### Backend (Inventory API)

1. **Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Create a Virtual Environment**
   
   **On Windows:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   
   **On Linux or macOS:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Configuration:**
   - Ensure your MySQL server is running.
   - 
     ```python
     app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:YOUR_PASSWORD@localhost/inventory_db"
     ```

5. **Environment Variables (Optional):**
   - To manage secrets, store sensitive settings (like `JWT_SECRET_KEY`) in a `.env` file and load them with `python-dotenv`.

### Frontend (React + Vite)

1. **Navigate to the Frontend Directory:**
   ```bash
   cd src
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```
   Or using Yarn:
   ```bash
   yarn install
   ```

3. **Configure API Endpoint:**
   - In your React project (in a configuration file or directly in API calls), update the API URL to match your backend server (e.g., `http://localhost:5001`).

---

## Running the Application

### Start the Backend

With your virtual environment activated, run the Flask app:
```bash
python app.py
```

The backend will start on port **5001**.

### Start the Frontend

In your React project directory:

**Using npm:**
```bash
npm run dev
```

**Or using Yarn:**
```bash
yarn dev
```

The React frontend will typically run on port **5173** (ensure CORS is configured appropriately in your backend).

---

## Testing

### Backend Tests
To run unit tests for the Inventory API, execute:
```bash
python -m unittest test_app.py
```
Ensure that you have created sample data (or use test fixtures) so that endpoints such as `/products` return valid responses.