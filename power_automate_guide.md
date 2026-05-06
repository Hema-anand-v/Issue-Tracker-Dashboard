# Power Automate Setup Guide: SharePoint Excel to GitHub JSON

This guide explains how to set up a Power Automate flow to automatically update your dashboard's data whenever the SharePoint Excel file is modified.

## Prerequisites
1.  **GitHub Personal Access Token (PAT)**:
    - Go to **GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)**.
    - Generate a new token with the `repo` scope.
    - **Save this token securely.**
2.  **Excel Table**: Ensure your data in SharePoint is formatted as an **Excel Table** (Select data -> Insert -> Table).

---

## Step 1: Trigger
- **Trigger**: Search for "SharePoint - When a file is created or modified (properties only)".
- **Site Address**: Select your SharePoint site.
- **Library Name**: Select the document library.
- **Folder**: Select the folder containing your Excel file.

## Step 2: Get Data
- **Action**: "Excel Online (Business) - List rows present in a table".
- **Location**: Your SharePoint site.
- **Document Library**: Your document library.
- **File**: Pick your `Issues.xlsx`.
- **Table**: Select the table name (e.g., `Table1`).

## Step 3: Format Data
- **Action**: "Data Operation - Select".
- **From**: Use the `value` dynamic content from the previous step.
- **Map**: Enter your JSON keys on the left and select the corresponding Excel columns on the right.
    - Example: `Mentor_Name` : `Mentor Name`
    - Example: `Is_Issue_Closed` : `Is Issue Closed?`

## Step 4: Convert to JSON String
- **Action**: "Data Operation - Compose".
- **Inputs**: `json(body('Select'))` (use the Expression tab).

## Step 5: Get Current File SHA (Required for GitHub Update)
GitHub requires the current "SHA" of a file to update it.
- **Action**: "HTTP".
- **Method**: `GET`.
- **URI**: `https://api.github.com/repos/{owner}/{repo}/contents/public/issues.json`.
- **Headers**:
    - `Authorization`: `Bearer YOUR_GITHUB_PAT`
    - `User-Agent`: `PowerAutomate`
- **Authentication**: None (handled by header).

## Step 6: Update GitHub File
- **Action**: "HTTP".
- **Method**: `PUT`.
- **URI**: `https://api.github.com/repos/{owner}/{repo}/contents/public/issues.json`.
- **Headers**:
    - `Authorization`: `Bearer YOUR_GITHUB_PAT`
    - `Content-Type`: `application/json`
- **Body**:
    ```json
    {
      "message": "Update issues data from SharePoint",
      "content": "@{base64(body('Compose'))}",
      "sha": "@{body('HTTP')?['sha']}"
    }
    ```
    *(Note: Use the Expression tab for `base64` and `sha` access)*

---

## Troubleshooting
- **Premium License**: The "HTTP" action requires a Power Automate Premium license.
- **Table Names**: If you don't see your table in Step 2, make sure the data is actually formatted as a Table in Excel.
- **File Path**: Ensure the URI in Step 5 and 6 correctly points to `public/issues.json` in your repository.
