# Water Consumption Forecasting - Project Workflow

This document provides a comprehensive workflow overview for PPT presentations.

---

## System Architecture

```mermaid
graph TB
    subgraph "Frontend - React + Vite"
        A[User Interface] --> B[React Components]
        B --> C[Data Loader Service]
    end
    
    subgraph "Backend - Flask + ML"
        D[Flask API Server] --> E[Dataset Loader]
        E --> F[ML Models]
        F --> G[LASSO Model]
        F --> H[KNN Model]
        F --> I[Ridge Model]
    end
    
    subgraph "Data Layer"
        J[CSV Dataset<br/>700 rows, 24 features<br/>1990-2024]
    end
    
    C -->|HTTP POST Request| D
    D -->|JSON Response| C
    E -->|Load & Process| J
    
    style A fill:#e1f5ff
    style D fill:#fff4e1
    style J fill:#e8f5e9
```

---

## Frontend User Interaction Workflow

This block diagram illustrates how users navigate and interact with the application.

```mermaid
graph TD
    User((User)) --> Home[Home Page /]
    
    Home -->|Nav| Dashboard[Dashboard /dashboard]
    Home -->|Nav| Predict[Prediction Tool /predict]
    Home -->|Nav| Compare[Comparison Tool /compare]
    Home -->|Nav| Analyze[Country Analysis /analyze]
    Home -->|Nav| History[History /history]
    
    subgraph "Prediction Flow"
        Predict -->|Select Country & Year| Input[Input Form]
        Input -->|Submit| API_Call{Fetch Prediction}
        API_Call -->|Success| Results[Display Results & Charts]
        API_Call -->|Error| Error[Show Error Message]
    end
    
    subgraph "Analysis Features"
        Dashboard -->|View| GlobalStats[Global Statistics]
        Compare -->|Select Countries| CompView[Comparison Charts]
        Analyze -->|Select Country| DetailView[Detailed Metrics]
    end
    
    Results -->|Save| History
    
    style User fill:#ffcc80
    style Home fill:#b3e5fc
    style Predict fill:#c8e6c9
    style Dashboard fill:#e1bee7
```

---

### Frontend Data Flow (User Perspective)

This diagram focuses on how data moves from the user through the system and back, suitable for explaining the "Input-Process-Output" cycle in a presentation.

```mermaid
graph LR
    subgraph Input ["1. Data Input"]
        U[User] -->|Selects| C[Country]
        U[User] -->|Selects| Y[Target Year]
        C & Y -->|Form Data| F[Frontend State]
    end

    subgraph Process ["2. Processing"]
        F -->|Validation| V{Valid?}
        V -->|Yes| R[Construct API Request]
        V -->|No| E[Show Error]
        R -->|POST /predict| B[Backend API]
        B -->|JSON Response| D[Data Loader]
    end

    subgraph Output ["3. Visualization"]
        D -->|Update| S[React State]
        S -->|Render| G[Prediction Graph]
        S -->|Render| T[Statistics Table]
        G & T -->|Visual Feedback| U
    end

    style Input fill:#e3f2fd
    style Process fill:#f3e5f5
    style Output fill:#e8f5e9
```

---

```

### Key Data Flow Topics for Presentation

When presenting the data flow, consider covering these key technical points:

1.  **Input Validation & Sanitization**
    *   *Frontend*: Ensuring "Target Year" is within valid range (2025-2035).
    *   *Backend*: Verifying country existence in the dataset before processing.

2.  **Asynchronous API Communication**
    *   Using `fetch` with `await` to prevent UI freezing during model inference.
    *   JSON payload structure: `{"country": "India", "year": 2030}`.

3.  **Real-time Feature Engineering**
    *   The backend doesn't just look up values; it *calculates* them.
    *   *Lag Features*: Using past 3 years' data to predict the next.
    *   *Growth Projections*: Applying population growth rates to future years.

4.  **Model Ensemble Logic**
    *   Running three distinct models (LASSO, KNN, Ridge) in parallel.
    *   Comparing results to ensure consistency (Variance check).

5.  **State Management**
    *   How React state updates trigger re-rendering of the Recharts graph.
    *   Separation of "Loading", "Success", and "Error" states for better UX.

---

## Data Flow Workflow

### 1. Application Startup

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Dataset
    participant ML Models
    
    Note over Frontend: npm run dev<br/>Port: 8081
    Note over Backend: python app.py<br/>Port: 5000
    
    Backend->>Dataset: Load dataset.csv
    Dataset-->>Backend: 700 records loaded
    Backend->>ML Models: Train LASSO, KNN, Ridge
    ML Models-->>Backend: Models ready
    
    User->>Frontend: Open browser
    Frontend-->>User: Display UI
```

### 2. Prediction Request Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant DataLoader
    participant API
    participant ML Models
    
    User->>UI: Select Country (e.g., India)
    User->>UI: Select Year (e.g., 2030)
    User->>UI: Click "PREDICT"
    
    UI->>DataLoader: predictWaterConsumption(country, year)
    DataLoader->>API: POST /api/predict<br/>{country, year}
    
    API->>API: Get country baseline data
    API->>API: Calculate feature projections
    API->>ML Models: Predict with LASSO
    ML Models-->>API: LASSO prediction
    API->>ML Models: Predict with KNN
    ML Models-->>API: KNN prediction
    API->>ML Models: Predict with Ridge
    ML Models-->>API: Ridge prediction
    
    API-->>DataLoader: {predictions, baseline}
    DataLoader-->>UI: Prediction results
    UI-->>User: Display chart & statistics
