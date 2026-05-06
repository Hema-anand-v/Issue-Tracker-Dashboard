import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw,
  MoreVertical,
  Filter,
  Download
} from 'lucide-react';
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
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/api/issues';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setIssues(response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatus = (issue) => {
    if (String(issue.Is_Issue_Closed).toLowerCase() === 'yes') return 'Resolved';
    if (issue.Date_of_Resolution) return 'In Progress';
    return 'Open';
  };

  const stats = [
    { label: 'Total Issues', value: issues.length, icon: Ticket, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'High Priority', value: issues.filter(i => i.Priority_of_Defect === 'High').length, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'In Progress', value: issues.filter(i => getStatus(i) === 'In Progress').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Resolved', value: issues.filter(i => getStatus(i) === 'Resolved').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const chartData = [
    { name: 'Open', value: issues.filter(i => getStatus(i) === 'Open').length },
    { name: 'In Progress', value: issues.filter(i => getStatus(i) === 'In Progress').length },
    { name: 'Resolved', value: issues.filter(i => getStatus(i) === 'Resolved').length },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

  const filteredIssues = issues.filter(issue => 
    (issue.Issue_Defect_Exact_Details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.Type_of_Defect || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Ticket className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            IssueTracker
          </h1>
        </div>
        
        <nav className="space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Ticket} label="All Issues" />
          <NavItem icon={AlertCircle} label="Emergency" />
          <NavItem icon={Filter} label="Reporting" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Overview</h2>
            <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search issues..."
                className="glass-input pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-brand-primary/50 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <MoreVertical className="text-slate-500 w-5 h-5 cursor-pointer" />
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Status Breakdown</h3>
              <select className="bg-slate-800 text-xs border-none rounded px-2 py-1 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <Ticket className="w-4 h-4" /> Create New Issue
              </button>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
            <div className="mt-8">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Priority Distribution</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High', value: issues.filter(i => i.Priority_of_Defect === 'High').length },
                        { name: 'Medium', value: issues.filter(i => i.Priority_of_Defect === 'Medium').length },
                        { name: 'Low', value: issues.filter(i => i.Priority_of_Defect === 'Low').length },
                      ]}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Issues</h3>
            <div className="flex gap-2">
              <button className="text-slate-400 hover:text-white transition-colors text-sm font-medium">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Issue</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Reporter</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <AnimatePresence>
                  {filteredIssues.map((issue) => (
                    <motion.tr 
                      key={issue.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="text-white font-medium group-hover:text-brand-primary transition-colors">{issue.Issue_Defect_Exact_Details}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-full border border-slate-700 uppercase tracking-tighter font-bold">
                          {issue.Type_of_Defect}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={getStatus(issue)} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={issue.Priority_of_Defect} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{issue.Name}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{issue.Issue_Logged_On}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'group-hover:text-brand-primary transition-colors'}`} />
    <span className="font-medium">{label}</span>
  </a>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Open': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'In Progress': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    'Resolved': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    'High': 'text-red-400',
    'Medium': 'text-amber-400',
    'Low': 'text-blue-400'
  };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${styles[priority].replace('text', 'bg')}`} />
      <span className={`text-sm ${styles[priority]}`}>{priority}</span>
    </div>
  );
};

export default Dashboard;
