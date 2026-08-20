import React, { useState } from 'react';
import {
  Search, Filter, CheckCircle2, Clock, PlayCircle, XCircle,
  RotateCcw, ChevronLeft, ChevronRight, Eye, MoreHorizontal
} from 'lucide-react';

const allJobs = [
  { id: 'job_8f3a2c', type: 'send_welcome_email', queue: 'email-notifications', status: 'Completed', attempts: 1, priority: 10, duration: '1.2s', created: '2024-08-20 14:32:10', payload: '{"to":"user@example.com"}' },
  { id: 'job_7b1d4e', type: 'resize_avatar', queue: 'image-processing', status: 'Running', attempts: 1, priority: 8, duration: '—', created: '2024-08-20 14:31:55', payload: '{"width":200}' },
  { id: 'job_6c9e1f', type: 'process_payment', queue: 'payment-webhooks', status: 'Completed', attempts: 1, priority: 10, duration: '0.8s', created: '2024-08-20 14:31:40', payload: '{"amount":49.99}' },
  { id: 'job_5a2b8d', type: 'send_invoice', queue: 'email-notifications', status: 'Failed', attempts: 3, priority: 10, duration: '3.1s', created: '2024-08-20 14:31:20', payload: '{"invoice_id":"INV-2024"}' },
  { id: 'job_4d7c3a', type: 'generate_report', queue: 'report-generation', status: 'Queued', attempts: 0, priority: 3, duration: '—', created: '2024-08-20 14:31:05', payload: '{"report":"monthly"}' },
  { id: 'job_3e6f9b', type: 'sync_inventory', queue: 'analytics-ingestion', status: 'Completed', attempts: 1, priority: 5, duration: '4.7s', created: '2024-08-20 14:30:50', payload: '{"source":"warehouse"}' },
  { id: 'job_2a8c5d', type: 'send_reset_email', queue: 'email-notifications', status: 'Completed', attempts: 1, priority: 10, duration: '0.9s', created: '2024-08-20 14:30:32', payload: '{"to":"admin@co.com"}' },
  { id: 'job_1f4b7e', type: 'compress_video', queue: 'image-processing', status: 'Failed', attempts: 3, priority: 8, duration: '12.3s', created: '2024-08-20 14:30:10', payload: '{"file":"upload.mp4"}' },
  { id: 'job_0c3d9a', type: 'charge_subscription', queue: 'payment-webhooks', status: 'Scheduled', attempts: 0, priority: 10, duration: '—', created: '2024-08-20 14:29:55', payload: '{"plan":"pro"}' },
  { id: 'job_9e2a1b', type: 'process_refund', queue: 'payment-webhooks', status: 'Completed', attempts: 2, priority: 10, duration: '2.1s', created: '2024-08-20 14:29:30', payload: '{"refund_id":"RF-401"}' },
];

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  Completed: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  Running: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: PlayCircle },
  Failed: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
  Queued: { color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', icon: Clock },
  Scheduled: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Clock },
};

const statuses = ['All', 'Queued', 'Scheduled', 'Running', 'Completed', 'Failed'];

export default function Jobs() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const filtered = allJobs.filter(j =>
    (selectedStatus === 'All' || j.status === selectedStatus) &&
    (searchTerm === '' || j.id.includes(searchTerm) || j.type.includes(searchTerm) || j.queue.includes(searchTerm))
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Explorer</h1>
        <p className="text-sm text-gray-500 mt-1">Browse, filter, and manage all jobs across your queues</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job ID, type, or queue..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  selectedStatus === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-3">Job ID</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Queue</th>
              <th className="px-6 py-3">Status</th><th className="px-6 py-3">Attempts</th><th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Created</th><th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((j) => {
              const cfg = statusConfig[j.status];
              const Icon = cfg.icon;
              return (
                <React.Fragment key={j.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setExpandedJob(expandedJob === j.id ? null : j.id)}>
                    <td className="px-6 py-3.5 font-mono text-sm text-indigo-600 font-medium">{j.id}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-800">{j.type}</td>
                    <td className="px-6 py-3.5"><span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md font-medium">{j.queue}</span></td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{j.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{j.attempts}/{j.status === 'Failed' ? 3 : '∞'}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500 font-mono">{j.duration}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-400">{j.created}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {j.status === 'Failed' && (
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                            <RotateCcw className="w-3 h-3" /> Retry
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedJob === j.id && (
                    <tr key={`${j.id}-detail`}>
                      <td colSpan={8} className="px-6 py-4 bg-slate-50 border-b border-gray-200">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Payload</span><code className="text-xs bg-white p-2 rounded border block break-all">{j.payload}</code></div>
                          <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Priority</span><span className="font-medium">{j.priority}</span></div>
                          <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Retry Policy</span><span className="font-medium">Exponential · max 3 · 1s initial</span></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
          <span className="text-sm text-gray-500">Showing {filtered.length} of {allJobs.length} jobs</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-white"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm text-gray-600 px-3">Page 1 of 1</span>
            <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
