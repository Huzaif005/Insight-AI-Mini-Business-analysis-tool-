import pandas as pd
import os
from utils.file_handler import get_latest_file


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    # Drop rows with all NaN values
    df = df.dropna(how='all')
    
    # Drop columns that are completely empty
    df = df.dropna(axis=1, how='all')
    
    # Fill remaining NaNs for numeric columns with mean, categorical with mode
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].mean() if not df[col].empty else 0)
        else:
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
            
    # Try parsing date columns
    for col in df.columns:
        if 'date' in col.lower() or 'time' in col.lower():
            try:
                df[col] = pd.to_datetime(df[col])
            except Exception:
                pass
                
    # Clean string values (whitespace)
    for col in df.columns:
        if pd.api.types.is_string_dtype(df[col]):
            df[col] = df[col].astype(str).str.strip()
            
    return df


def get_cleaned_data():
    file_path = get_latest_file()
    if not file_path:
        return None, {}
        
    try:
        _, ext = os.path.splitext(file_path.lower())
        if ext == '.csv':
            df = pd.read_csv(file_path)
        elif ext in ('.xlsx', '.xls'):
            df = pd.read_excel(file_path)
        elif ext == '.json':
            df = pd.read_json(file_path)
        else:
            return None, {}
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return None, {}
        
    df = clean_dataframe(df)
    
    # Identify column classifications
    numeric_cols = []
    categorical_cols = []
    datetime_cols = []
    
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            datetime_cols.append(col)
        elif pd.api.types.is_numeric_dtype(df[col]):
            # If a numeric column has very few unique values, treat as categorical (e.g. classification labels)
            if df[col].nunique() < 5:
                categorical_cols.append(col)
            else:
                numeric_cols.append(col)
        else:
            categorical_cols.append(col)
            
    metadata = {
        'filename': os.path.basename(file_path),
        'rows': len(df),
        'columns_count': len(df.columns),
        'columns': list(df.columns),
        'numeric_columns': numeric_cols,
        'categorical_columns': categorical_cols,
        'datetime_columns': datetime_cols,
    }
    
    return df, metadata
