import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

const dlqJobs = [
  { id: 'job_5a2b8d', queue: 'email-notifications', error: 'SMTP connection timeout', failedAt: '2 hours ago', payload: '{"to":"user1@example.com"}' },
  { id: 'job_1f4b7e', queue: 'image-processing', error: 'Memory limit exceeded during compression', failedAt: '5 hours ago', payload: '{"file":"huge_upload.mp4"}' },
  { id: 'job_9x8y7z', queue: 'payment-webhooks', error: 'External API 503 Service Unavailable', failedAt: '1 day ago', payload: '{"user_id":"u_123"}' },
];

export default function DLQ() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" /> Dead Letter Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">Permanently failed jobs that exhausted all retry attempts</p>
        </div>
        <button className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-100">
          <Trash2 className="w-4 h-4" /> Purge All
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-left text-gray-500 uppercase tracking-wider text-xs font-medium">
              <th className="px-6 py-3">Job ID</th>
              <th className="px-6 py-3">Queue</th>
              <th className="px-6 py-3 w-1/3">Error Reason</th>
              <th className="px-6 py-3">Failed At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dlqJobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-mono text-indigo-600">{job.id}</td>
                <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{job.queue}</span></td>
                <td className="px-6 py-4 text-red-600 font-mono text-xs break-words">{job.error}</td>
                <td className="px-6 py-4 text-gray-500">{job.failedAt}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100 inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Requeue
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
