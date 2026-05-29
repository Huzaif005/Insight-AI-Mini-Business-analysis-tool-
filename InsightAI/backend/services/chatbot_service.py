from services.data_cleaning import get_cleaned_data


def chat_response(message: str) -> str:
    df, meta = get_cleaned_data()
    msg = message.lower().strip()
    
    if df is None or df.empty:
        return "I don't have any data loaded right now. Please upload a dataset (CSV, XLSX, or JSON) using the Upload button to get started!"
        
    if any(x in msg for x in ["hello", "hi", "hey"]):
        return f"Hello! I am your InsightAI Chat Assistant. I have loaded your dataset '{meta.get('filename')}' ({meta.get('rows')} rows). Ask me about the 'columns', 'statistics', or 'insights'!"
        
    if any(x in msg for x in ["row", "record", "size", "length", "how many"]):
        return f"The dataset '{meta.get('filename')}' contains **{meta.get('rows')} records (rows)** and **{meta.get('columns_count')} variables (columns)**."
        
    if any(x in msg for x in ["column", "field", "variable", "headers"]):
        cols = ", ".join([f"`{c}`" for c in meta.get('columns', [])])
        return f"The columns in this dataset are: {cols}."
        
    if any(x in msg for x in ["stat", "summary", "mean", "average", "max", "min", "sum"]):
        res = "### Statistical Summary of Numeric Fields\n"
        numeric_cols = meta.get('numeric_columns', [])
        if not numeric_cols:
            return "There are no numeric columns in this dataset to compute statistics."
        for col in numeric_cols[:4]:
            res += f"- **{col.replace('_', ' ').title()}**: Average = `{round(df[col].mean(), 2)}` | Max = `{round(df[col].max(), 2)}` | Min = `{round(df[col].min(), 2)}` | Sum = `{round(df[col].sum(), 2)}`\n"
        return res
        
    if any(x in msg for x in ["insight", "trend", "discover", "pattern"]):
        from services.insight_generator import generate_insights
        insights = generate_insights()
        res = "### Top AI Insights Found\n"
        for i, ins in enumerate(insights[:3]):
            res += f"{i+1}. **{ins['title']}**: {ins['summary']}\n"
        return res
        
    return f"I parsed your question: *\"{message}\"*. I am currently running on the loaded dataset **{meta.get('filename')}**. You can ask me questions like:\n- *What columns are in the data?*\n- *How many records do we have?*\n- *Give me a summary of statistics.*\n- *Show me the main insights.*"

