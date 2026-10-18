from pathlib import Path

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent / "Model" / "car_price_model.joblib"

# Load the trained pipeline
model = joblib.load(MODEL_PATH)

# Get car details
company = input("Enter car company: ").strip()
year = int(input("Enter manufacturing year: "))
kms_driven = float(input("Enter kilometers driven: "))
fuel_type = input("Enter fuel type (Petrol/Diesel/CNG): ").strip()

# Prepare input in the expected format
car = pd.DataFrame([{
    "company": company,
    "year": year,
    "kms_driven": kms_driven,
    "fuel_type": fuel_type
}])

# Predict price
predicted_price = model.predict(car)[0]

print(f"\nEstimated car price: ₹{predicted_price:,.2f}")
