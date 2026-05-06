const express = require('express');
const { fetchIssues } = require('./excel');
const router = express.Router();

function getGroupedStats(issues, key) {
    const stats = {};
    issues.forEach(issue => {
        const val = issue[key] || "Unknown";
        stats[val] = (stats[val] || 0) + 1;
    });
    return stats;
}

router.get('/issues', async (req, res) => {
    try {
        const issues = await fetchIssues();
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch issues", details: error.message });
    }
});

router.get('/summary', async (req, res) => {
    try {
        const issues = await fetchIssues();
        
        const total = issues.length;
        const open = issues.filter(i => String(i.Is_Issue_Closed).toLowerCase() === 'no').length;
        const closed = issues.filter(i => String(i.Is_Issue_Closed).toLowerCase() === 'yes').length;
        
        const tatValues = issues.map(i => parseFloat(i.TAT)).filter(v => !isNaN(v));
        const avgTAT = tatValues.length > 0 ? (tatValues.reduce((a, b) => a + b, 0) / tatValues.length).toFixed(2) : 0;

        const summary = {
            stats: {
                total,
                open,
                closed,
                avgTAT
            },
            groupings: {
                Program_Name: getGroupedStats(issues, 'Program_Name'),
                Track: getGroupedStats(issues, 'Track'),
                Priority_of_Defect: getGroupedStats(issues, 'Priority_of_Defect'),
                Type_of_Defect: getGroupedStats(issues, 'Type_of_Defect'),
                Mentor_Name: getGroupedStats(issues, 'Mentor_Name'),
                Sprint_Number: getGroupedStats(issues, 'Sprint_Number')
            }
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate summary", details: error.message });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
