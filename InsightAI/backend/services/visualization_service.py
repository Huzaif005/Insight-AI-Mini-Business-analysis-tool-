from services.data_cleaning import get_cleaned_data
import pandas as pd
import numpy as np


def generate_charts():
    df, meta = get_cleaned_data()
    if df is None or df.empty:
        # Fallback Mock Data
        return [
            {
                'id': 'sales-overview',
                'title': 'Sales Overview (Mock)',
                'type': 'line',
                'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'datasets': [{'label': 'Revenue', 'data': [12000, 19000, 3000, 5000, 2000, 3000]}]
            },
            {
                'id': 'product-distribution',
                'title': 'Product Revenue (Mock)',
                'type': 'bar',
                'labels': ['Widget A', 'Widget B', 'Widget C'],
                'datasets': [{'label': 'Sales', 'data': [99.9, 99.95, 45.0]}]
            }
        ]

    charts = []
    numeric_cols = meta.get('numeric_columns', [])
    categorical_cols = meta.get('categorical_columns', [])
    datetime_cols = meta.get('datetime_columns', [])

    # 1. Try to generate a Line Chart (Time Series or Trend)
    # If date column exists, group numerical column by date.
    if datetime_cols and numeric_cols:
        date_col = datetime_cols[0]
        num_col = numeric_cols[0]
        # Group by date and sum
        grouped = df.groupby(df[date_col].dt.strftime('%Y-%m-%d'))[num_col].sum().reset_index()
        # Sort values
        grouped = grouped.sort_values(by=date_col)
        labels = [str(x) for x in grouped[date_col].tolist()]
        data_vals = [float(x) if not pd.isna(x) else 0.0 for x in grouped[num_col].tolist()]
        charts.append({
            'id': 'trend-line',
            'title': f'{num_col.replace("_", " ").title()} Trend over Time',
            'type': 'line',
            'labels': labels,
            'datasets': [{'label': num_col.replace("_", " ").title(), 'data': data_vals}]
        })
    elif len(df) > 1 and numeric_cols:
        # If no date, plot numeric columns directly as line chart
        labels = [f"Row {i+1}" for i in range(len(df))]
        for col in numeric_cols[:1]:
            data_vals = [float(x) if not pd.isna(x) else 0.0 for x in df[col].tolist()]
            charts.append({
                'id': f'line-{col}',
                'title': f'{col.replace("_", " ").title()} Overview',
                'type': 'line',
                'labels': labels,
                'datasets': [{'label': col.replace("_", " ").title(), 'data': data_vals}]
            })

    # 2. Try to generate a Bar Chart (Categorical breakdown of numeric value)
    if categorical_cols and numeric_cols:
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        # Limit categories to top 8 to avoid clutter
        top_cats = df[cat_col].value_counts().index[:8]
        filtered_df = df[df[cat_col].isin(top_cats)]
        
        grouped = filtered_df.groupby(cat_col)[num_col].mean().reset_index()
        labels = [str(x) for x in grouped[cat_col].tolist()]
        data_vals = [round(float(x), 2) if not pd.isna(x) else 0.0 for x in grouped[num_col].tolist()]
        charts.append({
            'id': 'cat-bar',
            'title': f'Avg {num_col.replace("_", " ").title()} by {cat_col.replace("_", " ").title()}',
            'type': 'bar',
            'labels': labels,
            'datasets': [{'label': f'Avg {num_col.replace("_", " ").title()}', 'data': data_vals}]
        })
    elif categorical_cols:
        # Fallback to counts if no numeric columns
        cat_col = categorical_cols[0]
        counts = df[cat_col].value_counts().reset_index()
        counts.columns = [cat_col, 'count']
        labels = [str(x) for x in counts[cat_col].tolist()][:8]
        data_vals = [int(x) for x in counts['count'].tolist()][:8]
        charts.append({
            'id': 'cat-count-bar',
            'title': f'Distribution of {cat_col.replace("_", " ").title()}',
            'type': 'bar',
            'labels': labels,
            'datasets': [{'label': 'Count', 'data': data_vals}]
        })

    # 3. Pie/Donut Chart for Category Distribution
    # Use the second categorical column if it exists, otherwise the first
    pie_cat = categorical_cols[1] if len(categorical_cols) > 1 else (categorical_cols[0] if categorical_cols else None)
    if pie_cat:
        val_counts = df[pie_cat].value_counts()
        labels = [str(x) for x in val_counts.index[:5].tolist()]
        data_vals = [int(x) for x in val_counts.values[:5].tolist()]
        
        # Add 'Other' if more than 5 categories
        if len(val_counts) > 5:
            labels.append('Other')
            data_vals.append(int(val_counts.values[5:].sum()))
            
        charts.append({
            'id': 'pie-distribution',
            'title': f'{pie_cat.replace("_", " ").title()} Distribution',
            'type': 'pie',
            'labels': labels,
            'datasets': [{'label': 'Count', 'data': data_vals}]
        })

    return charts
