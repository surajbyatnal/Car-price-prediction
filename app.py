from flask import Flask, request, jsonify
from pathlib import Path

import joblib
import pandas as pd

from Model.car_price_model import (
    MAX_TRAINING_KM,
    MAX_TRAINING_YEAR,
    MIN_TRAINING_KM,
    MIN_TRAINING_YEAR,
)

app = Flask(__name__, static_folder="static", static_url_path="")
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "Model" / "car_price_model.joblib"
DATA_PATH = BASE_DIR / "data" / "cars.csv.csv"
model = joblib.load(MODEL_PATH)
cols = list(model.feature_names_in_)
categorical_transformer = model.named_steps["preprocess"].named_transformers_[
    "categorical"
]
encoder = categorical_transformer.named_steps["onehot"]
category_values = dict(
    zip(["company", "model", "fuel_type"], encoder.categories_)
)
company_models = model.company_models_


@app.get("/api/health")
def health():
    return jsonify(status="ok", model_loaded=True, dataset_available=DATA_PATH.is_file())


@app.get("/api/options")
def options():
    companies, fuels = (
        category_values["company"],
        category_values["fuel_type"],
    )
    return jsonify(
        brands={str(company): company_models[str(company)] for company in companies},
        fuel_types=fuels.tolist(),
        year={"min": MIN_TRAINING_YEAR, "max": MAX_TRAINING_YEAR},
        kms_driven={"min": MIN_TRAINING_KM, "max": MAX_TRAINING_KM},
    )


@app.get("/api/analytics")
def analytics():
    preprocessor = model.named_steps["preprocess"]
    regressor = model.named_steps["regressor"]
    transformed_names = preprocessor.get_feature_names_out()
    importances = dict.fromkeys(cols, 0.0)
    for name, importance in zip(transformed_names, regressor.feature_importances_):
        transformed_feature = name.split("__", maxsplit=1)[1]
        feature = next(
            column
            for column in cols
            if transformed_feature == column
            or transformed_feature.startswith(f"{column}_")
        )
        importances[feature] += float(importance)

    return jsonify(
        model_type=type(regressor).__name__,
        estimator_count=len(regressor.estimators_),
        feature_importances=[
            {"feature": feature, "importance": importance}
            for feature, importance in importances.items()
        ],
        supported_brands=len(category_values["company"]),
        supported_models=len(category_values["model"]),
        supported_fuel_types=category_values["fuel_type"].tolist(),
    )


@app.get("/api/dataset")
def dataset():
    try:
        frame = pd.read_csv(DATA_PATH)
    except (OSError, pd.errors.ParserError):
        app.logger.exception("Unable to read the car dataset.")
        return jsonify(error="The car dataset is unavailable."), 500

    return jsonify(
        file=DATA_PATH.name,
        rows=len(frame),
        columns=[
            {
                "name": str(column),
                "missing": int(frame[column].isna().sum()),
            }
            for column in frame.columns
        ],
        missing_values=int(frame.isna().sum().sum()),
    )

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.post("/api/predict")
def predict():
    d = request.get_json(silent=True)
    if not isinstance(d, dict):
        return jsonify(error="Send prediction details as JSON."), 400

    try:
        values = {
            "company": str(d["brand"]).strip().lower(),
            "model": str(d["model"]).strip().lower(),
            "year": int(d["year"]),
            "kms_driven": int(d["km"]),
            "fuel_type": str(d["fuel"]).strip().lower(),
        }
    except (KeyError, TypeError, ValueError):
        return jsonify(error="Brand, model, year, mileage, and fuel are required."), 400

    for column in ("company", "model", "fuel_type"):
        if values[column] not in category_values[column]:
            return jsonify(error=f"Unsupported {column.replace('_', ' ')} for this dataset."), 422
    if values["model"] not in company_models[values["company"]]:
        return jsonify(error="Unsupported model for this brand."), 422
    if not MIN_TRAINING_YEAR <= values["year"] <= MAX_TRAINING_YEAR:
        return jsonify(
            error=f"Year must be between {MIN_TRAINING_YEAR} and {MAX_TRAINING_YEAR}."
        ), 422
    if not MIN_TRAINING_KM <= values["kms_driven"] <= MAX_TRAINING_KM:
        return jsonify(
            error=(
                f"Mileage must be between {MIN_TRAINING_KM:,} and "
                f"{MAX_TRAINING_KM:,} km."
            )
        ), 422

    row = pd.DataFrame([{column: values[column] for column in cols}])
    return jsonify(price=float(model.predict(row)[0]))

if __name__ == "__main__":
    app.run(debug=True)