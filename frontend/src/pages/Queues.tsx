import React from 'react';
import { Database, Plus, Play, Pause, Trash2 } from 'lucide-react';

const queues = [
  { id: 'q_1', name: 'email-notifications', priority: 10, concurrency: 8, retryPolicy: 'Exponential', status: 'Active' },
  { id: 'q_2', name: 'image-processing', priority: 8, concurrency: 4, retryPolicy: 'Linear', status: 'Active' },
  { id: 'q_3', name: 'payment-webhooks', priority: 10, concurrency: 6, retryPolicy: 'Exponential', status: 'Active' },
  { id: 'q_4', name: 'report-generation', priority: 3, concurrency: 2, retryPolicy: 'Fixed', status: 'Paused' },
];

export default function Queues() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queues</h1>
          <p className="text-sm text-gray-500 mt-1">Manage job queues and concurrency limits</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Create Queue
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-left text-gray-500 uppercase tracking-wider text-xs font-medium">
              <th className="px-6 py-3">Queue Name</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Concurrency</th>
              <th className="px-6 py-3">Retry Policy</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {queues.map(q => (
              <tr key={q.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" /> {q.name}
                </td>
                <td className="px-6 py-4">{q.priority}</td>
                <td className="px-6 py-4">{q.concurrency} workers</td>
                <td className="px-6 py-4">{q.retryPolicy}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${q.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {q.status === 'Active' ? (
                    <button className="p-1.5 text-gray-400 hover:text-amber-600 rounded bg-gray-50 hover:bg-amber-50" title="Pause"><Pause className="w-4 h-4" /></button>
                  ) : (
                    <button className="p-1.5 text-gray-400 hover:text-emerald-600 rounded bg-gray-50 hover:bg-emerald-50" title="Resume"><Play className="w-4 h-4" /></button>
                  )}
                  <button className="p-1.5 text-gray-400 hover:text-red-600 rounded bg-gray-50 hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
