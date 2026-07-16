import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import DiffViewer from '../components/eco/DiffViewer';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import useEcoStore from '../store/ecoStore';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, TrendingUp, PieChart as PieIcon, BarChart3, FileDown, Search, Filter } from 'lucide-react';

const CHART_COLORS = ['#A0522D', '#5F9EA0', '#DAA520', '#6B8E23', '#CD853F', '#708090'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('eco-history');
  const [ecoHistory, setEcoHistory] = useState([]);
  const [versionMatrix, setVersionMatrix] = useState([]);
  const [selectedEco, setSelectedEco] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', stage: 'all', search: '' });
  const [exporting, setExporting] = useState(false);
  const [matrixPage, setMatrixPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [versionSearch, setVersionSearch] = useState('');
  const [matrixFilters, setMatrixFilters] = useState({ search: '', status: '' });
  const reportRef = useRef(null);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyRes, matrixRes, analyticsRes] = await Promise.all([
        api.get('/reports/eco-history'),
        api.get('/reports/version-matrix'),
        api.get('/reports/analytics'),
      ]);
      setEcoHistory(historyRes.data);
      setVersionMatrix(matrixRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    }
  };

  const filteredHistory = ecoHistory.filter((e) => {
    if (filters.type !== 'all' && e.eco_type !== filters.type) return false;
    if (filters.stage !== 'all' && e.stage_name !== filters.stage) return false;
    if (filters.search && !e.title?.toLowerCase().includes(filters.search.toLowerCase()) && !e.product_name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'eco-history', label: 'ECO History', icon: FileDown },
    { id: 'product-versions', label: 'Product Versions', icon: TrendingUp },
    { id: 'active-matrix', label: 'Active Matrix', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieIcon },
  ];

  // Group version matrix by product name
  const matrixGrouped = {};
  versionMatrix.forEach((row) => {
    if (!matrixGrouped[row.name]) matrixGrouped[row.name] = [];
    matrixGrouped[row.name].push(row);
  });

  // PDF Export handler
  const exportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0a0e1a',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFillColor(160, 82, 45); // sienna
      pdf.rect(0, 0, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('PLM System Report', 10, 13);
      pdf.setFontSize(8);
      pdf.text(new Date().toLocaleDateString(), pageWidth - 30, 13);

      // Content
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let yPos = 25;
      if (imgHeight > pageHeight - 30) {
        // Multi-page
        const pages = Math.ceil(imgHeight / (pageHeight - 30));
        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, i === 0 ? yPos : 5, imgWidth, imgHeight, '', 'FAST', 0);
        }
      } else {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
      }

      pdf.save(`PLM_Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const inputClass = 'bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-800 border border-navy-600 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gainsboro-200 font-semibold">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs text-gainsboro-400">{p.name}: <span className="font-bold text-sienna-400">{p.value}</span></p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gainsboro-100">Reports</h1>
        <button
          onClick={exportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800 border border-navy-600 rounded-xl p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-sienna-600 text-white' : 'text-gainsboro-400 hover:text-gainsboro-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      {activeTab === 'eco-history' && (
        <div className="flex gap-3 items-center">
          <select className={inputClass} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="all">All Types</option>
            <option value="product">Product</option>
            <option value="bom">BoM</option>
          </select>
          <select className={inputClass} value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
            <option value="all">All Stages</option>
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Approval">Approval</option>
            <option value="Done">Done</option>
          </select>
          <input className={inputClass} placeholder="Search product..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
      )}

      {/* Report Content */}
      <div ref={reportRef}>
        {/* ECO History Tab */}
        {activeTab === 'eco-history' && (() => {
          const total = filteredHistory.length;
          const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
          const start = (historyPage - 1) * ITEMS_PER_PAGE;
          const paginatedHistory = filteredHistory.slice(start, start + ITEMS_PER_PAGE);
          const meta = { total, page: historyPage, limit: ITEMS_PER_PAGE, totalPages, hasNextPage: historyPage < totalPages, hasPrevPage: historyPage > 1 };
          return (
            <>
              <Table
                columns={[
                  { key: 'title', label: 'Title', render: (v) => <span className="font-medium text-gainsboro-200">{v}</span> },
                  { key: 'eco_type', label: 'Type', render: (v) => <Badge status={v} /> },
                  { key: 'product_name', label: 'Product' },
                  { key: 'stage_name', label: 'Stage', render: (v) => <Badge status={v} /> },
                  { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
                  { key: 'changes', label: 'Changes', render: (v, row) => (
                    <button onClick={() => setSelectedEco(row)} className="text-xs text-sienna-400 hover:text-sienna-300 underline">
                      {v ? (Array.isArray(v) ? v.length : 0) : 0} changes
                    </button>
                  )},
                  { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
                ]}
                data={paginatedHistory}
                emptyMessage="No ECOs match your filters"
              />
              <Pagination meta={meta} onPageChange={setHistoryPage} />
            </>
          );
        })()}

        {/* Product Versions Tab */}
        {activeTab === 'product-versions' && (
          <div className="space-y-4">
            {/* Search input for Product Versions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
                <input
                  type="text"
                  placeholder="Search product name..."
                  value={versionSearch}
                  onChange={(e) => setVersionSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 placeholder-gainsboro-500 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            {Object.entries(matrixGrouped)
              .filter(([name]) => !versionSearch || name.toLowerCase().includes(versionSearch.toLowerCase()))
              .map(([name, versions]) => (
              <div key={name} className="glass-card p-4">
                <h3 className="text-lg font-semibold text-gainsboro-200 mb-3">{name}</h3>
                <div className="space-y-2">
                  {versions.map((v, i) => (
                    <div key={i} className="flex items-center gap-4 bg-navy-700/50 rounded-lg px-4 py-2.5">
                      <span className="text-sienna-400 font-mono text-sm font-bold">{v.version}</span>
                      <Badge status={v.product_status} />
                      {v.bom_version && (
                        <span className="text-xs text-gainsboro-400">BoM {v.bom_version} <Badge status={v.bom_status} className="ml-1" /></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {Object.entries(matrixGrouped).filter(([name]) => !versionSearch || name.toLowerCase().includes(versionSearch.toLowerCase())).length === 0 && <p className="text-sm text-gainsboro-500">No version data</p>}
          </div>
        )}

        {activeTab === 'active-matrix' && (() => {
          const filteredMatrix = versionMatrix.filter((row) => {
            if (matrixFilters.search && !row.name?.toLowerCase().includes(matrixFilters.search.toLowerCase())) return false;
            if (matrixFilters.status && row.product_status !== matrixFilters.status) return false;
            return true;
          });
          const total = filteredMatrix.length;
          const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
          const start = (matrixPage - 1) * ITEMS_PER_PAGE;
          const paginatedMatrix = filteredMatrix.slice(start, start + ITEMS_PER_PAGE);
          const meta = { total, page: matrixPage, limit: ITEMS_PER_PAGE, totalPages, hasNextPage: matrixPage < totalPages, hasPrevPage: matrixPage > 1 };
          return (
            <>
              {/* Active Matrix Filters */}
              <div className="flex gap-3 items-center mb-4">
                <Filter size={14} className="text-gainsboro-500" />
                <select className={inputClass} value={matrixFilters.status} onChange={(e) => { setMatrixFilters({ ...matrixFilters, status: e.target.value }); setMatrixPage(1); }}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="deprecated">Deprecated</option>
                </select>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
                  <input
                    className="pl-9 pr-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 placeholder-gainsboro-500 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent w-56"
                    placeholder="Search product..."
                    value={matrixFilters.search}
                    onChange={(e) => { setMatrixFilters({ ...matrixFilters, search: e.target.value }); setMatrixPage(1); }}
                  />
                </div>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-600">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gainsboro-400 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gainsboro-400 uppercase">Version</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gainsboro-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gainsboro-400 uppercase">BoM Version</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gainsboro-400 uppercase">BoM Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-600/50">
                    {paginatedMatrix.map((row, i) => (
                      <tr key={i} className="hover:bg-navy-700 transition-colors">
                        <td className="px-4 py-3 text-sm text-gainsboro-200 font-medium">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-sienna-400 font-mono">{row.version}</td>
                        <td className="px-4 py-3"><Badge status={row.product_status} /></td>
                        <td className="px-4 py-3 text-sm text-gainsboro-300">{row.bom_version || '—'}</td>
                        <td className="px-4 py-3">{row.bom_status ? <Badge status={row.bom_status} /> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} onPageChange={setMatrixPage} />
            </>
          );
        })()}

        {/* Analytics Tab (Charts) */}
        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ECO Status Distribution Pie Chart */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gainsboro-200 mb-4 flex items-center gap-2">
                <PieIcon size={16} className="text-sienna-400" /> ECO Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ status, count }) => `${status} (${count})`}
                  >
                    {analytics.statusDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#dcdcdc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly ECO Trend Bar Chart */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gainsboro-200 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-sienna-400" /> ECOs Created Per Month
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="ECOs" fill="#A0522D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Throughput */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gainsboro-200 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-sienna-400" /> Stage Throughput
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.stageStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="stage" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="ECOs" fill="#5F9EA0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ECO Type Distribution */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gainsboro-200 mb-4 flex items-center gap-2">
                <PieIcon size={16} className="text-sienna-400" /> ECO Type Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.typeDistribution}
                    dataKey="count"
                    nameKey="eco_type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    label={({ eco_type, count }) => `${eco_type} (${count})`}
                  >
                    {analytics.typeDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#dcdcdc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Diff popover modal */}
      {selectedEco && (
        <Modal isOpen={true} onClose={() => setSelectedEco(null)} title={`Changes: ${selectedEco.title}`} size="lg">
          <DiffViewer eco={{ ...selectedEco, changes: selectedEco.changes || [] }} />
        </Modal>
      )}
    </div>
  );
}
