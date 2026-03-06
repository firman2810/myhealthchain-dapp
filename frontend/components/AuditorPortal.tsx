import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Badge, Alert, AlertDescription } from './ui/elements';
import { Search, Filter, AlertCircle, RefreshCw, Users, FileText, Eye, ShieldAlert, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../client';

interface AuditLog {
    id: number;
    timestamp: string;
    doctorName: string;
    doctorId: string;
    action: string;
    patientRef: string;
    status: 'SUCCESS' | 'DENIED' | 'FAIL';
}

interface DailyCount {
    date: string;
    creates: number;
    views: number;
    denied: number;
}

interface DashboardStats {
    doctorsCount: number;
    recordCreates7d: number;
    recordViews7d: number;
    deniedAttempts7d: number;
    dailySeries: DailyCount[];
}

export const AuditorPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'logs' | 'dashboard'>('dashboard');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hospital Auditor Portal</h1>
                    <p className="text-slate-500 font-medium">Monitor organizational compliance and access logs.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Org Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Audit Logs
                    </button>
                </div>
            </div>

            {activeTab === 'logs' ? <AuditLogsView /> : <OrgDashboardView />}
        </div>
    );
};

const AuditLogsView: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const [filterAction, setFilterAction] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [dateRange, setDateRange] = useState<string>('7d');

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set('range', dateRange);
            if (filterAction !== 'ALL') params.set('action', filterAction);
            if (filterStatus !== 'ALL') params.set('status', filterStatus);

            const data = await apiFetch<AuditLog[]>(`/org/audit-logs?${params.toString()}`);
            setLogs(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load audit logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchLogs();
    }, [dateRange, filterAction, filterStatus]);

    const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
    const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        System Audit Logs
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <select
                            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                        >
                            <option value="ALL">All Actions</option>
                            <option value="CREATE_RECORD">Create Record</option>
                            <option value="VIEW_RECORD">View Record</option>
                        </select>
                        <select
                            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="DENIED">Denied</option>
                            <option value="FAIL">Failed</option>
                        </select>
                        <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p className="font-medium">Loading audit logs...</p>
                    </div>
                ) : error ? (
                    <div className="p-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={fetchLogs} variant="outline">Try Again</Button>
                        </div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <Search className="w-8 h-8 text-slate-300 mb-4" />
                        <p className="font-medium">No audit logs found matching criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Timestamp</th>
                                    <th className="px-6 py-3 font-semibold">Doctor</th>
                                    <th className="px-6 py-3 font-semibold">Action</th>
                                    <th className="px-6 py-3 font-semibold">Patient Ref</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map((log) => (
                                    <tr key={log.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{log.doctorName}</div>
                                            <div className="text-xs text-slate-500">{log.doctorId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                                                {log.action.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {log.patientRef}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === 'SUCCESS' ? (
                                                <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">SUCCESS</Badge>
                                            ) : log.status === 'DENIED' ? (
                                                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200">DENIED</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">{log.status}</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination bar */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>–<span className="font-semibold text-slate-700">{Math.min(currentPage * PAGE_SIZE, logs.length)}</span> of <span className="font-semibold text-slate-700">{logs.length}</span> records
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-600 font-medium px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const OrgDashboardView: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartRange, setChartRange] = useState<string>('7d');

    const fetchStats = async (range: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch<DashboardStats>(`/org/dashboard-stats?range=${range}`);
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(chartRange);
    }, [chartRange]);

    const rangeLabel = chartRange === '24h' ? '24h' : chartRange === '30d' ? '30d' : '7d';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="font-medium">Loading organizational metrics...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || 'An unknown error occurred.'}</AlertDescription>
                <Button onClick={fetchStats} variant="outline" size="sm" className="mt-4">Retry</Button>
            </Alert>
        );
    }

    // Build chart data — fallback to KPI-based synthetic data if dailySeries is missing
    const rawSeries = stats.dailySeries && stats.dailySeries.length > 0 ? stats.dailySeries : null;

    const buildFallbackSeries = (): DailyCount[] => {
        // If dailySeries is missing (old backend), spread KPI totals across "today"
        const days: DailyCount[] = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toISOString().slice(0, 10),
                creates: i === 0 ? stats.recordCreates7d : 0,
                views: i === 0 ? stats.recordViews7d : 0,
                denied: i === 0 ? stats.deniedAttempts7d : 0,
            });
        }
        return days;
    };

    const dailySeries = rawSeries ?? buildFallbackSeries();
    const totalActivity = stats.recordCreates7d + stats.recordViews7d + stats.deniedAttempts7d;

    // Format X-axis labels: hourly "2 PM" for 24h, daily "Mar 01" for 7d/30d
    const chartData = dailySeries.map(d => {
        let label: string;
        if (chartRange === '24h' && d.date.includes('T')) {
            // Hourly format: "2026-03-06T14" → "2 PM"
            const hour = parseInt(d.date.split('T')[1], 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            label = `${h12} ${ampm}`;
        } else {
            // Daily format: "2026-03-06" → "Mar 06"
            label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        }
        return { ...d, label };
    });

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null;
        return (
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                fontSize: '13px',
            }}>
                <p style={{ fontWeight: 700, marginBottom: 6, color: '#334155' }}>{label}</p>
                {payload.map((entry: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
                        <span style={{ color: '#64748b' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards — fixed grid alignment */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500 truncate">Active Doctors</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.doctorsCount}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl flex-shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500 truncate">Records Created ({rangeLabel})</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.recordCreates7d}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl flex-shrink-0">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500 truncate">Record Views ({rangeLabel})</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.recordViews7d}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-xl flex-shrink-0">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500 truncate">Denied Attempts ({rangeLabel})</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.deniedAttempts7d}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Line Chart */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-lg flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                            Activity Overview
                        </CardTitle>
                        <select
                            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-fit"
                            value={chartRange}
                            onChange={(e) => setChartRange(e.target.value)}
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {totalActivity > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                style={{ cursor: 'crosshair' }}
                            >
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={false}
                                    padding={{ left: 10, right: 10 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={false}
                                    width={40}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
                                    iconType="circle"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="creates"
                                    name="Records Created"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: '#10b981', stroke: '#10b981', strokeWidth: 3, filter: 'url(#glow)' }}
                                    animationDuration={800}
                                    animationEasing="ease-in-out"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    name="Record Views"
                                    stroke="#8b5cf6"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: '#8b5cf6', stroke: '#8b5cf6', strokeWidth: 3, filter: 'url(#glow)' }}
                                    animationDuration={800}
                                    animationEasing="ease-in-out"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="denied"
                                    name="Denied Attempts"
                                    stroke="#ef4444"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: '#ef4444', stroke: '#ef4444', strokeWidth: 3, filter: 'url(#glow)' }}
                                    animationDuration={800}
                                    animationEasing="ease-in-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <BarChart3 className="w-12 h-12 mb-4 text-slate-200" />
                            <p className="font-medium text-slate-500">No activity data yet</p>
                            <p className="text-sm mt-1">Audit events will appear here once doctors start creating or viewing records.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
