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
  AlertCircle
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, studentProfile, isProfileComplete, updateProfileState, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

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
          setDegree(p.degree || '');
          setBranch(p.branch || '');
          setGraduationYear(p.graduation_year || new Date().getFullYear());
          setCgpa(p.cgpa !== null && p.cgpa !== undefined ? String(p.cgpa) : '');
          setSkills(p.skills || []);
          if (p.links) {
            setGithubUrl(p.links.github || '');
            setLinkedinUrl(p.links.linkedin || '');
          }
          updateProfileState(p);
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Skill Add / Remove
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Dynamic Progress Calculation
  const isBasicValid = Boolean(fullName && fullName.trim().length >= 2);
  const isAcademicValid = Boolean(
    branch && branch.trim().length >= 2 &&
    graduationYear && Number(graduationYear) >= 2000 &&
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
    (isAcademicValid ? 25 : 0) +
    (isSkillsValid ? 25 : 0) +
    (isLinksValid ? 25 : 0)
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
      setErrorMessage('Please enter a valid Branch, Graduation Year (>= 2000), and CGPA (0.0 - 10.0).');
      return;
    }
    if (!isSkillsValid) {
      setErrorMessage('Please add at least one skill.');
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
        skills,
        links: {
          github: githubUrl,
          linkedin: linkedinUrl
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

  // Decide layout: If student profile was complete before, show sidebar. If incomplete onboarding mode, hide sidebar for full focus.
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
          /* Dedicated Onboarding Header (No sidebar) */
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
                    Onboarding Portal
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
            subtitle="View and update your academic background, skills, and links"
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
                Profile Setup
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                Complete Your Profile
              </h2>
              <p className="text-xs md:text-sm text-secondary mt-1">
                Complete your profile to unlock your PlacementAI dashboard and placement preparation features.
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2 bg-secondary/60 p-4 rounded-xl border border-theme">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-primary uppercase tracking-wider">Profile Completion</span>
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

          {/* Form and Checklist Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column (2/3 width) */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              
              {/* Section 1: Basic Information */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Basic Information</span>
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
                      Phone Number (Optional)
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
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      College / University (Optional)
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Institute of Technology"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Information */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Academic Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Branch / Department *
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Degree (Optional)
                    </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.Tech / B.E."
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2025"
                      min="2000"
                      max="2100"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                      Cumulative GPA (CGPA 0.0 - 10.0) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.0"
                      max="10.0"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="8.50"
                      className="w-full px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Skills */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>Technical & Core Skills *</span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                      placeholder="Type skill (e.g. Python, React, SQL) and press Add"
                      className="flex-1 px-3.5 py-2.5 bg-secondary border border-theme text-primary rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-mono font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.length === 0 ? (
                      <p className="text-xs text-secondary italic font-mono">No skills added yet. Add at least 1 skill.</p>
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
              </div>

              {/* Section 4: Professional Links */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-theme text-primary font-bold text-sm">
                  <LinkIcon className="w-4 h-4 text-purple-600" />
                  <span>Professional Links * (At least one required)</span>
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
                      placeholder="https://linkedin.in/in/username"
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
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Complete Profile & Unlock Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Right Column: Dynamic Checklist */}
            <div className="space-y-6">
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm sticky top-24 space-y-5">
                <h3 className="text-sm font-bold text-primary tracking-tight uppercase font-mono border-b border-theme pb-3">
                  Setup Checklist
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    {isBasicValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isBasicValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Basic Information
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isAcademicValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isAcademicValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Academic Details
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSkillsValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isSkillsValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Skills ({skills.length} added)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLinksValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                    <span className={isLinksValid ? 'text-primary font-semibold' : 'text-secondary'}>
                      Professional Links
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-600 font-mono leading-relaxed">
                  💡 Note: All required fields must be satisfied before access to the placement dashboard is unlocked.
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
