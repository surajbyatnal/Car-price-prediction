from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

MIN_TRAINING_YEAR = 1995
MAX_TRAINING_YEAR = 2019
MIN_TRAINING_KM = 1_000
MAX_TRAINING_KM = 400_000
MAX_TRAINING_PRICE = 5_000_000


def build_model() -> Pipeline:
    numeric_features = ["year", "kms_driven"]
    categorical_features = ["company", "model", "fuel_type"]

    numeric_transformer = SimpleImputer(strategy="median")
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", numeric_transformer, numeric_features),
            ("categorical", categorical_transformer, categorical_features),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocess", preprocessor),
            (
                "regressor",
                ExtraTreesRegressor(
                    n_estimators=300,
                    min_samples_leaf=2,
                    n_jobs=-1,
                    random_state=42,
                ),
            ),
        ]
    )
