import os

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')


def save_uploaded_file(file_obj, filename: str) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = os.path.join(UPLOAD_DIR, filename)
    file_obj.save(path)
    return path


def get_latest_file() -> str:
    # Check uploads directory first
    if os.path.exists(UPLOAD_DIR):
        files = [os.path.join(UPLOAD_DIR, f) for f in os.listdir(UPLOAD_DIR) if f.endswith(('.csv', '.xlsx', '.json'))]
        if files:
            return max(files, key=os.path.getmtime)

    # Fallback to datasets folder
    datasets_dir = os.path.join(os.path.dirname(__file__), '..', 'datasets')
    if os.path.exists(datasets_dir):
        files = [os.path.join(datasets_dir, f) for f in os.listdir(datasets_dir) if f.endswith(('.csv', '.xlsx', '.json'))]
        if files:
            # Prefer sales_data.csv if present
            sales_path = os.path.join(datasets_dir, 'sales_data.csv')
            if sales_path in files:
                return sales_path
            return files[0]
            
    return None
