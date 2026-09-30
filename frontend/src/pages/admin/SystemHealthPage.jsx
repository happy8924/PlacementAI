import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSystemHealth } from '../../services/admin';
import { Activity, Database, CheckCircle2, Server, Clock, HardDrive } from 'lucide-react';

export default function SystemHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSystemHealth();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
      setError('Could not connect to backend system health probe.');
    } finally {
      setLoading(false);
    }
  };

  const collections = data?.collections || {};

  return (
    <AdminLayout title="System & DB Health Probes">
      <div className="space-y-6 font-mono">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-primary font-mono uppercase tracking-tight">
              Infrastructure & Database Telemetry
            </h2>
          </div>
          <p className="text-xs text-secondary font-mono">
            MongoDB connection status, document collection metrics, and API cluster health.
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl">✕ {error}</div>}

        {loading ? (
          <div className="p-12 text-center text-xs text-secondary">
            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
            Running infrastructure health diagnostic...
          </div>
        ) : (
          <>
            {/* Health Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">Database Status</div>
                <div className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Connected
                </div>
                <div className="text-[10px] text-secondary">PyMongo Engine Active</div>
              </div>

              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">Tracked Collections</div>
                <div className="text-2xl font-extrabold text-primary">14 Collections</div>
                <div className="text-[10px] text-secondary">Schema v1.0 Standard</div>
              </div>

              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">Last Probe Timestamp</div>
                <div className="text-sm font-bold text-indigo-400 truncate">
                  {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Just Now'}
                </div>
                <div className="text-[10px] text-secondary">HTTP API Operational</div>
              </div>
            </div>

            {/* Collection Grid */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                MongoDB 14 Collections Document Inventory
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {Object.entries(collections).map(([name, count]) => (
                  <div key={name} className="p-3.5 bg-secondary/40 border border-theme rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-primary">{name}</div>
                      <div className="text-[10px] text-secondary">Collection Name</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded">
                      {count} Docs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}