```

---

## Machine Learning Pipeline

### Feature Engineering Process

```mermaid
flowchart LR
    A[Historical Data<br/>1990-2024] --> B[Feature Selection]
    B --> C[10 Key Features]
    C --> D[Standard Scaling]
    D --> E[Model Training]
    
    subgraph Features
        C --> F1[Year]
        C --> F2[Population]
        C --> F3[Water Use %]
        C --> F4[Rainfall]
        C --> F5[Infrastructure]
    end
    
    E --> G[LASSO α=0.1]
    E --> H[KNN k=5]
    E --> I[Ridge α=1.0]
    
    style A fill:#e3f2fd
    style E fill:#fff3e0
    style G fill:#c8e6c9
    style H fill:#c8e6c9
    style I fill:#c8e6c9
```

### Prediction Generation

```mermaid
flowchart TD
    A[User Input:<br/>Country + Year] --> B[Get Baseline Data<br/>Most Recent Year]
    B --> C[Calculate Population<br/>Growth Rate]
    C --> D[Project Future<br/>Population]
    D --> E[Build Feature Vector<br/>10 features]
    E --> F[Scale Features]
    F --> G{Apply Models}
    
    G --> H[LASSO Regression]
    G --> I[KNN Regression]
    G --> J[Ridge Regression]
    
    H --> K[Ensemble Results]
    I --> K
    J --> K
    
    K --> L[Return Predictions +<br/>Baseline for Comparison]
    
    style A fill:#e1bee7
    style G fill:#fff9c4
    style L fill:#c5e1a5
```

---

## Key Features & Technologies

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **Data Parsing**: PapaParse

### Backend Stack
- **Framework**: Flask 3.0
- **ML Library**: scikit-learn 1.3.2
- **Data Processing**: pandas 2.1.4, numpy 1.26.2
- **CORS**: flask-cors 4.0

### Dataset Features (24 columns)
1. Year (1990-2024)
2. Country & Country Code
3. Population
4. Total Water Consumption (BCM)
5. Per Capita Water Use
6. Agricultural Water Use (%)
7. Industrial Water Use (%)
8. Household Water Use (%)
9. Rainfall Impact (mm)
10. Groundwater Depletion Rate (%)
11. Water Scarcity Level
12. Number of Dams
13. Reservoir Capacity
14. Number of Industries
15. ISO Code
16-24. Engineered Features (lag, moving averages, interactions)

---

## Model Comparison

| Model | Algorithm | Hyperparameters | Use Case |
|-------|-----------|-----------------|----------|
| **LASSO** | Linear Regression with L1 regularization | α = 0.1 | Feature selection, handles multicollinearity |
| **KNN** | K-Nearest Neighbors | k = 5, distance-weighted | Non-linear patterns, local trends |
| **Ridge** | Linear Regression with L2 regularization | α = 1.0 | Stable predictions, handles correlated features |

---

## API Endpoints

### POST `/api/predict`

**Request:**
```json
{
  "country": "India",
  "year": 2030
}
```

**Response:**
```json
{
  "predictions": {
    "lasso": 1261.77,
    "knn": 1260.44,
    "ridge": 1260.24
  },
  "baseline": {
    "year": 2024,
    "consumption": 1017.25
  }
}
```

### GET `/health`

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "dataset_loaded": true
}
```

---

## Deployment & Running

### Development Setup

```bash
# Frontend (Terminal 1)
npm install
npm run dev
# Runs on: http://localhost:8081

# Backend (Terminal 2)
.\venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
python app.py
# Runs on: http://localhost:5000
```

### Project Structure

```
MajorProject(Latest)/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Predict.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Compare.tsx
│   │   ├── lib/
│   │   │   └── dataLoader.ts
│   │   └── components/
│   ├── public/
│   │   └── data/
│   │       └── dataset.csv
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── logs/
│
└── venv/
```

---

## Results & Performance

### Sample Prediction: India 2030

| Metric | Value |
|--------|-------|
| **Baseline (2024)** | 1017.25 BCM |
| **LASSO Prediction** | 1261.77 BCM (+24.0%) |
| **KNN Prediction** | 1260.44 BCM (+23.9%) |
| **Ridge Prediction** | 1260.24 BCM (+23.9%) |
| **Average Growth** | ~24% over 6 years |

### Model Agreement
All three models show strong agreement (variance < 0.2%), indicating robust predictions.

---

## Future Enhancements

1. **Model Improvements**
   - Ensemble methods (Random Forest, Gradient Boosting)
   - Time series models (ARIMA, LSTM)
   - Cross-validation for better accuracy

2. **Features**
   - Climate change impact factors
   - Policy intervention scenarios
   - Water conservation metrics

3. **Deployment**
   - Docker containerization
   - Cloud deployment (AWS/Azure)
   - CI/CD pipeline

---

## Conclusion

This project demonstrates a full-stack ML application for water consumption forecasting, combining:
- Modern web technologies (React, TypeScript, Vite)
- Machine learning models (LASSO, KNN, Ridge)
- RESTful API architecture
- Interactive data visualization
- Real-world environmental data analysis
