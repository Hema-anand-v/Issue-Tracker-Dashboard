import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowUpDown,
  X,
  ExternalLink,
  User,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const IssuesTable = ({ issues, externalFilters, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    Program_Name: '',
    Track: '',
    Priority_of_Defect: '',
    Type_of_Defect: '',
    Is_Issue_Closed: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'Id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const rowsPerPage = 20;

  // Sync with external filters (from charts)
  useEffect(() => {
    if (externalFilters && Object.keys(externalFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...externalFilters }));
    }
  }, [externalFilters]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatus = (issue) => {
    return String(issue.Is_Issue_Closed).toLowerCase() === 'yes' ? 'Closed' : 'Open';
  };

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = 
        (issue.Mentor_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.Issue_Defect_Exact_Details || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProgram = !filters.Program_Name || issue.Program_Name === filters.Program_Name;
      const matchesTrack = !filters.Track || issue.Track === filters.Track;
      const matchesPriority = !filters.Priority_of_Defect || issue.Priority_of_Defect === filters.Priority_of_Defect;
      const matchesType = !filters.Type_of_Defect || issue.Type_of_Defect === filters.Type_of_Defect;
      const matchesStatus = !filters.Is_Issue_Closed || getStatus(issue) === filters.Is_Issue_Closed;

      return matchesSearch && matchesProgram && matchesTrack && matchesPriority && matchesType && matchesStatus;
    }).sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle numeric sorting for ID and Sprint
      if (sortConfig.key === 'Id' || sortConfig.key === 'Sprint_Number' || sortConfig.key === 'TAT') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [issues, searchTerm, filters, sortConfig]);

  const totalPages = Math.ceil(filteredIssues.length / rowsPerPage);
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const programs = [...new Set(issues.map(i => i.Program_Name))].filter(Boolean).sort();
  const tracks = [...new Set(issues.map(i => i.Track))].filter(Boolean).sort();
  const priorities = ['L1 - High', 'L2 - Medium', 'L3 - Low', 'Critical'];
  
  return (
    <div className="mt-12 space-y-6">
      {/* Filters Bar */}
      <div className="glass-card p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search mentor or details..."
              className="glass-input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="glass-input bg-[#2d2e4d]"
            value={filters.Program_Name}
            onChange={(e) => setFilters({...filters, Program_Name: e.target.value})}
          >
            <option value="">All Programs</option>
            {programs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select 
            className="glass-input bg-[#2d2e4d]"
            value={filters.Track}
            onChange={(e) => setFilters({...filters, Track: e.target.value})}
          >
            <option value="">All Tracks</option>
            {tracks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            className="glass-input bg-[#2d2e4d]"
            value={filters.Priority_of_Defect}
            onChange={(e) => setFilters({...filters, Priority_of_Defect: e.target.value})}
          >
            <option value="">All Priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select 
            className="glass-input bg-[#2d2e4d]"
            value={filters.Is_Issue_Closed}
            onChange={(e) => setFilters({...filters, Is_Issue_Closed: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>

          {(searchTerm || Object.values(filters).some(v => v)) && (
            <button 
              onClick={() => {
                setFilters({ Program_Name: '', Track: '', Priority_of_Defect: '', Type_of_Defect: '', Is_Issue_Closed: '' });
                setSearchTerm('');
                if (onFilterChange) onFilterChange({});
              }}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 ml-2"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
        
        <div className="text-slate-400 text-sm">
          Showing <span className="text-white font-bold">{filteredIssues.length}</span> issues
        </div>
      </div>

      {/* Table Area */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#2d2e4d] text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <SortHeader label="Id" id="Id" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Mentor Name" id="Mentor_Name" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Program" id="Program_Name" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Course" id="Course_Name" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Sprint" id="Sprint_Number" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Track" id="Track" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Priority" id="Priority_of_Defect" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Status" id="Is_Issue_Closed" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Logged On" id="Issue_Logged_On" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="TAT" id="TAT" sortConfig={sortConfig} onSort={handleSort} />
                <SortHeader label="Resolved By" id="Issue_Resolved_By" sortConfig={sortConfig} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedIssues.map((issue) => (
                <tr 
                  key={issue.Id}
                  onClick={() => setSelectedIssue(issue)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{issue.Id}</td>
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{issue.Mentor_Name}</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{issue.Program_Name}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm truncate max-w-[200px]">{issue.Course_Name}</td>
                  <td className="px-6 py-4 text-slate-400 text-center font-bold">{issue.Sprint_Number}</td>
                  <td className="px-6 py-4 text-purple-400 font-bold">{issue.Track}</td>
                  <td className="px-6 py-4"><PriorityBadge priority={issue.Priority_of_Defect} /></td>
                  <td className="px-6 py-4"><StatusBadge status={getStatus(issue)} /></td>
                  <td className="px-6 py-4 text-slate-400 text-sm whitespace-nowrap">{issue.Issue_Logged_On}</td>
                  <td className="px-6 py-4 font-mono text-center text-amber-400">{issue.TAT || 0}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm whitespace-nowrap">{issue.Issue_Resolved_By || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-[#1f2038] flex items-center justify-between">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-slate-400 text-sm">
            Page <span className="text-white font-bold">{currentPage}</span> of {totalPages || 1}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#1a1b2e] border-l border-slate-800 shadow-2xl z-[101] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <span className="text-purple-500 font-mono text-sm">ISSUE #{selectedIssue.Id}</span>
                    <h2 className="text-2xl font-bold text-white mt-1">Issue Details</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  <DetailSection title="Core Information">
                    <DetailItem icon={User} label="Reporter" value={selectedIssue.Name || 'Anonymous'} />
                    <DetailItem icon={User} label="Mentor" value={selectedIssue.Mentor_Name} />
                    <DetailItem icon={Calendar} label="Logged On" value={selectedIssue.Issue_Logged_On} />
                    <DetailItem icon={Tag} label="Program" value={selectedIssue.Program_Name} />
                    <DetailItem icon={Tag} label="Track" value={selectedIssue.Track} />
                  </DetailSection>

                  <DetailSection title="Issue Analysis">
                    <div className="bg-[#252640] p-4 rounded-xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2 font-medium">Description</p>
                      <p className="text-slate-100 leading-relaxed">{selectedIssue.Issue_Defect_Exact_Details}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem icon={AlertCircle} label="Priority" value={<PriorityBadge priority={selectedIssue.Priority_of_Defect} />} />
                      <DetailItem icon={Clock} label="TAT" value={`${selectedIssue.TAT} days`} />
                    </div>
                  </DetailSection>

                  <DetailSection title="Resolution Status">
                    <DetailItem icon={CheckCircle2} label="Is Closed" value={<StatusBadge status={getStatus(selectedIssue)} />} />
                    <DetailItem icon={User} label="Resolved By" value={selectedIssue.Issue_Resolved_By} />
                    <DetailItem icon={Calendar} label="Resolution Date" value={selectedIssue.Date_of_Resolution} />
                    
                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <p className="text-sm text-emerald-400 mb-2 font-medium">Resolution Details</p>
                      <p className="text-slate-200 text-sm italic">{selectedIssue.Resolution_Details || "No details provided"}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#252640] rounded-xl border border-slate-700/50">
                        <span className="text-sm text-slate-400">Resolution Uploaded on LMS</span>
                        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", 
                            selectedIssue.Resolution_Uploaded_on_LMS === 'Yes' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300')}>
                            {selectedIssue.Resolution_Uploaded_on_LMS}
                        </span>
                    </div>
                  </DetailSection>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SortHeader = ({ label, id, sortConfig, onSort }) => (
  <th 
    className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors group"
    onClick={() => onSort(id)}
  >
    <div className="flex items-center gap-1">
      {label}
      <ArrowUpDown className={clsx("w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity", sortConfig.key === id && "opacity-100 text-purple-400")} />
    </div>
  </th>
);

const DetailSection = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-slate-400">
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-sm font-medium text-white">{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Open': 'bg-red-500 text-white shadow-lg shadow-red-500/20',
    'Closed': 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
  };
  return (
    <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", styles[status])}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    'Critical': 'bg-red-600/20 text-red-500 border-red-500/30',
    'L1 - High': 'bg-orange-500/20 text-orange-400 border-orange-400/30',
    'L2 - Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
    'L3 - Low': 'bg-blue-500/20 text-blue-400 border-blue-400/30'
  };
  return (
    <span className={clsx("px-2 py-0.5 rounded border text-[10px] font-bold", styles[priority] || 'bg-slate-800 text-slate-400')}>
      {priority}
    </span>
  );
};

export default IssuesTable;
