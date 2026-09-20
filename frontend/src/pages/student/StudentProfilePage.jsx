import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStudentProfile, updateStudentProfile } from '../../services/student';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  X,
  User,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  Globe,
  Code2,
  ArrowRight,
  AlertCircle,
  Award,
  Target,
  FileCheck,
  Building2,
  Check
} from 'lucide-react';

const DEGREE_OPTIONS = [
  'B.Tech (Bachelor of Technology)',
  'B.E. (Bachelor of Engineering)',
  'BCA (Bachelor of Computer Applications)',
  'B.Sc. IT (Information Technology)',
  'B.Sc. CS (Computer Science)',
  'M.Tech (Master of Technology)',
  'M.E. (Master of Engineering)',
  'MCA (Master of Computer Applications)',
  'M.Sc. IT (Information Technology)',
  'M.Sc. CS (Computer Science)',
  'Other / Equivalent'
];

const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Artificial Intelligence & Machine Learning (AI & ML)',
  'Computer Applications (BCA / MCA)',
  'Software Engineering',
  'Cyber Security & Digital Forensics',
  'Data Science & Analytics',
  'Electronics & Communication Engineering (ECE)',
  'Electrical Engineering (EE)',
  'Other Technical Branch'
];

const GRADUATION_YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

const INTERNSHIP_OPTIONS = [
  'Fresher (No Internship)',
  '1 - 3 Months',
  '3 - 6 Months',
  '6+ Months',
  '1+ Year Experience'
];

const POPULAR_SKILLS = [
  'Python', 'React.js', 'Node.js', 'Java', 'C++', 'JavaScript',
  'Data Structures & Algorithms', 'SQL / MySQL', 'MongoDB',
  'Git / GitHub', 'Tailwind CSS', 'Machine Learning', 'Docker', 'FastAPI'
];

const TARGET_ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI / ML Engineer',
  'Data Analyst / Data Engineer',
  'DevOps / Cloud Engineer',
  'Software Engineer (SDE)',
  'QA / Testing Engineer'
];

