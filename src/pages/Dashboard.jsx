import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import IssuesTable from '../components/IssuesTable';

const DATA_URL = './issues.json';

const getGroupedStats = (issues, key) => {
  const stats = {};
  issues.forEach(issue => {
    const val = issue[key] || "Unknown";
    stats[val] = (stats[val] || 0) + 1;
  });
  return stats;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [error, setError] = useState(null);
  const [tableFilters, setTableFilters] = useState({});

  const fetchData = async () => {
    try {
      const response = await axios.get(DATA_URL);
      const data = response.data;
      
      setIssues(data);
      
      // Process Summary Data locally
      const total = data.length;
      const open = data.filter(i => String(i.Is_Issue_Closed).toLowerCase() !== 'yes').length;
      const closed = data.filter(i => String(i.Is_Issue_Closed).toLowerCase() === 'yes').length;
      
      const tatValues = data.map(i => parseFloat(i.TAT)).filter(v => !isNaN(v));
      const avgTAT = tatValues.length > 0 ? (tatValues.reduce((a, b) => a + b, 0) / tatValues.length).toFixed(2) : 0;

      setSummary({
        stats: { total, open, closed, avgTAT },
        groupings: {
          Program_Name: getGroupedStats(data, 'Program_Name'),
          Track: getGroupedStats(data, 'Track'),
          Priority_of_Defect: getGroupedStats(data, 'Priority_of_Defect'),
          Type_of_Defect: getGroupedStats(data, 'Type_of_Defect'),
          Mentor_Name: getGroupedStats(data, 'Mentor_Name'),
          Sprint_Number: getGroupedStats(data, 'Sprint_Number')
        }
      });

      setLastUpdated(0);
      setError(null);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setError("Failed to fetch dashboard data. Ensure issues.json is available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(fetchData, 60000);
    const timerInterval = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const handleChartClick = (type, value) => {
    setTableFilters({ [type]: value });
    // Scroll to table
    const tableElement = document.getElementById('issues-table');
    if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Data Processing for Charts
  const programData = summary ? Object.entries(summary.groupings.Program_Name).map(([name, value]) => ({ name, value })) : [];
  
  const priorityData = summary ? [
    { name: 'Critical', value: issues.filter(i => (i.Priority_of_Defect || '').includes('Critical')).length, color: '#ef4444' },
    { name: 'High', value: issues.filter(i => (i.Priority_of_Defect || '').includes('High')).length, color: '#f97316' },
    { name: 'Medium', value: issues.filter(i => (i.Priority_of_Defect || '').includes('Medium')).length, color: '#eab308' },
    { name: 'Low', value: issues.filter(i => (i.Priority_of_Defect || '').includes('Low')).length, color: '#22c55e' },
  ].filter(p => p.value > 0) : [];

  const trackData = summary ? Object.keys(summary.groupings.Track).map(track => {
    const trackIssues = issues.filter(i => i.Track === track);
    return {
        name: track,
        Open: trackIssues.filter(i => String(i.Is_Issue_Closed).toLowerCase() !== 'yes').length,
        Closed: trackIssues.filter(i => String(i.Is_Issue_Closed).toLowerCase() === 'yes').length,
    };
  }) : [];

  const timeData = issues.reduce((acc, issue) => {
    const date = new Date(issue.Issue_Logged_On);
    if (isNaN(date)) return acc;
    const month = date.toLocaleString('default', { month: 'short' });
    const existing = acc.find(d => d.name === month);
    if (existing) existing.value += 1;
    else acc.push({ name: month, value: 1 });
    return acc;
  }, []).sort((a, b) => new Date(a.name) - new Date(b.name));

  const statCards = [
    { 
        title: 'Total Issues', 
        value: summary?.stats.total || 0, 
        subtitle: 'Logged across all programs',
        icon: ClipboardList, 
        color: 'text-purple-400', 
        bg: 'bg-purple-400/10' 
    },
    { 
        title: 'Open Issues', 
        value: summary?.stats.open || 0, 
        subtitle: 'Awaiting resolution',
        icon: AlertCircle, 
        color: 'text-red-400', 
        bg: 'bg-red-400/10' 
    },
    { 
        title: 'Closed Issues', 
        value: summary?.stats.closed || 0, 
        subtitle: 'Successfully resolved',
        icon: CheckCircle2, 
        color: 'text-green-400', 
        bg: 'bg-green-400/10' 
    },
    { 
        title: 'Avg TAT (days)', 
        value: summary?.stats.avgTAT || 0, 
        subtitle: 'Average turnaround time',
        icon: Clock, 
        color: 'text-amber-400', 
        bg: 'bg-amber-400/10' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1b2e] text-white pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold mb-6"
          >
            Issue <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Tracker</span> Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Live status of all mentor-reported issues across programs and sprints.
          </motion.p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('issues-table').scrollIntoView({ behavior: 'smooth' })}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-purple-600/20 flex items-center gap-2 mx-auto transition-all"
          >
            View All Issues <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, i) => (
            <motion.div 
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 border-slate-700/50"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${card.bg}`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold mb-2">
                {loading ? '...' : card.value}
              </p>
              <p className="text-xs text-slate-500 italic">
                {card.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Chart 1: Issues per Program */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="glass-card p-8"
          >
            <h3 className="text-lg font-bold mb-8">Issues per Program</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]} 
                    label={{ position: 'right', fill: '#94a3b8', fontSize: 12 }}
                    onClick={(data) => handleChartClick('Program_Name', data.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    {programData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: Issues by Priority */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="glass-card p-8"
          >
            <h3 className="text-lg font-bold mb-8">Issues by Priority</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    onClick={(data) => handleChartClick('Priority_of_Defect', data.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 3: Open vs Closed per Track */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="glass-card p-8"
          >
            <h3 className="text-lg font-bold mb-8">Open vs Closed per Track</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Bar 
                    dataKey="Open" 
                    stackId="a" 
                    fill="#ef4444" 
                    radius={[0, 0, 0, 0]} 
                    onClick={(data) => {
                        setTableFilters({ Track: data.name, Is_Issue_Closed: 'Open' });
                        document.getElementById('issues-table').scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="Closed" 
                    stackId="a" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]} 
                    onClick={(data) => {
                        setTableFilters({ Track: data.name, Is_Issue_Closed: 'Closed' });
                        document.getElementById('issues-table').scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 4: Issues Logged Over Time */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="glass-card p-8"
          >
            <h3 className="text-lg font-bold mb-8">Issues Logged Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Issues Table Section */}
        <div id="issues-table">
          <IssuesTable 
            issues={issues} 
            externalFilters={tableFilters} 
            onFilterChange={setTableFilters} 
          />
        </div>

        <div className="flex justify-center items-center gap-3 text-slate-500 text-sm mt-12">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Last updated: {lastUpdated} seconds ago
        </div>
      </div>
      
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-full backdrop-blur-xl">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
