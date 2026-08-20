import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, List, Activity, Settings, Database,
  FileText, AlertTriangle, ChevronLeft, ChevronRight, LogOut, Bell, Search, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Queues', icon: Database, path: '/queues' },
  { label: 'Jobs', icon: List, path: '/jobs' },
  { label: 'Workers', icon: Activity, path: '/workers' },
  { label: 'Dead Letter Queue', icon: AlertTriangle, path: '/dlq' },
  { label: 'Logs', icon: FileText, path: '/logs' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
        <Zap className="w-8 h-8 text-indigo-400 flex-shrink-0" />
        {!collapsed && <span className="ml-3 text-lg font-bold tracking-tight">JobForge</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User */}
      <div className="p-3 border-t border-slate-700/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0">V</div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Varun</p>
              <p className="text-xs text-slate-400 truncate">Admin</p>
            </div>
          )}
          {!collapsed && <LogOut className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer flex-shrink-0" />}
        </div>
      </div>
    </aside>
  );
}

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, queues, workers..."
            className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">Environment</span>
        <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Production</span>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {showNotifications && (
          <div className="absolute top-14 right-6 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100 font-semibold text-sm">Alerts & Notifications</div>
            <div className="p-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
              <p className="text-sm text-gray-800"><strong>worker-node-3</strong> missed heartbeat</p>
              <p className="text-xs text-gray-500 mt-1">2 mins ago</p>
            </div>
            <div className="p-3 hover:bg-gray-50 cursor-pointer">
              <p className="text-sm text-gray-800"><strong>job_5a2b8d</strong> moved to DLQ</p>
              <p className="text-xs text-gray-500 mt-1">15 mins ago</p>
            </div>
            <div className="p-2 border-t border-gray-100 text-center">
              <button className="text-xs text-indigo-600 font-medium hover:underline">Mark all as read</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
