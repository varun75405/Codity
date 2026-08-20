import React from 'react';
import { Terminal } from 'lucide-react';

const logs = [
  "[2024-08-20 14:32:10] [INFO] Worker wrk_8a9b2c claimed job_8f3a2c from email-notifications",
  "[2024-08-20 14:32:11] [INFO] Job job_8f3a2c completed successfully in 1.2s",
  "[2024-08-20 14:32:15] [WARN] Worker wrk_5a2b8d missed heartbeat. Marking as Offline.",
  "[2024-08-20 14:32:16] [INFO] Re-queueing 1 abandoned jobs from wrk_5a2b8d",
  "[2024-08-20 14:32:20] [ERROR] Job job_5a2b8d failed attempt 3/3. Moving to DLQ. Reason: SMTP timeout",
  "[2024-08-20 14:32:25] [INFO] Dispatcher evaluated cron jobs. Enqueued 2 recurring jobs."
];

export default function Logs() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Terminal className="w-6 h-6" /> System Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">Real-time execution logs from workers and dispatchers</p>
      </div>

      <div className="bg-slate-900 rounded-xl flex-1 overflow-hidden flex flex-col shadow-inner">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <div className="p-4 font-mono text-sm overflow-y-auto flex-1">
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARN]') ? 'text-amber-400' : 'text-emerald-400'}`}>
              {log}
            </div>
          ))}
          <div className="text-slate-500 mt-2 animate-pulse">Waiting for new logs...</div>
        </div>
      </div>
    </div>
  );
}
