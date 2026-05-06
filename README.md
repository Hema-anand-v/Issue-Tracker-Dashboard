# 📊 Issue Tracker Dashboard (Serverless)

A modern, responsive, and **serverless** dashboard for tracking and visualizing mentor-reported issues. This application operates by fetching data from a static `issues.json` file, which is automatically kept in sync with a SharePoint Excel file using Power Automate.

## ✨ Features

- **Serverless Architecture**: No backend server required. The app can be hosted entirely on GitHub Pages.
- **Real-time Stats Overview**: Instant visibility into total, open, and closed issues, along with Average Turnaround Time (TAT).
- **Interactive Visualizations**:
  - **Issues per Program**: Bar chart showing issue distribution.
  - **Issues by Priority**: Pie chart for severity levels.
  - **Open vs Closed per Track**: Stacked bar chart for progress tracking.
- **Advanced Filtering**: Drill down by clicking chart elements or using table filters.
- **Auto-Sync**: Data is automatically updated from SharePoint via Power Automate.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Visualization**: Recharts, Framer Motion, Lucide React
- **Data Sync**: Power Automate (SharePoint Excel -> GitHub JSON)

## 📋 Data Sync Setup (Power Automate)

To keep the dashboard updated without an Azure App Registration, follow these steps:

1.  **Create a GitHub PAT**: Generate a Personal Access Token in GitHub with `repo` permissions.
2.  **Power Automate Flow**:
    - **Trigger**: "When a file is modified" (Select your SharePoint Excel file).
    - **Action**: "List rows present in a table".
    - **Action**: "Compose" (Convert rows to JSON).
    - **Action**: **HTTP Action** (`PUT` request):
        - **URL**: `https://api.github.com/repos/{owner}/{repo}/contents/public/issues.json`
        - **Body**: Include the Base64 encoded JSON content and the file's current SHA.
3.  **Frequency**: The flow ensures that every time someone updates the Excel sheet, the dashboard reflects the changes within minutes.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Installation

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## 📄 License

This project is part of the GPS Issue Tracker suite.
