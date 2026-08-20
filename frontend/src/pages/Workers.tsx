import { Activity, Server, Clock, AlertTriangle, ShieldCheck, List } from 'lucide-react';

const workers = [
  { id: 'wrk_8a9b2c', hostname: 'ip-10-0-1-14.ec2', status: 'Active', cpu: '42%', mem: '1.2GB', lastSeen: 'Just now', jobs: 4 },
  { id: 'wrk_7b1d4e', hostname: 'ip-10-0-1-15.ec2', status: 'Active', cpu: '89%', mem: '2.1GB', lastSeen: '2s ago', jobs: 8 },
  { id: 'wrk_6c9e1f', hostname: 'ip-10-0-1-22.ec2', status: 'Active', cpu: '12%', mem: '0.8GB', lastSeen: '5s ago', jobs: 0 },
  { id: 'wrk_5a2b8d', hostname: 'ip-10-0-2-41.ec2', status: 'ShuttingDown', cpu: '5%', mem: '1.1GB', lastSeen: '12s ago', jobs: 1 },
  { id: 'wrk_4d7c3a', hostname: 'ip-10-0-2-42.ec2', status: 'Offline', cpu: '—', mem: '—', lastSeen: '4m ago', jobs: 0 },
];

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  Active: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: ShieldCheck },
  ShuttingDown: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  Offline: { color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200', icon: AlertTriangle },
};

export default function Workers() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Worker Pool</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor the health and capacity of your distributed worker nodes</p>
      </div>

      {/* Worker Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Nodes</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Capacity</p>
            <p className="text-2xl font-bold text-gray-900">32 <span className="text-sm font-normal text-gray-500">concurrency</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <List className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Currently Executing</p>
            <p className="text-2xl font-bold text-gray-900">13 <span className="text-sm font-normal text-gray-500">jobs</span></p>
          </div>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-3">Worker ID</th><th className="px-6 py-3">Hostname</th><th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">CPU / Mem</th><th className="px-6 py-3">Active Jobs</th><th className="px-6 py-3">Last Heartbeat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workers.map((w) => {
              const cfg = statusConfig[w.status];
              const Icon = cfg.icon;
              return (
                <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-indigo-600 font-medium">{w.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-mono">{w.hostname}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-600">CPU: <span className="font-medium text-gray-900">{w.cpu}</span></span>
                      <span className="text-xs text-gray-600">Mem: <span className="font-medium text-gray-900">{w.mem}</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${w.jobs > 5 ? 'text-amber-600' : 'text-gray-900'}`}>{w.jobs}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{w.lastSeen}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
