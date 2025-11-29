from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import Lasso, Ridge
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for dataset and models
dataset = None
models = {}
scaler = StandardScaler()

def load_dataset():
    """Load the water consumption dataset"""
    global dataset
    try:
        # Get the path to the dataset
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(current_dir, '..', 'public', 'data', 'dataset.csv')
        
        logger.info(f"Loading dataset from: {dataset_path}")
        dataset = pd.read_csv(dataset_path)
        
        # Clean column names (remove extra spaces)
        dataset.columns = dataset.columns.str.strip()
        
        logger.info(f"Dataset loaded successfully. Shape: {dataset.shape}")
        logger.info(f"Columns: {list(dataset.columns)}")
        return True
    except Exception as e:
        logger.error(f"Error loading dataset: {str(e)}")
        return False

def train_models():
    """Train ML models on the dataset"""
    global models, scaler
    try:
        if dataset is None:
            logger.error("Dataset not loaded")
            return False
        
        # Prepare features and target
        # Using relevant features for prediction
        feature_columns = [
            'Year',
            'Population',
            'Agricultural Water Use (%)',
            'Industrial Water Use (%)',
            'Household Water Use (%)',
            'Rainfall Impact (Annual Precipitation in mm)',
            'Groundwater Depletion Rate (%)',
            'Number of dams',
            'Reservoir_Capacity_TMC',
            'Number_of_Industries'
        ]
        
        target_column = 'Total Water Consumption(Billion Cubic Meters)'
        
        # Remove rows with missing values
        df_clean = dataset.dropna(subset=feature_columns + [target_column])
        
        X = df_clean[feature_columns]
        y = df_clean[target_column]
        
        # Scale features
        X_scaled = scaler.fit_transform(X)
        
        # Train LASSO model
        logger.info("Training LASSO model...")
        lasso = Lasso(alpha=0.1, max_iter=10000)
        lasso.fit(X_scaled, y)
        models['lasso'] = lasso
        
        # Train KNN model
        logger.info("Training KNN model...")
        knn = KNeighborsRegressor(n_neighbors=5, weights='distance')
        knn.fit(X_scaled, y)
        models['knn'] = knn
        
        # Train Ridge model
        logger.info("Training Ridge model...")
        ridge = Ridge(alpha=1.0)
        ridge.fit(X_scaled, y)
        models['ridge'] = ridge
        
        logger.info("All models trained successfully")
        return True
    except Exception as e:
        logger.error(f"Error training models: {str(e)}")
        return False

def get_country_features(country, year):
    """Get features for a specific country and year"""
    try:
        # Get the most recent data for the country
        country_data = dataset[dataset['Country'] == country].sort_values('Year', ascending=False)
        
        if country_data.empty:
            logger.warning(f"No data found for country: {country}")
            return None, None
        
        # Get the baseline (most recent) year data
        baseline_data = country_data.iloc[0]
        baseline_year = int(baseline_data['Year'])
        baseline_consumption = float(baseline_data['Total Water Consumption(Billion Cubic Meters)'])
        
        # Calculate years difference for projection
        years_diff = year - baseline_year
        
        # Estimate future features based on historical trends
        # For simplicity, we'll use the most recent values with some adjustments
        
        # Calculate population growth rate from historical data
        if len(country_data) >= 2:
            recent_data = country_data.head(2)
            pop_growth_rate = (recent_data.iloc[0]['Population'] - recent_data.iloc[1]['Population']) / recent_data.iloc[1]['Population']
        else:
            pop_growth_rate = 0.01  # Default 1% growth
        
        # Project population
        projected_population = baseline_data['Population'] * ((1 + pop_growth_rate) ** years_diff)
        
        # Create feature vector for prediction
        features = {
            'Year': year,
            'Population': projected_population,
            'Agricultural Water Use (%)': baseline_data['Agricultural Water Use (%)'],
            'Industrial Water Use (%)': baseline_data['Industrial Water Use (%)'],
            'Household Water Use (%)': baseline_data['Household Water Use (%)'],
            'Rainfall Impact (Annual Precipitation in mm)': baseline_data['Rainfall Impact (Annual Precipitation in mm)'],
            'Groundwater Depletion Rate (%)': baseline_data['Groundwater Depletion Rate (%)'],
            'Number of dams': baseline_data['Number of dams'],
            'Reservoir_Capacity_TMC': baseline_data['Reservoir_Capacity_TMC'],
            'Number_of_Industries': baseline_data['Number_of_Industries']
        }
        
        baseline = {
            'year': baseline_year,
            'consumption': baseline_consumption
        }
        
        return features, baseline
    except Exception as e:
        logger.error(f"Error getting country features: {str(e)}")
        return None, None

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict water consumption for a given country and year"""
    try:
        # Get request data
        data = request.get_json()
        country = data.get('country')
        year = data.get('year')
        
        if not country or not year:
            return jsonify({'error': 'Missing country or year parameter'}), 400
        
        logger.info(f"Prediction request for {country} in {year}")
        
        # Get features for the country and year
        features, baseline = get_country_features(country, year)
        
        if features is None:
            return jsonify({'error': f'No data available for country: {country}'}), 404
        
        # Convert features to array in correct order
        feature_columns = [
            'Year',
            'Population',
            'Agricultural Water Use (%)',
            'Industrial Water Use (%)',
            'Household Water Use (%)',
            'Rainfall Impact (Annual Precipitation in mm)',
            'Groundwater Depletion Rate (%)',
            'Number of dams',
            'Reservoir_Capacity_TMC',
            'Number_of_Industries'
        ]
        
        X = np.array([[features[col] for col in feature_columns]])
        X_scaled = scaler.transform(X)
        
        # Make predictions with all models
        predictions = {
            'lasso': float(models['lasso'].predict(X_scaled)[0]),
            'knn': float(models['knn'].predict(X_scaled)[0]),
            'ridge': float(models['ridge'].predict(X_scaled)[0])
        }
        
        logger.info(f"Predictions generated: {predictions}")
        
        # Return predictions
        return jsonify({
            'predictions': predictions,
            'baseline': baseline
        })
    
    except Exception as e:
        logger.error(f"Error in prediction endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': len(models) > 0,
        'dataset_loaded': dataset is not None
    })

if __name__ == '__main__':
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    logger.info("Starting Flask application...")
    
    # Load dataset and train models
    if load_dataset():
        if train_models():
            logger.info("Server ready to accept requests")
            app.run(host='0.0.0.0', port=5000, debug=True)
        else:
            logger.error("Failed to train models. Exiting.")
    else:
        logger.error("Failed to load dataset. Exiting.")
