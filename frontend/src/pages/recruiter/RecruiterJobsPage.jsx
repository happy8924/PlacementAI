import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import {
  Briefcase,
  Plus,
  Send,
  Building2,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getRecruiterJobs, createRecruiterJob, updateJobStatus, triggerJobBroadcast, previewJobEligibility } from '../../services/recruiter';

export default function RecruiterJobsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(null);
  const [notification, setNotification] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityData, setEligibilityData] = useState({ total_registered_students: 0, eligible_count: 0, eligible_students: [] });
  
  // Search and pagination for eligible candidate preview
  const [eligibilitySearch, setEligibilitySearch] = useState('');
  const [eligibilityPage, setEligibilityPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Form Validation State
  const [formErrors, setFormErrors] = useState({});

  // Form State matching Email Automation workflow fields
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    department: '',
    recruiter_name: '',
    official_email: '',
    phone: '',
    designation: '',
    company_name: '',
    company_website: '',
    company_careers_url: '',
    company_linkedin: '',
    company_description: '',
    employment_type: 'Full-time',
    number_of_openings: 1,
    location: '',
    work_mode: 'On-site',
    salary_package: '',
    experience_required: '0-2 Years',
    min_cgpa: '6.0',
    eligible_branches: 'Computer Science, Information Technology, MCA, ECE',
    requirements: 'React, Node.js, Python, MongoDB',
    preferred_skills: 'Docker, FastAPI, LLM',
    description: '',
    responsibilities: '',
    selection_process: 'Aptitude Test -> Technical Interview -> HR Round',
    deadline: '',
    joining_date: '',
    apply_link: '',
    hr_contact_email: '',
    status: 'open'
  });

  const fetchJobs = async () => {
    try {
      const res = await getRecruiterJobs();
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusToggle = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      setNotification({ type: 'success', text: `Job status updated to ${newStatus}.` });
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to update job status.' });
    }
  };

  const handleBroadcastEmail = async (jobId) => {
    setBroadcastLoading(jobId);
    try {
      const res = await triggerJobBroadcast(jobId);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Email broadcast completed! Sent ${res.stats.emails_dispatched} emails to eligible candidates.`
        });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.detail || 'Failed to trigger email broadcast.' });
    } finally {
      setBroadcastLoading(null);
    }
  };

  // Validate all required fields
  const validateRequiredFields = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Job Title is required';
    }
    if (!formData.location || !formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!formData.salary_package || !formData.salary_package.trim()) {
      errors.salary_package = 'Salary / Stipend is required';
    }
    
    const cgpaNum = parseFloat(formData.min_cgpa);
    if (!formData.min_cgpa || isNaN(cgpaNum) || cgpaNum <= 0 || cgpaNum > 10) {
      errors.min_cgpa = 'Enter a valid Minimum CGPA between 0.1 and 10.0';
    }

    const branches = formData.eligible_branches ? formData.eligible_branches.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (branches.length === 0) {
      errors.eligible_branches = 'At least one eligible branch is required';
    }

    const skills = formData.requirements ? formData.requirements.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (skills.length === 0) {
      errors.requirements = 'At least one required tech skill is required';
    }

    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Job Description is required';
    }

    setFormErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleCheckEligibility = async () => {
    const { isValid, errors } = validateRequiredFields();
    if (!isValid) {
      const missingLabels = Object.values(errors).join(' • ');
      setNotification({
        type: 'error',
        text: `Please fill all required fields before checking eligibility: ${missingLabels}`
      });
      return;
    }

    setCheckingEligibility(true);
    try {
      const payload = {
        title: formData.title.trim(),
        role: (formData.role && formData.role.trim()) || formData.title.trim(),
        min_cgpa: parseFloat(formData.min_cgpa),
        eligible_branches: formData.eligible_branches.split(',').map(s => s.trim()).filter(Boolean),
        requirements: formData.requirements.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills ? formData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const res = await previewJobEligibility(payload);
      if (res.success) {
        setEligibilityData(res);
        setEligibilitySearch('');
        setEligibilityPage(1);
        setShowEligibilityModal(true);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to preview eligible candidates.'
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateRequiredFields();
    if (!isValid) {
      setNotification({
        type: 'error',
        text: 'Please correct all highlighted errors before submitting.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        number_of_openings: parseInt(formData.number_of_openings) || 1,
        min_cgpa: parseFloat(formData.min_cgpa) || 0.0,
        eligible_branches: formData.eligible_branches.split(',').map(s => s.trim()).filter(Boolean),
        requirements: formData.requirements.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const res = await createRecruiterJob(payload);
      if (res.success) {
        setShowCreateModal(false);
        setFormErrors({});
        setNotification({
          type: 'success',
          text: `Job drive '${formData.title}' submitted! It is now pending TPO review and approval.`
        });
        fetchJobs();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  // Download PDF Report of Eligible Candidates
  const handleDownloadPDF = () => {
    const list = eligibilityData.eligible_students || [];
    if (list.length === 0) {
      alert('No eligible students available to export.');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      // Top Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PlacementAI — Eligible Students Verification Report', 40, 36);

      // Metadata info
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      let y = 82;
      const col1 = 40;
      const col2 = 430;

      doc.setFont('helvetica', 'bold');
      doc.text('Job Drive:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formData.title || 'N/A'} (${formData.role || formData.title || 'N/A'})`, col1 + 75, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Generated Date:', col2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleString(), col2 + 80, y);

      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('Min CGPA:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formData.min_cgpa}`, col1 + 75, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Eligible Pool:', col2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${eligibilityData.eligible_count} out of ${eligibilityData.total_registered_students} students (${Math.round((eligibilityData.eligible_count / (eligibilityData.total_registered_students || 1)) * 100)}%)`, col2 + 80, y);

      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('Eligible Branches:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formData.eligible_branches || 'All'}`, col1 + 85, y);

      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('Required Skills:', col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formData.requirements || 'N/A'}`, col1 + 80, y);

      // AutoTable
      const tableHeaders = [
        ['#', 'Roll / Student ID', 'Candidate Name', 'Branch', 'CGPA', 'Matched Skills', 'Match %']
      ];

      const tableRows = list.map((st, idx) => [
        idx + 1,
        st.student_id || 'N/A',
        st.name || 'N/A',
        st.branch || 'N/A',
        st.cgpa ? Number(st.cgpa).toFixed(2) : 'N/A',
        (st.matched_skills || []).join(', ') || 'None',
        `${Math.round(st.match_score || 100)}%`
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: y + 20,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5
        },
        bodyStyles: {
          fontSize: 8,
          textColor: 30
        },
        columnStyles: {
          0: { cellWidth: 26, halign: 'center' },
          1: { cellWidth: 85 },
          2: { cellWidth: 125 },
          3: { cellWidth: 120 },
          4: { cellWidth: 45, halign: 'center' },
          5: { cellWidth: 290 },
          6: { cellWidth: 50, halign: 'center' }
        },
        margin: { left: 40, right: 40 },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(140);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount} • PlacementAI Candidate Verification`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 18,
            { align: 'center' }
          );
        }
      });

      const cleanTitle = (formData.title || 'PlacementDrive').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`Eligible_Students_${cleanTitle}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Error generating PDF: ' + err.message);
    }
  };

  // Filtered students for modal display
  const filteredEligibleStudents = (eligibilityData.eligible_students || []).filter(st => {
    if (!eligibilitySearch.trim()) return true;
    const query = eligibilitySearch.toLowerCase();
    const nameMatch = (st.name || '').toLowerCase().includes(query);
    const idMatch = (st.student_id || '').toLowerCase().includes(query);
    const branchMatch = (st.branch || '').toLowerCase().includes(query);
    const emailMatch = (st.email || '').toLowerCase().includes(query);
    const skillsMatch = (st.matched_skills || []).some(s => s.toLowerCase().includes(query));
    return nameMatch || idMatch || branchMatch || emailMatch || skillsMatch;
  });

  const totalEligibilityPages = Math.ceil(filteredEligibleStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredEligibleStudents.slice(
    (eligibilityPage - 1) * ITEMS_PER_PAGE,
    eligibilityPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <RecruiterSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <RecruiterHeader
          title="Job Management & Drives"
          subtitle="Post job vacancies, configure eligibility criteria, and trigger automated candidate email broadcasts"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Top Bar with Post Job Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card-bg p-6 rounded-2xl border border-theme shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-primary tracking-tight">Active Placement Drives</h2>
              <p className="text-xs text-secondary font-mono mt-0.5">Manage job postings and match eligible candidates</p>
            </div>
            <button
              onClick={() => {
                setFormErrors({});
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post New Job Vacancy
            </button>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{notification.text}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-secondary hover:text-primary ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Job List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading job vacancies...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-center text-sm font-mono">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary">No Jobs Posted Yet</h3>
              <p className="text-secondary max-w-md mx-auto text-xs font-mono">
                Click 'Post New Job Vacancy' above to create a hiring drive and notify eligible candidates automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-secondary text-secondary'}`}>
                          {job.status}
                        </span>
                        <h3 className="text-lg font-extrabold text-primary mt-1">{job.title || job.job_title}</h3>
                        <p className="text-xs text-secondary font-medium flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          {job.company_name} • {job.job_type || job.employment_type}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-extrabold text-indigo-600 font-mono">{job.applicant_count || 0}</span>
                        <p className="text-[10px] text-secondary font-mono">Applicants</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-xl border border-theme text-xs font-mono">
                      <div className="flex items-center gap-2 text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{job.location} ({job.work_mode || 'On-site'})</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate">{job.salary_package || job.salary_stipend}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                        <span>Min CGPA: {job.min_cgpa}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requirements || job.required_skills || []).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-theme flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleStatusToggle(job.id, job.status)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${job.status === 'open' ? 'border-amber-500/30 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                    >
                      {job.status === 'open' ? 'Close Drive' : 'Re-open Drive'}
                    </button>

                    <button
                      onClick={() => handleBroadcastEmail(job.id)}
                      disabled={broadcastLoading === job.id}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                    >
                      {broadcastLoading === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Broadcast Email to Eligible
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Eligible Students Preview Modal (Solid Opaque Background, Search & Pagination, PDF Export) */}
      {showEligibilityModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#162032]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Eligible Students Preview
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-semibold border border-blue-500/20">
                      {eligibilityData.eligible_count} Matching Candidates
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Criteria: Min CGPA {formData.min_cgpa} • {formData.eligible_branches ? `${formData.eligible_branches.split(',').length} Branches` : 'All Branches'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={!eligibilityData.eligible_students || eligibilityData.eligible_students.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm"
                  title="Download full candidate list as PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowEligibilityModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-slate-50/70 dark:bg-[#131d2e] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by candidate name, ID, branch..."
                  value={eligibilitySearch}
                  onChange={(e) => {
                    setEligibilitySearch(e.target.value);
                    setEligibilityPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredEligibleStudents.length > 0 ? (eligibilityPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong>–<strong className="text-slate-900 dark:text-white">{Math.min(eligibilityPage * ITEMS_PER_PAGE, filteredEligibleStudents.length)}</strong> of <strong className="text-slate-900 dark:text-white">{filteredEligibleStudents.length}</strong>
                </span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[11px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                  70% Skills Match Required
                </span>
              </div>
            </div>

            {/* Candidate List (Scrollable, Opaque Solid Cards) */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1 bg-white dark:bg-[#0f172a]">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#162032] hover:bg-slate-100 dark:hover:bg-[#1c2940] transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          ID: {st.student_id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          CGPA {st.cgpa ? Number(st.cgpa).toFixed(2) : 'N/A'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <span className="truncate font-medium">{st.branch}</span>
                        {st.email && (
                          <>
                            <span>•</span>
                            <span className="truncate text-slate-400 dark:text-slate-500">{st.email}</span>
                          </>
                        )}
                      </div>
                      {st.matched_skills && st.matched_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {st.matched_skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium border border-blue-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round(st.match_score || 100)}%
                      </div>
                      <div className="text-[10px] text-slate-400">Match</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {eligibilitySearch ? 'No candidates matching search query' : 'No eligible candidates match this criteria'}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    {eligibilitySearch ? 'Try a different search keyword or clear the search input.' : 'Try adjusting the minimum CGPA, including more branches, or relaxing required skills.'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination and Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#162032]">
              
              {/* Pagination Controls */}
              {totalEligibilityPages > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEligibilityPage(p => Math.max(1, p - 1))}
                    disabled={eligibilityPage === 1}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </button>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    Page {eligibilityPage} of {totalEligibilityPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEligibilityPage(p => Math.min(totalEligibilityPages, p + 1))}
                    disabled={eligibilityPage === totalEligibilityPages}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </button>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={!eligibilityData.eligible_students || eligibilityData.eligible_students.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowEligibilityModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Create Job Modal (Solid Opaque, Real-time Validation) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Post New Job & Campus Drive</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Fill in details to initiate eligible student matching</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Job Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">1. Job & Role Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                      placeholder="e.g. Full Stack Developer"
                      value={formData.title}
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                      }}
                    />
                    {formErrors.title && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Target Role / Designation</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. SDE-1"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Employment Type</label>
                    <select
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                      value={formData.employment_type}
                      onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Work Mode</label>
                    <select
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                      value={formData.work_mode}
                      onChange={e => setFormData({ ...formData, work_mode: e.target.value })}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Package & Eligibility */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">2. Compensation & Eligibility Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.location ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                      placeholder="e.g. Bangalore / Remote"
                      value={formData.location}
                      onChange={e => {
                        setFormData({ ...formData, location: e.target.value });
                        if (formErrors.location) setFormErrors({ ...formErrors, location: null });
                      }}
                    />
                    {formErrors.location && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.location}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Salary / Stipend <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.salary_package ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                      placeholder="e.g. 12 - 16 LPA"
                      value={formData.salary_package}
                      onChange={e => {
                        setFormData({ ...formData, salary_package: e.target.value });
                        if (formErrors.salary_package) setFormErrors({ ...formErrors, salary_package: null });
                      }}
                    />
                    {formErrors.salary_package && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.salary_package}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Minimum CGPA <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.min_cgpa ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                      value={formData.min_cgpa}
                      onChange={e => {
                        setFormData({ ...formData, min_cgpa: e.target.value });
                        if (formErrors.min_cgpa) setFormErrors({ ...formErrors, min_cgpa: null });
                      }}
                    />
                    {formErrors.min_cgpa && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.min_cgpa}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Eligible Branches (Comma separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.eligible_branches ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                    placeholder="Computer Science, IT, MCA, ECE"
                    value={formData.eligible_branches}
                    onChange={e => {
                      setFormData({ ...formData, eligible_branches: e.target.value });
                      if (formErrors.eligible_branches) setFormErrors({ ...formErrors, eligible_branches: null });
                    }}
                  />
                  {formErrors.eligible_branches && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.eligible_branches}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Required Tech Skills (Comma separated for 70% match) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.requirements ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                    placeholder="React, Node.js, Python, MongoDB"
                    value={formData.requirements}
                    onChange={e => {
                      setFormData({ ...formData, requirements: e.target.value });
                      if (formErrors.requirements) setFormErrors({ ...formErrors, requirements: null });
                    }}
                  />
                  {formErrors.requirements && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.requirements}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">3. Overview & Application Settings</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full px-3.5 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs ${formErrors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'}`}
                    placeholder="Describe company expectations, role duties..."
                    value={formData.description}
                    onChange={e => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description) setFormErrors({ ...formErrors, description: null });
                    }}
                  />
                  {formErrors.description && <p className="text-[10px] text-red-500 mt-1 font-mono">{formErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Apply Link (Optional)</label>
                    <input
                      type="url"
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      placeholder="https://company.careers/apply"
                      value={formData.apply_link}
                      onChange={e => setFormData({ ...formData, apply_link: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCheckEligibility}
                  disabled={checkingEligibility}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all shadow-sm"
                >
                  {checkingEligibility ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  Check Eligible Students
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit for TPO Approval
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}