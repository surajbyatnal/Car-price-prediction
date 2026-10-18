from pathlib import Path

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from Model.car_price_model import (
    MAX_TRAINING_KM,
    MAX_TRAINING_PRICE,
    MAX_TRAINING_YEAR,
    MIN_TRAINING_KM,
    MIN_TRAINING_YEAR,
    build_model,
)


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "cars.csv.csv"
MODEL_PATH = BASE_DIR / "Model" / "car_price_model.joblib"

# 1. Load
df = pd.read_csv(DATA_PATH)

# 2. Clean
df["Price"] = df["Price"].astype(str).str.replace(",", "", regex=False).str.replace(
    "Ask For Price", "", regex=False
).str.strip()
df["Price"] = pd.to_numeric(df["Price"], errors="coerce")

df["kms_driven"] = (
    df["kms_driven"]
    .astype(str)
    .str.replace(",", "", regex=False)
    .str.replace("kms", "", case=False, regex=False)
    .str.strip()
)
df["kms_driven"] = pd.to_numeric(df["kms_driven"], errors="coerce")
df["year"] = pd.to_numeric(df["year"], errors="coerce")
df["company"] = df["company"].astype(str).str.strip().str.lower()
df["name"] = df["name"].astype(str).str.strip()
df["fuel_type"] = df["fuel_type"].str.strip().str.lower()

# 3. Drop invalid rows and values outside the dataset's supported ranges
df = df.dropna(subset=["Price", "year", "kms_driven", "company", "name"])
df = df[
    (df["Price"] > 0)
    & (df["Price"] <= MAX_TRAINING_PRICE)
    & df["year"].between(MIN_TRAINING_YEAR, MAX_TRAINING_YEAR)
    & df["kms_driven"].between(MIN_TRAINING_KM, MAX_TRAINING_KM)
    & df["fuel_type"].isin(["petrol", "diesel"])
].copy()


def extract_model_family(row: pd.Series) -> str:
    name = row["name"].lower()
    company = row["company"]
    if name.startswith(company):
        name = name[len(company) :].strip()
    if company == "maruti" and name.startswith("suzuki "):
        name = name[len("suzuki ") :]
    return name.split(maxsplit=1)[0] if name else "unknown"


df["model"] = df.apply(extract_model_family, axis=1)

# 4. Features & target
X = df[["company", "model", "year", "kms_driven", "fuel_type"]]
y = df["Price"]

# 5. Pipeline
pipe = build_model()

# 7. Train/Test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipe.fit(X_train, y_train)
pipe.company_models_ = {
    company: sorted(models.unique().tolist())
    for company, models in df.groupby("company")["model"]
}

# 8. Evaluate
print(f"Train R²: {r2_score(y_train, pipe.predict(X_train)):.3f}")
print(f"Test  R²: {r2_score(y_test, pipe.predict(X_test)):.3f}")
print(f"Test MAE: INR {mean_absolute_error(y_test, pipe.predict(X_test)):,.0f}")

# 9. Save
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(pipe, MODEL_PATH, compress=3)
print(f"Compressed model saved to {MODEL_PATH}")
