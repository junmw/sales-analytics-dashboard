# Sales Analytics Dashboard

An interactive web application that parses retail transaction data to visualize revenue patterns, catalog performance, and customer purchasing habits.

## Features

* **Core Performance Indicators:** Real-time tracking of gross revenue, units sold, total order count, average order value, top product, and primary payment method.
* **Timeline Metrics:** Time-series charts displaying revenue, orders, and units with options for daily totals, moving averages, and cumulative growth.
* **Catalog Analysis:** Product evaluation with configurable sorting by total revenue, volume, or unit price, alongside specific details on item market share.
* **Payment Allocation:** Breakdowns of transaction channels detailing unit volumes and average ticket sizes.
* **Activity Heatmaps:** A calendar matrix mapping daily transaction density and revenue intensity with single-day inspection.
* **Order Segmentation:** Visualizations covering transaction tier brackets and order complexity comparing single-item vs. multi-item baskets.
* **Data Exploration:** Multi-parameter filtering by dates, channels, products, or freeform text queries, with a paginated transaction ledger featuring raw data table row inspection and CSV exporting.
* **Dynamic Data Ingestion:** Front-end data parser allowing users to upload CSV files or paste raw text to analyze custom transaction datasets matching standard retail schemas.

## Tech Stack

* **Framework:** React, TypeScript
* **Build Configuration:** Vite
* **Deployment Workflow:** GitHub Actions via GitHub Pages

## Installation and Local Setup

1. Clone the project:
   ```bash
   git clone https://github.com
   cd sales-analytics-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

## Repository Background
This application was built as a standalone frontend dashboard using a template designed to evaluate high-volume client-side data parsing and responsive visualization updates within static host environments.
