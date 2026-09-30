import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAiOverview } from '../../services/admin';
import { Cpu, Sparkles, FileText, Map, Award, CheckCircle2, Clock } from 'lucide-react';

export default function AiCenterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAiOverview();
  }, []);

  const fetchAiOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAiOverview();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching AI overview:', err);
      setError('Could not load AI Center metrics from database.');
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const recent = data?.recent_analyses || [];

  return (
    <AdminLayout title="AI Center Operations">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-extrabold text-primary font-mono uppercase tracking-tight">
              AI Engine & Parsing Analytics
            </h2>
          </div>
          <p className="text-xs text-secondary font-mono">
            Monitor Gemini AI resume parsing throughput, ATS score distributions, and automated learning roadmap generation.
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl">✕ {error}</div>}

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-secondary">
            <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading AI engine statistics...
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">Total Resumes Uploaded</div>
                <div className="text-3xl font-extrabold text-primary">{stats.total_resumes || 0}</div>
                <div className="text-[10px] text-emerald-400 font-bold">{stats.completed_resumes || 0} Parsed</div>
              </div>

              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">AI Resume Analyses</div>
                <div className="text-3xl font-extrabold text-purple-400">{stats.total_ai_analyses || 0}</div>
                <div className="text-[10px] text-secondary">Generated via Gemini</div>
              </div>

              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">Learning Roadmaps</div>
                <div className="text-3xl font-extrabold text-indigo-400">{stats.total_roadmaps || 0}</div>
                <div className="text-[10px] text-secondary">Personalized Curricula</div>
              </div>

              <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase">Average Candidate ATS Score</div>
                <div className="text-3xl font-extrabold text-emerald-400">{stats.average_ats_score || 0}%</div>
                <div className="text-[10px] text-secondary">Across Active Resumes</div>
              </div>
            </div>

            {/* Recent Analyses List */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-primary font-mono uppercase tracking-wider">
                Recent AI Analyses
              </h3>

              {recent.length === 0 ? (
                <p className="text-xs font-mono text-secondary">No AI analysis records stored in database yet.</p>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {recent.map((a) => (
                    <div key={a.id} className="p-4 bg-secondary/40 border border-theme rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">Target Role: {a.primary_role || 'Software Engineer'}</span>
                        <span className="text-[10px] text-purple-400 font-bold px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded">
                          ATS Match: {a.ats_score || a.match_score || 0}%
                        </span>
                      </div>
                      <div className="text-[11px] text-secondary">
                        <span className="font-bold text-primary">Detected Skills:</span> {(a.skills_detected || []).join(', ') || 'None'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}
