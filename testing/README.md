# AtlasOps AI — Stress Test Datasets

Test files designed to break, stress, and validate the analytics pipeline.

## Test Files

| File | Purpose | What It Tests |
|---|---|---|
| `malformed_csv.csv` | Broken CSV structure | Extra commas, unmatched quotes, empty rows, tab separators |
| `null_heavy.csv` | 50%+ null values | Data quality engine, null handling, empty field defaults |
| `duplicate_rows.csv` | Exact duplicate rows | Deduplication, entity counting, revenue double-counting |
| `schema_mismatch.csv` | Unrecognizable columns | Schema mapper graceful degradation, 0% confidence handling |
| `malformed_dates.csv` | Inconsistent date formats | Date parsing (YYYY-MM-DD, DD/MM/YYYY, MMM DD YYYY, etc.) |
| `extreme_outliers.csv` | Extreme and negative amounts | Anomaly detection boundaries, negative profit handling |

## How to Use

Upload each file through the **Intake Center** to verify:

1. **malformed_csv.csv** — Should show parsing error or partial results
2. **null_heavy.csv** — Should process but show low data quality score
3. **duplicate_rows.csv** — Should count duplicates in quality metrics
4. **schema_mismatch.csv** — Should show <50% confidence, all columns unmapped
5. **malformed_dates.csv** — Should handle mixed formats or flag date issues
6. **extreme_outliers.csv** — Should detect outliers in anomaly engine

## Expected Behavior

- The platform should **never crash** on any of these files
- Error states should show **clear, actionable messaging**
- Partial data should still produce **valid analytics** where possible
- Schema confidence should reflect **actual mapping quality**
