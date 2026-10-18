# 🚗 Car Price Prediction Using Machine Learning

## 📌 Project Overview

Car Price Prediction is a machine learning project that predicts the estimated selling price of a used car based on its company, manufacturing year, kilometers driven, and fuel type.

The project uses an **Extra Trees Regressor**, a supervised machine learning algorithm, to learn patterns from historical car data and estimate prices for new car inputs. It includes data cleaning, preprocessing, model training, evaluation, and prediction.

## 🎯 Objectives

- Predict the estimated selling price of used cars.
- Clean and preprocess real-world car datasets.
- Handle missing values and categorical features.
- Train an Extra Trees regression model.
- Evaluate model performance using regression metrics.
- Save the trained model for reuse in a prediction application.

## ✨ Features

- **Data Cleaning:** Removes invalid prices and cleans numeric values.
- **Data Preprocessing:** Handles missing values using imputation.
- **Categorical Encoding:** Converts company and fuel type into numerical features using One-Hot Encoding.
- **Machine Learning:** Uses an Extra Trees Regressor with 300 trees.
- **Model Evaluation:** Reports train/test R² score and test Mean Absolute Error (MAE).
- **Model Saving:** Saves the trained pipeline using Joblib.
- **Price Prediction:** Estimates a car's selling price from user-provided details.

## 🛠️ Technologies Used

- **Programming Language:** Python
- **Data Processing:** Pandas, NumPy
- **Machine Learning:** Scikit-learn
- **Model Serialization:** Joblib
- **Dataset Format:** CSV

## 📂 Project Structure

```text
Car-Price-Prediction/
│
├── data/
│   └── cars.csv.csv
│
├── Model/
│   └── car_price_model.joblib
│
├── Train.py
├── predict.py
├── app.py
├── static/
├── requirements.txt
├── render.yaml
└── README.md
```

## 📊 Dataset Description

The dataset contains information about used cars and their selling prices.

| Column | Description |
|---|---|
| `company` | Car manufacturer or company |
| `year` | Manufacturing year |
| `kms_driven` | Total kilometers driven |
| `fuel_type` | Fuel type, such as Petrol, Diesel, or CNG |
| `Price` | Selling price of the car; prediction target |

**Note:** The dataset must contain the column names expected by the training code.

## ⚙️ Machine Learning Workflow

1. Load the car dataset from a CSV file.
2. Clean price and kilometer values.
3. Convert numeric columns into appropriate data types.
4. Remove rows with invalid target values or essential numeric features.
5. Separate input features and target price.
6. Split the dataset into 80% training data and 20% testing data.
7. Apply missing-value imputation and One-Hot Encoding.
8. Train the Random Forest Regression model.
9. Evaluate predictions on training and testing data.
10. Save the trained pipeline for future predictions.

## 🧠 Algorithm Used

### Extra Trees Regression

The Extra Trees Regressor combines predictions from randomized decision trees to estimate a continuous numerical value, such as a car's selling price.

In this project, the model uses 300 decision trees and a fixed random seed for reproducibility.

### Data Preprocessing

- **Median Imputation:** Fills missing numeric feature values with their median.
- **Most-Frequent Imputation:** Fills missing categorical values with their most frequent category.
- **One-Hot Encoding:** Converts categorical features into numerical representations.
- **Train-Test Split:** Uses 80% of the dataset for training and 20% for testing.

## 💻 Installation and Setup

### 1. Clone the Repository

If your project is hosted on GitHub, run:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Car-Price-Prediction
```

Replace the placeholder with your actual repository URL.

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 🚀 How to Run the Project

### Step 1: Prepare the Dataset

Place your dataset at:

```text
data/cars.csv.csv
```

### Step 2: Train the Model

Run:

```bash
python Train.py
```

The training program cleans the dataset, trains the model, displays evaluation metrics, and saves the trained model to:

```text
Model/car_price_model.joblib
```

### Step 3: Predict a Car Price

After training completes, run:

```bash
python predict.py
```

Enter the requested details:

- Car company
- Manufacturing year
- Kilometers driven
- Fuel type

The program displays the estimated selling price in Indian rupees.

## 📈 Model Evaluation

The project evaluates model performance using the following metrics:

| Metric | Purpose |
|---|---|
| R² Score | Measures how well the model explains price variation |
| MAE | Measures the average absolute prediction error |
The training script reports train/test R² and test MAE when you run `Train.py`. The results depend on the dataset and model configuration.

## Run the web application

Start the Flask app:

```bash
python app.py
```

Open <http://127.0.0.1:5000> in a browser. The model is loaded from
`Model/car_price_model.joblib`.

## Deploy to Render

The repository includes a Render Blueprint in `render.yaml`. Push this
repository to GitHub, then create a Blueprint in the
[Render Dashboard](https://dashboard.render.com/) and select the repository.
Render installs dependencies, starts the Flask app with Gunicorn, and checks
`/api/health` to confirm the service is running.

## 📦 Model Output

After successful training, the following file is generated:

`Model/car_price_model.joblib`

This file contains the trained preprocessing and prediction pipeline. It can be loaded using Joblib without retraining the model, provided the required compatible Python libraries are installed.

## 🔮 Future Enhancements

- Develop a web interface using Flask or Streamlit.
- Add more features such as mileage, engine capacity, transmission, and car condition.
- Compare Random Forest with Linear Regression and Gradient Boosting.
- Improve model performance through hyperparameter tuning.
- Display prediction results using a visual dashboard.
- Add monitoring and production settings to the Render deployment.

## ⚠️ Limitations

- Predictions depend on the quality and coverage of the training dataset.
- Market prices can vary with location, condition, demand, and vehicle history.
- The estimated price is not a guaranteed resale value.
- The model may be less reliable for cars with rare or unseen characteristics.

## 👨‍💻 Conclusion

This project demonstrates how machine learning can be used to estimate used-car prices from historical data. By combining data preprocessing, Extra Trees regression, model evaluation, model serialization, and a Flask web application, it provides a foundation for a practical car price estimation application.

## 📄 License

This project is intended for educational and academic purposes. Add a suitable open-source license if you plan to distribute the code publicly.
