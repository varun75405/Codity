import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, List, Activity } from 'lucide-react';

function Dashboard() {
  return <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Queue Overview</h1>
    {/* Metrics components would go here */}
  </div>;
}

function Jobs() {
  return <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Job Explorer</h1>
    {/* Job list, filters, and manual retry button would go here */}
  </div>;
}

function Workers() {
  return <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Worker Monitor</h1>
    {/* Worker status table would go here */}
  </div>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Job Scheduler</h2>
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
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/workers" element={<Workers />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
