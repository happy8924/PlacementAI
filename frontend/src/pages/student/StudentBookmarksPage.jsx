import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Briefcase, Building2, MapPin, IndianRupee, Clock, Bookmark, BookmarkCheck, LayoutGrid, List, Table2, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X, FolderHeart } from 'lucide-react';
import { getStudentBookmarks, removeStudentBookmark, getStudentApplications, applyToJob } from '../../services/student';

// --- Reuse JobModal (Ideally this would be a shared component, but for 'Ponytail approach' we'll include it directly or rely on the same structure) ---
const JobModal = ({ job, onClose, isApplied, onBookmarkToggle, onApply, applying }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-theme flex flex-col">
        <div className="sticky top-0 bg-card-bg/95 backdrop-blur z-10 border-b border-theme p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg text-primary">Job Details</h3>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary hover:bg-secondary/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-primary truncate">{job.title}</h2>
              <p className="text-secondary text-sm font-medium">{job.company_name}</p>
              
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {job.salary_package}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.job_type}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Description</h4>
              <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
            
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Requirements / Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg border border-theme text-xs font-medium text-primary bg-secondary/5">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Eligibility</h4>
              <ul className="text-sm text-secondary list-disc list-inside space-y-1">
                <li>Minimum CGPA: <span className="font-semibold text-primary">{job.min_cgpa}</span></li>
                {job.eligible_branches && job.eligible_branches.length > 0 && (
                  <li>Branches: {job.eligible_branches.join(', ')}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card-bg border-t border-theme p-4 flex gap-3 justify-end items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onBookmarkToggle(job.id); }}
            className="p-2.5 border rounded-xl transition-colors bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
          >
            <BookmarkCheck className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {
              if (!isApplied && !applying) onApply(job.id);
            }}
            disabled={isApplied || applying}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              isApplied
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
            }`}
          >
            {applying ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Applied
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Apply Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StudentBookmarksPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState(new Set());
  
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 6 : 10;
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookmarksData, appsData] = await Promise.all([
        getStudentBookmarks(),
        getStudentApplications()
      ]);
      
      if (bookmarksData.success) {
        setJobs(bookmarksData.bookmarks || []);
      }
      if (appsData.success) {
        setApplications(new Set(appsData.applications.map(a => a.job_id)));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (jobId) => {
    // Optimistic UI update
    setJobs(jobs.filter(j => j.id !== jobId));
    if (selectedJob && selectedJob.id === jobId) setSelectedJob(null);
    
    try {
      await removeStudentBookmark(jobId);
    } catch (err) {
      console.error(err);
      fetchData(); // revert
    }
  };

  const handleApply = async (jobId) => {
    setApplyingTo(jobId);
    try {
      const res = await applyToJob(jobId);
      if (res.success) {
        const newApps = new Set(applications);
        newApps.add(jobId);
        setApplications(newApps);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Application failed");
    } finally {
      setApplyingTo(null);
    }
  };

  const totalPages = Math.ceil(jobs.length / itemsPerPage) || 1;
  const currentJobs = jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // View Renders
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentJobs.map(job => {
        const isApplied = applications.has(job.id);
        const applying = applyingTo === job.id;
        
        return (
          <div key={job.id} onClick={() => setSelectedJob(job)} className="group bg-card-bg border border-theme rounded-2xl p-5 hover:shadow-xl hover:border-amber-500/30 transition-all cursor-pointer flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(job.id); }}
                className="p-2 rounded-lg transition-colors text-amber-500 bg-amber-500/10 hover:bg-red-500/10 hover:text-red-500"
                title="Remove Bookmark"
              >
                <BookmarkCheck className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 flex-1">
              <h3 className="font-bold text-primary text-lg leading-tight mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">{job.title}</h3>
              <p className="text-secondary text-sm font-medium">{job.company_name}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{job.location}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                <IndianRupee className="w-3 h-3" />
                {job.salary_package}
              </span>
            </div>
            
            <div className="pt-4 border-t border-theme flex items-center justify-between mt-auto">
              <span className="text-xs text-secondary flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(job.created_at)}
              </span>
              
              <button
                onClick={(e) => { e.stopPropagation(); if(!isApplied && !applying) handleApply(job.id); }}
                disabled={isApplied || applying}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  isApplied 
                    ? 'bg-emerald-500/10 text-emerald-600 cursor-not-allowed border border-emerald-500/20' 
                    : 'bg-primary text-bg-primary hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {applying ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {currentJobs.map(job => {
        const isApplied = applications.has(job.id);
        const applying = applyingTo === job.id;
        
        return (
          <div key={job.id} onClick={() => setSelectedJob(job)} className="group bg-card-bg border border-theme rounded-xl p-4 hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary text-base group-hover:text-amber-600 transition-colors truncate">{job.title}</h3>
              <p className="text-secondary text-sm font-medium">{job.company_name}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <span className="text-xs text-secondary flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{job.salary_package}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
              <button onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(job.id); }} className="p-2 rounded-lg transition-colors border text-amber-500 bg-amber-500/5 border-amber-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30">
                <BookmarkCheck className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if(!isApplied && !applying) handleApply(job.id); }}
                disabled={isApplied || applying}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto flex items-center justify-center gap-2 ${
                  isApplied ? 'bg-emerald-500/10 text-emerald-600 cursor-not-allowed border border-emerald-500/20' : 'bg-primary text-bg-primary hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {applying ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-card-bg border border-theme rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme">
          <thead className="bg-secondary/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Job Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Location & Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Salary</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-card-bg divide-y divide-theme">
            {currentJobs.map(job => {
              const isApplied = applications.has(job.id);
              const applying = applyingTo === job.id;
              
              return (
                <tr key={job.id} onClick={() => setSelectedJob(job)} className="hover:bg-secondary/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-primary group-hover:text-amber-600 transition-colors truncate max-w-[200px]">{job.title}</div>
                        <div className="text-sm text-secondary font-medium">{job.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-secondary" /> {job.location}</div>
                    <div className="text-xs text-secondary mt-1">{job.job_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.salary_package}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(job.id); }} className="p-1.5 rounded-md transition-colors text-amber-500 bg-amber-500/10 hover:bg-red-500/10 hover:text-red-500">
                        <BookmarkCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if(!isApplied && !applying) handleApply(job.id); }}
                        disabled={isApplied || applying}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors w-24 flex justify-center items-center ${
                          isApplied ? 'bg-emerald-500/10 text-emerald-600 cursor-not-allowed border border-emerald-500/20' : 'bg-primary text-bg-primary hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {applying ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Saved Bookmarks"
          subtitle="Access your saved jobs, resources, and roadmap guides"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-card-bg p-4 rounded-2xl border border-theme shadow-sm flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-amber-500" />
              Saved Jobs ({jobs.length})
            </h2>
            <div className="flex items-center p-1 bg-dashboard-bg border border-theme rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-card-bg shadow-sm text-primary' : 'text-secondary hover:text-primary'}`} title="Grid View">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-card-bg shadow-sm text-primary' : 'text-secondary hover:text-primary'}`} title="List View">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-card-bg shadow-sm text-primary' : 'text-secondary hover:text-primary'}`} title="Table View">
                <Table2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-600 rounded-full animate-spin mb-4" />
              <p className="text-secondary text-sm font-medium">Loading bookmarks...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-8 text-center">
              <p className="font-medium">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary">No Bookmarks Saved</h3>
              <p className="text-secondary max-w-md mx-auto text-sm">
                You haven't bookmarked any jobs yet. Click the bookmark icon on job listings to save them here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === 'grid' && renderGridView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'table' && renderTableView()}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-card-bg border border-theme p-4 rounded-xl mt-8">
                  <span className="text-sm text-secondary font-medium hidden sm:inline">
                    Showing <span className="text-primary font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-primary font-bold">{Math.min(currentPage * itemsPerPage, jobs.length)}</span> of <span className="text-primary font-bold">{jobs.length}</span> bookmarks
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-theme rounded-lg text-secondary hover:bg-secondary/10 disabled:opacity-50">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-theme rounded-lg text-secondary hover:bg-secondary/10 disabled:opacity-50">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {selectedJob && (
        <JobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          isApplied={applications.has(selectedJob.id)}
          applying={applyingTo === selectedJob.id}
          onBookmarkToggle={handleRemoveBookmark}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
