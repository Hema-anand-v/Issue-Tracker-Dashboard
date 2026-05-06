# 🚀 Issue Tracker Dashboard (Server)

A Node.js Express backend that serves as a data bridge between Microsoft Graph API (Excel/SharePoint) and the Issue Tracker Dashboard client. It handles authentication, data fetching, caching, and aggregation of mentor-reported issues.

## ✨ Features

- **Multi-Source Data Fetching**:
  - **Microsoft Graph API**: Fetches real-time data from an Excel workbook stored in SharePoint/OneDrive.
  - **Local Fallback**: Automatically falls back to a local `Issues.xlsx` file if credentials are missing.
  - **Mock Data**: Includes built-in mock data for development when no files or credentials are available.
- **Advanced Data Processing**:
  - **Auto-Mapping**: Maps complex Excel headers to clean, internal camelCase keys.
  - **TAT Calculation**: Automatically calculates Turnaround Time (TAT) if not present in the source.
  - **Date Normalization**: Converts Excel serial dates to standard JS date strings.
- **Summary API**: Provides pre-aggregated statistics (Total, Open, Closed, Avg TAT) and grouped counts (by Program, Track, Priority, etc.) for dashboard charts.
- **In-Memory Caching**: Implements a 60-second TTL cache to minimize API calls and improve performance.
- **Health Check**: Endpoint for monitoring server status.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express 5](https://expressjs.com/)
- **Authentication**: [@azure/msal-node](https://github.com/AzureAD/microsoft-authentication-library-for-js) (Microsoft Authentication Library)
- **Excel Parsing**: [XLSX (SheetJS)](https://sheetjs.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Environment Management**: [Dotenv](https://github.com/motdotla/dotenv)

## 📋 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/issues` | GET | Returns a list of all issues with mapped fields. |
| `/api/summary` | GET | Returns aggregated stats and groupings for charts. |
| `/api/health` | GET | Returns the server health status and timestamp. |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Microsoft Azure App Registration (for Graph API access) or a local `Issues.xlsx` file in the `data/` directory.

### Installation

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   CLIENT_ID=your_azure_client_id
   CLIENT_SECRET=your_azure_client_secret
   TENANT_ID=your_azure_tenant_id
   SHAREPOINT_SITE_ID=your_site_id
   DRIVE_ID=your_drive_id
   FILE_ID=your_file_id
   ```

4. **Run the server**:
   ```bash
   node index.js
   ```

The server will be available at `http://localhost:5000`.

## 📂 Project Structure

```text
server/
├── data/               # Local Excel files (Issues.xlsx)
├── src/
│   ├── routes.js       # Express route handlers and aggregations
│   └── excel.js        # Data fetching logic (Graph API & Local XLSX)
├── index.js            # Server entry point
└── .env                # Environment variables (not tracked)
```

## 📄 License

This project is part of the GPS Issue Tracker suite.
