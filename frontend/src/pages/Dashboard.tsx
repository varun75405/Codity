import {
  ArrowUpRight, ArrowDownRight, TrendingUp,
  CheckCircle2, Clock, PlayCircle, AlertCircle, XCircle, Layers
} from 'lucide-react';

const stats = [
  { label: 'Total Processed', value: '128,492', change: '+12.5%', up: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Workers', value: '12', change: '+2', up: true, icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'In Queue', value: '3,847', change: '-8.3%', up: false, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Failed (DLQ)', value: '47', change: '+3', up: true, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

const throughputData = [
  { hour: '00', value: 340 }, { hour: '02', value: 180 }, { hour: '04', value: 90 },
  { hour: '06', value: 210 }, { hour: '08', value: 680 }, { hour: '10', value: 920 },
  { hour: '12', value: 1100 }, { hour: '14', value: 980 }, { hour: '16', value: 1250 },
  { hour: '18', value: 870 }, { hour: '20', value: 560 }, { hour: '22', value: 420 },
];
const maxVal = Math.max(...throughputData.map(d => d.value));

const queues = [
  { name: 'email-notifications', priority: 10, concurrency: 8, pending: 1423, processed: 45200, failed: 12, paused: false },
  { name: 'image-processing', priority: 8, concurrency: 4, pending: 892, processed: 28300, failed: 34, paused: false },
  { name: 'payment-webhooks', priority: 10, concurrency: 6, pending: 56, processed: 12800, failed: 2, paused: false },
  { name: 'report-generation', priority: 3, concurrency: 2, pending: 0, processed: 4200, failed: 0, paused: true },
  { name: 'analytics-ingestion', priority: 5, concurrency: 10, pending: 2341, processed: 67400, failed: 8, paused: false },
];

const recentJobs = [
  { id: 'job_8f3a2c', type: 'send_welcome_email', queue: 'email-notifications', status: 'Completed', duration: '1.2s', time: '12s ago' },
  { id: 'job_7b1d4e', type: 'resize_avatar', queue: 'image-processing', status: 'Running', duration: '—', time: '18s ago' },
  { id: 'job_6c9e1f', type: 'process_payment', queue: 'payment-webhooks', status: 'Completed', duration: '0.8s', time: '24s ago' },
  { id: 'job_5a2b8d', type: 'send_invoice', queue: 'email-notifications', status: 'Failed', duration: '3.1s', time: '45s ago' },
  { id: 'job_4d7c3a', type: 'generate_report', queue: 'report-generation', status: 'Queued', duration: '—', time: '1m ago' },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  Completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  Running: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: PlayCircle },
  Failed: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  Queued: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
};

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of your job scheduling platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
            <div className="flex items-center mt-2 gap-1">
              {s.up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-medium ${s.up && s.label !== 'Failed (DLQ)' ? 'text-emerald-600' : 'text-red-600'}`}>{s.change}</span>
              <span className="text-sm text-gray-400 ml-1">vs last 24h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Throughput Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Throughput</h3>
              <p className="text-sm text-gray-500">Jobs processed per hour (last 24h)</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">+18% avg</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-44">
            {throughputData.map((d) => (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer relative group"
                  style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: '4px' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap">
                    {d.value.toLocaleString()} jobs
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{d.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Queue Health</h3>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            {queues.slice(0, 4).map((q) => (
              <div key={q.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 truncate">{q.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${q.paused ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {q.paused ? 'Paused' : 'Active'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${q.paused ? 'bg-amber-400' : q.pending > 1000 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((q.pending / 3000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{q.pending.toLocaleString()} pending · {q.processed.toLocaleString()} processed</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          <a href="#/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all →</a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-3">Job ID</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Queue</th>
              <th className="px-6 py-3">Status</th><th className="px-6 py-3">Duration</th><th className="px-6 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentJobs.map((j) => {
              const cfg = statusConfig[j.status];
              const Icon = cfg.icon;
              return (
                <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-sm text-indigo-600">{j.id}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-700">{j.type}</td>
                  <td className="px-6 py-3.5"><span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{j.queue}</span></td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{j.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-500 font-mono">{j.duration}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-400">{j.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
