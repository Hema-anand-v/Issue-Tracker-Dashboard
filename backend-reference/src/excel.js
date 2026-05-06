const axios = require('axios');
const msal = require('@azure/msal-node');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TTL = 60 * 1000; // 60 seconds

const expectedHeadersMapping = [
    { key: "Id", excel: "Id" },
    { key: "Start_time", excel: "Start time" },
    { key: "Completion_time", excel: "Completion time" },
    { key: "Email", excel: "Email" },
    { key: "Name", excel: "Name" },
    { key: "Email_ID", excel: "Email ID" },
    { key: "Mentor_Name", excel: "Mentor Name" },
    { key: "Track", excel: "Track" },
    { key: "Program_Name", excel: "Program Name" },
    { key: "Course_Name", excel: "Course Name" },
    { key: "Sprint_Number", excel: "Sprint Number" },
    { key: "Issue_Logged_On", excel: "Issue Logged On" },
    { key: "Learning_Activity", excel: "Learning Activity" },
    { key: "Type_of_Defect", excel: "Type of Defect" },
    { key: "Priority_of_Defect", excel: "Priority of Defect" },
    { key: "Issue_Defect_Exact_Details", excel: "Issue / Defect Exact Details" },
    { key: "Issue_Resolved_By", excel: "Issue Resolved By" },
    { key: "Date_of_Resolution", excel: "Date of Resolution" },
    { key: "Resolution_Details", excel: "Resolution Details" },
    { key: "Resolution_Uploaded_on_LMS", excel: "Resolution Uploaded on LMS" },
    { key: "Is_Issue_Closed", excel: "Is Issue Closed? (Delivery Team Confirmation)" },
    { key: "TAT", excel: "TAT" }
];

async function getAccessToken() {
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.TENANT_ID || process.env.CLIENT_ID.includes('your_')) {
        return null;
    }
    const clientCredentialRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
    };
    try {
        const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
        return response.accessToken;
    } catch (error) {
        console.error("Error acquiring token:", error.message);
        return null;
    }
}

function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return serial;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calculateTAT(loggedOn, resolvedOn) {
    if (!loggedOn || !resolvedOn) return 0;
    
    // If they are serial numbers, convert for calculation
    const start = typeof loggedOn === 'number' ? new Date(Math.round((loggedOn - 25569) * 86400 * 1000)) : new Date(loggedOn);
    const end = typeof resolvedOn === 'number' ? new Date(Math.round((resolvedOn - 25569) * 86400 * 1000)) : new Date(resolvedOn);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

const MOCK_DATA = [
    {
        Id: 1, Start_time: "2024-05-01", Completion_time: "2024-05-02", Email: "test@example.com", Name: "User One",
        Email_ID: "U1", Mentor_Name: "John Doe", Track: "Frontend", Program_Name: "Web Dev", Course_Name: "React 101",
        Sprint_Number: 1, Issue_Logged_On: "2024-05-01", Learning_Activity: "Module 1", Type_of_Defect: "Bug",
        Priority_of_Defect: "High", Issue_Defect_Exact_Details: "Login fail", Issue_Resolved_By: "Mentor A",
        Date_of_Resolution: "2024-05-02", Resolution_Details: "Fixed auth", Resolution_Uploaded_on_LMS: "Yes",
        Is_Issue_Closed: "Yes", TAT: 1
    },
    {
        Id: 2, Start_time: "2024-05-02", Completion_time: "", Email: "user2@example.com", Name: "User Two",
        Email_ID: "U2", Mentor_Name: "Jane Smith", Track: "Backend", Program_Name: "Node Mastery", Course_Name: "Express API",
        Sprint_Number: 2, Issue_Logged_On: "2024-05-02", Learning_Activity: "Module 2", Type_of_Defect: "Query Error",
        Priority_of_Defect: "Medium", Issue_Defect_Exact_Details: "DB error", Issue_Resolved_By: "",
        Date_of_Resolution: "", Resolution_Details: "", Resolution_Uploaded_on_LMS: "No",
        Is_Issue_Closed: "No", TAT: ""
    }
];

async function fetchIssues() {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_TTL)) {
        return cache.data;
    }

    // Try multiple possible local file names due to case sensitivity
    const possibleFiles = ['Issues.xlsx', 'issues.xlsx', 'Issues.XLSX'];
    let localFilePath = null;
    for (const file of possibleFiles) {
        const p = path.join(__dirname, '../data', file);
        if (fs.existsSync(p)) {
            localFilePath = p;
            break;
        }
    }

    const token = await getAccessToken();

    const mapRowToInternal = (row) => {
        const item = {};
        expectedHeadersMapping.forEach((header, index) => {
            let val = row[index] !== undefined ? row[index] : "";
            
            // Convert Excel serial dates for specific fields
            if (['Start_time', 'Completion_time', 'Issue_Logged_On', 'Date_of_Resolution'].includes(header.key)) {
                if (typeof val === 'number') {
                    val = excelDateToJSDate(val);
                }
            }
            
            item[header.key] = val;
        });
        if (!item.TAT && item.Issue_Logged_On && item.Date_of_Resolution) {
            item.TAT = calculateTAT(item.Issue_Logged_On, item.Date_of_Resolution);
        }
        return item;
    };

    // If no token, try local file
    if (!token) {
        if (localFilePath) {
            console.log("Reading from local Excel file:", localFilePath);
            try {
                const workbook = xlsx.readFile(localFilePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length <= 1) {
                    console.log("Local file is empty or has only headers.");
                    return [];
                }

                const rows = jsonData.slice(1);
                console.log("Sample raw row from Excel:", rows[0]);
                const data = rows.map(mapRowToInternal);
                console.log("Sample mapped row:", data[0]);

                cache = { data, timestamp: now };
                return data;
            } catch (err) {
                console.error("Error reading local Excel:", err.message);
                return MOCK_DATA;
            }
        }
        console.log("No credentials and no local file found. Using Mock Data.");
        return MOCK_DATA;
    }

    try {
        const { SHAREPOINT_SITE_ID, DRIVE_ID, FILE_ID } = process.env;
        const url = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/items/${FILE_ID}/workbook/worksheets('Sheet1')/usedRange`;
        
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const values = response.data.values;
        if (!values || values.length <= 1) return [];

        const rows = values.slice(1);
        const data = rows.map(mapRowToInternal);

        cache = { data, timestamp: now };
        return data;
    } catch (error) {
        console.error("Error fetching from Graph API:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { fetchIssues };
