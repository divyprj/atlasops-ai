# AtlasOps AI — Demo Datasets

Realistic operational datasets for testing schema adaptability across domains.

## Datasets

| File | Domain | Rows | Columns | Key Features |
|---|---|---|---|---|
| `ecommerce_orders.csv` | E-Commerce | 120 | 18 | Orders, returns, cancellations, product categories, payment methods, shipping regions |
| `saas_metrics.csv` | SaaS Subscriptions | 60 | 17 | MRR/ARR, churn, plan tiers, seat counts, usage %, churn risk scoring |
| `travel_operations.csv` | Travel Operations | 100 | 17 | Bookings, cancellations, destinations, agents, pax, operational margins |
| `logistics_operations.csv` | Logistics | 110 | 18 | Shipments, delays, carriers, warehouses, priority levels, tracking |

## Edge Cases Included

Each dataset intentionally includes:

- **Null values** — missing fields to test data quality scoring
- **Temporal variance** — data spanning 6-7 months for forecasting
- **Status diversity** — completed, cancelled, pending, returned, delayed
- **Categorical diversity** — multiple categories, regions, agents
- **Outliers** — extreme amounts for anomaly detection testing
- **Duplicate entries** — testing deduplication handling

## Usage

1. Open AtlasOps AI at `http://localhost:3000`
2. Navigate to **Intake Center**
3. Upload any CSV file
4. Schema Intelligence auto-detects column mappings
5. Click **Initialize Analytics** to process

## Schema Adaptability

The platform's schema mapper automatically detects and maps columns from any domain:

- `order_id` → `id`
- `customer_name` → `customerName`  
- `mrr` / `amount` / `total` → `amount`
- `order_date` / `booking_date` / `ship_date` → `bookingDate`
- `status` / `order_status` → `status`

No configuration required.
