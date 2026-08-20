import React from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Platform configuration and defaults</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Global Worker Settings</h3>
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heartbeat Interval (seconds)</label>
              <input type="number" defaultValue={15} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dead Worker Timeout (seconds)</label>
              <input type="number" defaultValue={60} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Data Retention</h3>
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keep Successful Jobs (days)</label>
              <input type="number" defaultValue={7} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keep Failed Jobs (days)</label>
              <input type="number" defaultValue={30} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}
