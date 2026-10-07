import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Loader2,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { getStudentApplications } from '../../services/student';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    applied: 'bg-blue-500/10 text-blue-600 border-blue-200',
    shortlisted: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    interview: 'bg-purple-500/10 text-purple-600 border-purple-200',
    hired: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    rejected: 'bg-red-500/10 text-red-600 border-red-200',
  };

  const statusIcons = {
    applied: Clock,
    shortlisted: CheckCircle2,
    interview: Calendar,
    hired: CheckCircle2,
    rejected: XCircle,
  };

  const Icon = statusIcons[status?.toLowerCase()] || Clock;
  const style = statusStyles[status?.toLowerCase()] || statusStyles.applied;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Applied';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

export default function StudentApplicationsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getStudentApplications();
        if (data.success) {
          setApplications(data.applications || []);
        }
      } catch (err) {
        setError('Failed to fetch applications. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="My Applications"
          subtitle="Track the status of your submitted job applications"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Application History</h2>
            <div className="text-sm text-secondary bg-secondary/20 px-3 py-1 rounded-full">
              {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-secondary">
              <Loader2 className="w-8 h-8 animate-spin text-theme mb-4" />
              <p>Loading your applications...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-primary">No Applications Yet</h3>
                <p className="text-sm text-secondary">
                  You haven't applied to any roles. Head over to the Jobs & Opportunities section to start applying.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card-bg border border-theme rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10 border-b border-theme text-xs uppercase tracking-wider text-secondary font-semibold">
                      <th className="p-4 pl-6">Company & Role</th>
                      <th className="p-4">Applied On</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-secondary/5 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-theme/10 flex items-center justify-center shrink-0 border border-theme">
                              <Building2 className="w-6 h-6 text-theme" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-primary group-hover:text-theme transition-colors">
                                {app.job?.title || 'Unknown Role'}
                              </h4>
                              <p className="text-xs text-secondary mt-0.5">
                                {app.job?.company_name || 'Unknown Company'}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
                                {app.job?.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{app.job.location}</span>
                                  </div>
                                )}
                                {app.job?.job_type && (
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span>{app.job.job_type}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top pt-6">
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(app.applied_at)}</span>
                          </div>
                        </td>
                        <td className="p-4 align-top pt-6">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="p-4 pr-6 align-top pt-5 text-right">
                          <button 
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/20 text-secondary hover:text-primary transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
