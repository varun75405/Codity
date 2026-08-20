import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, List, Activity } from 'lucide-react';

function Dashboard() {
  return <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Queue Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm text-gray-500">Total Jobs</h3>
        <p className="text-3xl font-bold text-blue-600">12,847</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm text-gray-500">Active Workers</h3>
        <p className="text-3xl font-bold text-green-600">5</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm text-gray-500">Failed (DLQ)</h3>
        <p className="text-3xl font-bold text-red-600">23</p>
      </div>
    </div>
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Queues</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Queue</th><th className="pb-2">Priority</th><th className="pb-2">Concurrency</th><th className="pb-2">Status</th><th className="pb-2">Pending</th>
        </tr></thead>
        <tbody>
          <tr className="border-b"><td className="py-2">email-notifications</td><td>10</td><td>5</td><td><span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span></td><td>142</td></tr>
          <tr className="border-b"><td className="py-2">image-processing</td><td>5</td><td>3</td><td><span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span></td><td>89</td></tr>
          <tr><td className="py-2">report-generation</td><td>1</td><td>2</td><td><span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Paused</span></td><td>0</td></tr>
        </tbody>
      </table>
    </div>
  </div>;
}

function Jobs() {
  const jobs = [
    { id: 'a1b2c3', type: 'send_email', status: 'Completed', queue: 'email-notifications', attempts: 1, created: '2 min ago' },
    { id: 'd4e5f6', type: 'resize_image', status: 'Running', queue: 'image-processing', attempts: 1, created: '5 min ago' },
    { id: 'g7h8i9', type: 'send_email', status: 'Failed', queue: 'email-notifications', attempts: 3, created: '12 min ago' },
    { id: 'j0k1l2', type: 'generate_pdf', status: 'Queued', queue: 'report-generation', attempts: 0, created: '15 min ago' },
    { id: 'm3n4o5', type: 'send_sms', status: 'Scheduled', queue: 'email-notifications', attempts: 0, created: '20 min ago' },
  ];
  const statusColor: Record<string, string> = {
    Completed: 'bg-green-100 text-green-700', Running: 'bg-blue-100 text-blue-700',
    Failed: 'bg-red-100 text-red-700', Queued: 'bg-gray-100 text-gray-700', Scheduled: 'bg-purple-100 text-purple-700'
  };
  return <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Job Explorer</h1>
      <select className="border rounded px-3 py-1 text-sm"><option>All Statuses</option><option>Queued</option><option>Running</option><option>Completed</option><option>Failed</option></select>
    </div>
    <div className="bg-white rounded-lg shadow">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b">
          <th className="p-3">ID</th><th className="p-3">Type</th><th className="p-3">Queue</th><th className="p-3">Status</th><th className="p-3">Attempts</th><th className="p-3">Created</th><th className="p-3">Action</th>
        </tr></thead>
        <tbody>
          {jobs.map(j => <tr key={j.id} className="border-b hover:bg-gray-50">
            <td className="p-3 font-mono text-xs">{j.id}</td>
            <td className="p-3">{j.type}</td>
            <td className="p-3">{j.queue}</td>
            <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColor[j.status]}`}>{j.status}</span></td>
            <td className="p-3">{j.attempts}</td>
            <td className="p-3 text-gray-500">{j.created}</td>
            <td className="p-3">{j.status === 'Failed' && <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">Retry</button>}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>;
}

function Workers() {
  const workers = [
    { id: 'w-001', hostname: 'worker-node-1', status: 'Active', lastSeen: '2s ago', jobs: 3 },
    { id: 'w-002', hostname: 'worker-node-2', status: 'Active', lastSeen: '5s ago', jobs: 2 },
    { id: 'w-003', hostname: 'worker-node-3', status: 'ShuttingDown', lastSeen: '8s ago', jobs: 1 },
    { id: 'w-004', hostname: 'worker-node-4', status: 'Offline', lastSeen: '3m ago', jobs: 0 },
  ];
  const statusColor: Record<string, string> = {
    Active: 'bg-green-100 text-green-700', ShuttingDown: 'bg-yellow-100 text-yellow-700', Offline: 'bg-red-100 text-red-700'
  };
  return <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Worker Monitor</h1>
    <div className="bg-white rounded-lg shadow">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b">
          <th className="p-3">ID</th><th className="p-3">Hostname</th><th className="p-3">Status</th><th className="p-3">Last Seen</th><th className="p-3">Active Jobs</th>
        </tr></thead>
        <tbody>
          {workers.map(w => <tr key={w.id} className="border-b hover:bg-gray-50">
            <td className="p-3 font-mono text-xs">{w.id}</td>
            <td className="p-3">{w.hostname}</td>
            <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColor[w.status]}`}>{w.status}</span></td>
            <td className="p-3 text-gray-500">{w.lastSeen}</td>
            <td className="p-3">{w.jobs}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">⚡ Job Scheduler</h2>
        </div>
        <ul className="p-4 space-y-2">
          <li>
            <Link to="/" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/jobs" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
              <List size={20} /> Jobs
            </Link>
          </li>
          <li>
            <Link to="/workers" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
              <Activity size={20} /> Workers
            </Link>
          </li>
        </ul>
      </nav>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/workers" element={<Workers />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
