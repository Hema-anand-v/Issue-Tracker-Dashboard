# 📊 Issue Tracker Dashboard (Serverless)

A modern, responsive, and **serverless** dashboard for tracking and visualizing mentor-reported issues. This application operates by fetching data from a static `issues.json` file, which is automatically kept in sync with a SharePoint Excel file using Power Automate.

## 🚀 Live Demo
Check out the live dashboard here: **[https://hema-anand-v.github.io/Issue-Tracker-Dashboard/](https://hema-anand-v.github.io/Issue-Tracker-Dashboard/)**

## ✨ Features

- **Serverless Architecture**: No backend server required. The app is hosted entirely on GitHub Pages.
- **Automated Deployment**: Integrated with GitHub Actions for seamless CI/CD.
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
- **CI/CD**: GitHub Actions
- **Data Sync**: Power Automate (SharePoint Excel -> GitHub JSON)

## 📋 Data Sync Setup (Power Automate)

To keep the dashboard updated without an Azure App Registration, follow the steps in the **[Power Automate Guide](power_automate_guide.md)**.

Briefly:
1.  **Trigger**: "When a file is modified" (SharePoint Excel).
2.  **Action**: "List rows" -> "Compose (JSON)".
3.  **Action**: **HTTP Action** (`PUT` request) to update `public/issues.json` in this repo.

## 🚀 Local Development

### Prerequisites
- Node.js (v18 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hema-anand-v/Issue-Tracker-Dashboard.git
   cd Issue-Tracker-Dashboard
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

## 🌐 Deployment

This project is optimized for **GitHub Pages**.

1.  **Automatic**: Any push to the `main` branch (including data updates from Power Automate) will trigger the GitHub Action to rebuild and deploy.
2.  **Settings**: Ensure your repository settings (**Settings > Pages**) are set to build from the `gh-pages` branch.

## 📄 License

This project is part of the GPS Issue Tracker suite.