export default function StudentProfilePage() {
  const { user, studentProfile, isProfileComplete, updateProfileState, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Basic Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');

  // Academic Details (Standardized Dropdowns + Details)
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('');
  const [tenthPercentage, setTenthPercentage] = useState('');
  const [twelfthPercentage, setTwelfthPercentage] = useState('');
  const [activeBacklogs, setActiveBacklogs] = useState('0');

  // Experience & Preferences
  const [internshipExperience, setInternshipExperience] = useState('Fresher (No Internship)');
  const [preferredRoles, setPreferredRoles] = useState([]);

  // Skills
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Professional Links
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // UI States
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load Profile on mount
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        const res = await getStudentProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setFullName(p.full_name || user?.name || '');
          setPhone(p.phone || '');
          setCollege(p.college || '');
          
          // Match or set degree/branch
          setDegree(p.degree || DEGREE_OPTIONS[0]);
          setBranch(p.branch || BRANCH_OPTIONS[0]);
          setGraduationYear(String(p.graduation_year || 2026));
          setCgpa(p.cgpa !== null && p.cgpa !== undefined ? String(p.cgpa) : '');
          setTenthPercentage(p.tenth_percentage !== null && p.tenth_percentage !== undefined ? String(p.tenth_percentage) : '');
          setTwelfthPercentage(p.twelfth_percentage !== null && p.twelfth_percentage !== undefined ? String(p.twelfth_percentage) : '');
          setActiveBacklogs(String(p.active_backlogs !== undefined ? p.active_backlogs : 0));
          
          setInternshipExperience(p.internship_experience || 'Fresher (No Internship)');
          setPreferredRoles(p.preferred_roles || []);

          setSkills(p.skills || []);
          if (p.links) {
            setGithubUrl(p.links.github || '');
            setLinkedinUrl(p.links.linkedin || '');
            setPortfolioUrl(p.links.portfolio || '');
          }
          updateProfileState(p);
        } else {
          // Pre-fill defaults for new profile
          setFullName(user?.name || '');
          setDegree(DEGREE_OPTIONS[0]);
          setBranch(BRANCH_OPTIONS[0]);
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Skill Handlers
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (trimmed && !skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Target Role Toggle
  const toggleTargetRole = (role) => {
    if (preferredRoles.includes(role)) {
      setPreferredRoles(preferredRoles.filter((r) => r !== role));
    } else {
      setPreferredRoles([...preferredRoles, role]);
    }
  };

  // Dynamic Progress Calculation
  const isBasicValid = Boolean(fullName && fullName.trim().length >= 2);
  const isAcademicValid = Boolean(
    degree &&
    branch &&
    graduationYear &&
    cgpa !== '' && !isNaN(Number(cgpa)) && Number(cgpa) >= 0 && Number(cgpa) <= 10.0
  );
  const isSkillsValid = Boolean(skills.length > 0);
  const isLinksValid = Boolean(
    (githubUrl && githubUrl.trim().length > 5) ||
    (linkedinUrl && linkedinUrl.trim().length > 5)
  );

  const completionPct = Math.min(
    100,
    (isBasicValid ? 25 : 0) +
    (isAcademicValid ? 35 : 0) +
    (isSkillsValid ? 20 : 0) +
    (isLinksValid ? 20 : 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isBasicValid) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!isAcademicValid) {
      setErrorMessage('Please select your Degree, Branch, Graduation Year, and a valid CGPA (0.0 - 10.0).');
      return;
    }
    if (!isLinksValid) {
      setErrorMessage('Please provide at least one professional link (LinkedIn or GitHub URL).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: fullName,
        phone,
        college,
        degree,
        branch,
        graduation_year: Number(graduationYear),
        cgpa: Number(cgpa),
        tenth_percentage: tenthPercentage ? Number(tenthPercentage) : null,
        twelfth_percentage: twelfthPercentage ? Number(twelfthPercentage) : null,
        active_backlogs: Number(activeBacklogs || 0),
        internship_experience: internshipExperience,
        preferred_roles: preferredRoles,
        skills,
        links: {
          github: githubUrl,
          linkedin: linkedinUrl,
          portfolio: portfolioUrl
        }
      };

      const res = await updateStudentProfile(payload);
      if (res.success && res.profile) {
        updateProfileState(res.profile);
        setSuccessMessage('Profile saved successfully! Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed to save profile.');
      }
    } catch (err) {
      console.error('Error saving student profile:', err);
      const msg = err.response?.data?.detail || err.message || 'Error saving profile. Please check inputs.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const showSidebar = isProfileComplete;

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      {showSidebar && (
        <StudentSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {!showSidebar ? (
          /* Dedicated Onboarding Header */
          <header className="bg-card-bg border-b border-theme sticky top-0 z-20 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-extrabold text-primary tracking-tight block">
                    Placement<span className="text-blue-600">AI</span>
                  </span>
                  <span className="text-[10px] font-mono text-secondary uppercase tracking-widest block">
                    Student Profile Onboarding
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-primary">{user?.name || 'Student'}</p>
                  <p className="text-[10px] text-secondary font-mono">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-theme bg-secondary text-xs font-mono font-bold text-secondary hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
        ) : (
          <StudentHeader
            title="My Student Profile"
            subtitle="Manage your standardized technical academic profile, skills, and placement preferences"
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          
          {/* Card Header */}
          <div className="bg-card-bg border border-theme rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Technical Student Profile
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                Placement Profile Setup
              </h2>
              <p className="text-xs md:text-sm text-secondary mt-1">
                Standardized academic and technical profile to ensure eligibility for campus placement drives and AI interview assessments.
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2 bg-secondary/60 p-4 rounded-xl border border-theme">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-primary uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  Profile Completion
                </span>
                <span className="text-blue-600 font-extrabold">{completionPct}%</span>
              </div>
              <div className="w-full h-3 bg-card-bg rounded-full overflow-hidden border border-theme">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 transition-all duration-500 rounded-full"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Resume Auto-Sync Notice Banner */}
          {(studentProfile?.resume_synced || studentProfile?.resume_id) && (
            <div className="p-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-teal-500/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-primary font-mono uppercase tracking-wider">AI Resume Auto-Synced</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold">System Updated</span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">
                    Your technical skills and target tech roles were automatically extracted and updated by the PlacementAI Resume Analyzer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/student/resume')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 shadow-sm"
              >
                <span>View ATS Score & Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form & Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              
              {/* Section 1: Basic Information */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>1. Personal & Basic Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aaryan Sharma"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-secondary" />
                      College / Institute Name
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Institute of Technology & Engineering"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Standardized Technical Academic Details */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>2. Technical Academic Details (Standardized)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Degree Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Degree / Program *
                    </label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                      required
                    >
                      {DEGREE_OPTIONS.map((deg) => (
                        <option key={deg} value={deg}>
                          {deg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Branch / Department *
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                      required
                    >
                      {BRANCH_OPTIONS.map((br) => (
                        <option key={br} value={br}>
                          {br}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Graduation Year Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Graduation Year *
                    </label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                      required
                    >
                      {GRADUATION_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cumulative CGPA */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Cumulative CGPA (0.0 - 10.0) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.0"
                      max="10.0"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="e.g. 8.50"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>

                  {/* 10th Score */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      10th Percentage / CGPA (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={tenthPercentage}
                      onChange={(e) => setTenthPercentage(e.target.value)}
                      placeholder="e.g. 88.5"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* 12th Score */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      12th / Diploma Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={twelfthPercentage}
                      onChange={(e) => setTwelfthPercentage(e.target.value)}
                      placeholder="e.g. 85.0"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* Active Backlogs */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Active Backlogs Count
                    </label>
                    <select
                      value={activeBacklogs}
                      onChange={(e) => setActiveBacklogs(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                    >
                      <option value="0">0 (No Active Backlogs)</option>
                      <option value="1">1 Backlog</option>
                      <option value="2">2 Backlogs</option>
                      <option value="3">3+ Backlogs</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Skills & Quick Suggestions */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>3. Technical Skills & Expertise *</span>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type custom tech skill (e.g. Docker, GraphQL) and press Add"
                      className="flex-1 px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-mono font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Selected Skills Chips */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-secondary">Your Selected Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.length === 0 ? (
                        <p className="text-xs text-secondary italic font-mono">No skills added yet. Add at least 1 technical skill.</p>
                      ) : (
                        skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg text-xs font-mono font-semibold"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Add Suggestions */}
                  <div className="pt-2 border-t border-theme space-y-2">
                    <p className="text-[10px] font-mono font-bold uppercase text-secondary tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Popular Tech Skills (Click to Quick-Add):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SKILLS.map((popSkill) => {
                        const isAdded = skills.some((s) => s.toLowerCase() === popSkill.toLowerCase());
                        return (
                          <button
                            type="button"
                            key={popSkill}
                            onClick={() => !isAdded && handleAddSkill(popSkill)}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1 ${
                              isAdded
                                ? 'bg-secondary text-secondary opacity-50 cursor-not-allowed border border-theme'
                                : 'bg-card-bg border border-theme text-primary hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            {isAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3 text-secondary" />}
                            {popSkill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Work Experience & Preferred Roles */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>4. Work Experience & Preferred Tech Roles</span>
                </div>

                <div className="space-y-4">
                  {/* Internship Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Internship Experience Level
                    </label>
                    <select
                      value={internshipExperience}
                      onChange={(e) => setInternshipExperience(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                    >
                      {INTERNSHIP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Roles Choice Chips */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Target Placement Roles (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TARGET_ROLE_OPTIONS.map((role) => {
                        const isSelected = preferredRoles.includes(role);
                        return (
                          <button
                            type="button"
                            key={role}
                            onClick={() => toggleTargetRole(role)}
                            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium text-left border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-secondary border-theme text-primary hover:border-blue-500/50'
                            }`}
                          >
                            <span className="truncate">{role}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 ml-1 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Professional & Portfolio Links */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <LinkIcon className="w-4 h-4 text-purple-600" />
                  <span>5. Professional Links * (At least one required)</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-primary" />
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Personal Portfolio / Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://myportfolio.com"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving Technical Profile...
                  </>
                ) : (
                  <>
                    Save Technical Profile & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Right Column: Dynamic Checklist */}
            <div className="space-y-6">
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm sticky top-24 space-y-5">
                <h3 className="text-sm font-bold text-primary tracking-tight uppercase font-mono border-b border-theme pb-3">
                  Setup Progress
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    {isBasicValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isBasicValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Personal Details
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isAcademicValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isAcademicValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Standardized Technical Academics
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSkillsValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isSkillsValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Tech Skills ({skills.length} added)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLinksValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isLinksValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Professional & Social Links
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-600 font-mono leading-relaxed">
                  💡 Standardized degree and branch inputs ensure accurate matching when recruiters filter candidates by technical qualifications.
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
