import React, { useState, useEffect, useRef } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { uploadResume, getActiveResume, deleteResume } from '../../services/resume';
import { useAuth } from '../../hooks/useAuth';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Award,
  Zap,
  Target,
  ArrowUpRight,
  TrendingUp,
  ListChecks,
  AlertTriangle
} from 'lucide-react';

export default function StudentResumePage() {
  const { user, fetchStudentProfile } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // States
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch current active resume on mount
  useEffect(() => {
    loadActiveResume();
  }, []);

  const loadActiveResume = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await getActiveResume();
      if (res.success && res.has_resume) {
        setResumeData(res.resume);
      } else {
        setResumeData(null);
      }
    } catch (err) {
      console.error('Error fetching active resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processUpload(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processUpload(droppedFile);
    }
  };

  const processUpload = async (file) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF resumes are supported. Please upload a .pdf file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 5MB.');
      return;
    }

    setUploading(true);
    setUploadProgressText('Extracting text & verifying student ownership...');

    try {
      setTimeout(() => {
        setUploadProgressText('Running ATS scoring algorithm & tech skills extraction...');
      }, 1200);

      const res = await uploadResume(file);
      if (res.success && res.analysis) {
        setResumeData(res.analysis);
        setSuccessMessage('Resume analyzed successfully! Skills & target roles auto-synced to your profile.');
        // Refresh Auth Context profile state to reflect synced skills/roles
        if (fetchStudentProfile) {
          fetchStudentProfile(user);
        }
      } else {
        throw new Error(res.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      const msg = err.response?.data?.detail || err.message || 'Error processing resume upload.';
      setErrorMessage(msg);
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteResume = async () => {
    if (!resumeData || !resumeData.id) return;
    if (!window.confirm('Are you sure you want to delete your active analyzed resume?')) return;

    setLoading(true);
    try {
      const res = await deleteResume(resumeData.id);
      if (res.success) {
        setResumeData(null);
        setSuccessMessage('Resume deleted successfully.');
        if (fetchStudentProfile) {
          fetchStudentProfile(user);
        }
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      setErrorMessage('Failed to delete resume.');
    } finally {
      setLoading(false);
    }
  };

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="AI Resume Analyzer & ATS Optimizer"
          subtitle="Upload your PDF resume for instant ATS evaluation, candidate verification, and skill extraction"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-card-bg border border-theme rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Placement Intelligence
                </div>
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                  Resume Analyzer & ATS Score
                </h2>
                <p className="text-xs text-secondary mt-1 max-w-2xl">
                  Analyze your resume against ATS algorithms. Detected skills and recommended tech roles are automatically verified and synced to your student profile!
                </p>
              </div>

              {resumeData && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 flex-shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-analyze / Update Resume
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div>
                <span className="font-bold block mb-0.5">Verification / Processing Error</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Zone / Loader */}
          {uploading && (
            <div className="bg-card-bg border border-theme rounded-2xl p-10 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary font-mono">{uploadProgressText}</p>
                <p className="text-xs text-secondary font-mono">Please wait while our AI engine evaluates your resume document...</p>
              </div>
            </div>
          )}

          {!resumeData && !uploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-card-bg border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${
                dragOver ? 'border-blue-600 bg-blue-500/5 scale-[1.01]' : 'border-theme hover:border-blue-500/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2 mb-6">
                <h3 className="text-lg font-bold text-primary">Upload Your PDF Resume</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Drag and drop your PDF resume here, or click below to browse files from your computer.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-[10px] font-mono text-secondary border border-theme">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Student Identity Verification Enabled</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3.5 btn-brand-primary text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Select PDF Resume (Max 5MB)
              </button>
            </div>
          )}

          {/* Hidden File Input for re-analyzing when resumeData exists */}
          {resumeData && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          )}

          {/* Active Resume AI Analysis Results */}
          {resumeData && !uploading && (
            <div className="space-y-8">
              
              {/* Top Summary Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score Dial Card */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold uppercase text-secondary tracking-wider">Overall ATS Score</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-5xl font-extrabold text-primary tracking-tight font-mono">
                      {resumeData.ats_score}
                    </span>
                    <span className="text-sm text-secondary font-mono font-bold">/ 100</span>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold inline-flex items-center gap-2 ${getScoreColor(resumeData.ats_score)}`}>
                    <Award className="w-4 h-4" />
                    <span>
                      {resumeData.ats_score >= 80
                        ? 'Excellent ATS Compatibility'
                        : resumeData.ats_score >= 65
                        ? 'Good Candidate Match'
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                {/* Identity Verification Card */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold uppercase text-secondary tracking-wider">Identity Check</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                      Verified Owner
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </p>
                    <p className="text-xs text-secondary font-mono truncate">{user?.name} ({user?.email})</p>
                  </div>

                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-500 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Candidate details verified & match your account.</span>
                  </div>
                </div>

                {/* File Details & Sync Status */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold uppercase text-secondary tracking-wider">Active Document</span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-primary truncate">{resumeData.file_name}</p>
                    <p className="text-xs text-secondary font-mono">{resumeData.word_count || 0} words extracted</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-theme">
                    <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Profile Auto-Synced
                    </span>
                    <button
                      onClick={handleDeleteResume}
                      className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-secondary"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Score Metrics Breakdown */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold text-primary uppercase font-mono border-b border-theme pb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    ATS Scoring Breakdown
                  </h3>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-primary font-bold">
                        <span>Section Structure & Headers</span>
                        <span>{resumeData.score_breakdown?.section_structure || 0} / 20</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-theme">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${((resumeData.score_breakdown?.section_structure || 0) / 20) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-primary font-bold">
                        <span>Technical Skill Density</span>
                        <span>{resumeData.score_breakdown?.skill_density || 0} / 35</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-theme">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${((resumeData.score_breakdown?.skill_density || 0) / 35) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-primary font-bold">
                        <span>Engineering Action Verbs</span>
                        <span>{resumeData.score_breakdown?.action_verbs || 0} / 25</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-theme">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${((resumeData.score_breakdown?.action_verbs || 0) / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-primary font-bold">
                        <span>Measurable Impact & Metrics</span>
                        <span>{resumeData.score_breakdown?.impact_metrics || 0} / 20</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-theme">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${((resumeData.score_breakdown?.impact_metrics || 0) / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Target Tech Roles */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase font-mono border-b border-theme pb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Recommended Tech Roles (Auto-Synced)
                  </h3>

                  <div className="space-y-3">
                    <p className="text-xs text-secondary">
                      Based on keyword matching in your resume, you are best suited for:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.recommended_roles?.map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Detected Skills Section */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase font-mono border-b border-theme pb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  Detected Technical Skills ({resumeData.detected_skills?.length || 0} Skills)
                </h3>

                <div className="flex flex-wrap gap-2">
                  {resumeData.detected_skills?.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg text-xs font-mono font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Feedback & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Strengths */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase font-mono border-b border-theme pb-3 flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Resume Strengths
                  </h3>

                  <ul className="space-y-2.5 text-xs text-secondary font-mono">
                    {resumeData.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements & Missing Keywords */}
                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase font-mono border-b border-theme pb-3 flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Recommended Improvements
                  </h3>

                  <ul className="space-y-2.5 text-xs text-secondary font-mono">
                    {resumeData.improvements?.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>

                  {resumeData.missing_keywords?.length > 0 && (
                    <div className="pt-3 border-t border-theme space-y-2">
                      <p className="text-[10px] font-mono uppercase text-secondary font-bold">Suggested Missing Keywords:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.missing_keywords.map((kw) => (
                          <span key={kw} className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded text-[11px] font-mono">
                            +{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
