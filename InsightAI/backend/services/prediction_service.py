from services.data_cleaning import get_cleaned_data
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder


def predict(payload: dict):
    df, meta = get_cleaned_data()
    if df is None or df.empty:
        return {'prediction': 0.0, 'accuracy': 0.0, 'message': 'No dataset loaded. Mock prediction returned.', 'score_type': 'R2'}

    target_col = payload.get('target_column')
    feature_cols = payload.get('feature_columns', [])
    input_data = payload.get('predict_values', {})

    numeric_cols = meta.get('numeric_columns', [])
    categorical_cols = meta.get('categorical_columns', [])

    # If no target specified, choose the first numeric column
    if not target_col or target_col not in df.columns:
        if numeric_cols:
            target_col = numeric_cols[0]
        else:
            target_col = df.columns[-1]

    # If no features specified, select all other numeric columns
    if not feature_cols:
        feature_cols = [c for c in numeric_cols if c != target_col]
        if not feature_cols and categorical_cols:
            feature_cols = [c for c in categorical_cols if c != target_col][:2]

    if not feature_cols:
        return {'error': 'No suitable feature columns found for training.'}

    # Prepare data
    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Encode categorical features
    encoders = {}
    for col in feature_cols:
        if X[col].dtype == 'object' or isinstance(X[col].dtype, pd.CategoricalDtype):
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = le

    # Encode target if it is categorical
    is_classification = False
    if y.dtype == 'object' or isinstance(y.dtype, pd.CategoricalDtype) or y.nunique() < 5:
        is_classification = True
        le_y = LabelEncoder()
        y = le_y.fit_transform(y.astype(str))
        encoders[target_col] = le_y

    try:
        if is_classification:
            model = RandomForestClassifier(n_estimators=10, random_state=42)
            model.fit(X, y)
            score = float(model.score(X, y))
            score_type = 'Accuracy'
        else:
            model = LinearRegression()
            model.fit(X, y)
            score = float(model.score(X, y))
            score_type = 'R^2 Score'

        # Predict if input values are provided
        if input_data:
            # Map input_data values to a single row DataFrame
            pred_row = {}
            for col in feature_cols:
                val = input_data.get(col)
                if val is None:
                    # Fallback to mean or mode
                    if col in encoders:
                        pred_row[col] = 0
                    else:
                        pred_row[col] = float(X[col].mean())
                else:
                    if col in encoders:
                        try:
                            # Try to encode using fitted LabelEncoder
                            pred_row[col] = int(encoders[col].transform([str(val)])[0])
                        except Exception:
                            pred_row[col] = 0
                    else:
                        pred_row[col] = float(val)

            pred_df = pd.DataFrame([pred_row])
            raw_pred = model.predict(pred_df)[0]
            
            if is_classification and target_col in encoders:
                pred_val = str(encoders[target_col].inverse_transform([int(raw_pred)])[0])
            else:
                pred_val = round(float(raw_pred), 4)
        else:
            # Default prediction on the last row of X
            raw_pred = model.predict(X.iloc[[-1]])[0]
            if is_classification and target_col in encoders:
                pred_val = str(encoders[target_col].inverse_transform([int(raw_pred)])[0])
            else:
                pred_val = round(float(raw_pred), 4)

        return {
            'target_column': target_col,
            'feature_columns': feature_cols,
            'prediction': pred_val,
            'score': round(score, 4),
            'score_type': score_type,
            'is_classification': is_classification,
            'available_columns': list(df.columns)
        }
    except Exception as e:
        return {'error': f"Failed to train model: {str(e)}"}

