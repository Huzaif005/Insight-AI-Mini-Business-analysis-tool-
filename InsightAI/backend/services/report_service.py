import os
from services.data_cleaning import get_cleaned_data

REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')


def generate_and_save_report() -> str:
    df, meta = get_cleaned_data()
    if df is None or df.empty:
        return None

    os.makedirs(REPORTS_DIR, exist_ok=True)
    filename = f"report_{meta.get('filename', 'dataset')}.md"
    report_path = os.path.join(REPORTS_DIR, filename)

    # Compile a beautiful markdown report
    md_content = f"""# InsightAI Data Analysis Report

## Dataset Summary
- **Filename**: {meta.get('filename')}
- **Total Records (Rows)**: {meta.get('rows')}
- **Total Variables (Columns)**: {meta.get('columns_count')}

## Column Inventory
- **Numerical Columns**: {', '.join(meta.get('numeric_columns', [])) or 'None'}
- **Categorical Columns**: {', '.join(meta.get('categorical_columns', [])) or 'None'}
- **Datetime Columns**: {', '.join(meta.get('datetime_columns', [])) or 'None'}

## Statistical Breakdown
"""
    for col in meta.get('numeric_columns', []):
        md_content += f"""
### Numeric Column: {col.replace('_', ' ').title()}
- **Mean (Average)**: {round(df[col].mean(), 2)}
- **Maximum Value**: {round(df[col].max(), 2)}
- **Minimum Value**: {round(df[col].min(), 2)}
- **Standard Deviation**: {round(df[col].std(), 2) if len(df) > 1 else 0.0}
"""

    for col in meta.get('categorical_columns', []):
        val_counts = df[col].value_counts()
        if not val_counts.empty:
            top_val = val_counts.index[0]
            top_count = val_counts.values[0]
            md_content += f"""
### Categorical Column: {col.replace('_', ' ').title()}
- **Unique Values count**: {df[col].nunique()}
- **Most Common Category**: '{top_val}' ({top_count} occurrences)
"""

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
        
    return filename


def list_reports():
    try:
        os.makedirs(REPORTS_DIR, exist_ok=True)
        # Auto-generate a report if a dataset is available and no reports exist
        files = os.listdir(REPORTS_DIR)
        if not files:
            new_file = generate_and_save_report()
            if new_file:
                files = [new_file]
        return files
    except Exception as e:
        print(f"Error listing reports: {e}")
        return []

