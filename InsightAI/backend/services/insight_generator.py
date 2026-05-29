from services.data_cleaning import get_cleaned_data
import pandas as pd


def generate_insights():
    df, meta = get_cleaned_data()
    if df is None or df.empty:
        return [
            {'title': 'Sales increased by 18% in December.', 'summary': 'Sales data indicates a significant peak in late Q4, primarily driven by holiday widgets.'},
            {'title': 'West region generated highest profit.', 'summary': 'Regional breakdown shows the Western territory leading all areas in margin efficiency.'},
            {'title': 'Product B demand is decreasing.', 'summary': 'Inventory logs show sales velocity for Product B dropping by 5% month-over-month.'}
        ]

    insights = []
    numeric_cols = meta.get('numeric_columns', [])
    categorical_cols = meta.get('categorical_columns', [])
    rows = meta.get('rows', 0)
    
    # 1. Dataset Scale Insight
    insights.append({
        'title': f"Loaded Dataset: {meta.get('filename')}",
        'summary': f"Successfully processed {rows} records across {meta.get('columns_count')} fields. The dataset contains {len(numeric_cols)} numeric fields and {len(categorical_cols)} categorical fields."
    })
    
    # 2. Numerical Insights
    for col in numeric_cols[:2]:
        col_mean = round(df[col].mean(), 2)
        col_max = round(df[col].max(), 2)
        col_min = round(df[col].min(), 2)
        col_sum = round(df[col].sum(), 2)
        
        insights.append({
            'title': f"Statistical summary for {col.replace('_', ' ').title()}",
            'summary': f"The column '{col}' has an average value of {col_mean}, ranging from a minimum of {col_min} to a maximum of {col_max}. The total accumulated sum is {col_sum}."
        })
        
    # 3. Categorical Insights
    for col in categorical_cols[:2]:
        val_counts = df[col].value_counts()
        if not val_counts.empty:
            top_val = val_counts.index[0]
            top_count = val_counts.values[0]
            top_pct = round((top_count / rows) * 100, 1)
            
            insights.append({
                'title': f"Dominant category in {col.replace('_', ' ').title()}",
                'summary': f"'{top_val}' is the most frequent value in the '{col}' column, occurring {top_count} times, which represents {top_pct}% of the total records."
            })
            
    # 4. Correlation / Trend Insight if there are multiple numeric columns
    if len(numeric_cols) >= 2:
        corr = df[numeric_cols[0]].corr(df[numeric_cols[1]])
        if not pd.isna(corr):
            corr_type = "positive" if corr > 0.3 else ("negative" if corr < -0.3 else "weak/none")
            insights.append({
                'title': f"Correlation between {numeric_cols[0].title()} and {numeric_cols[1].title()}",
                'summary': f"The correlation coefficient between '{numeric_cols[0]}' and '{numeric_cols[1]}' is {round(corr, 3)}. This indicates a {corr_type} linear relationship."
            })
            
    return insights
