import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { getMyRoadmap, updateMilestoneStatus } from '../../services/roadmap';
import { Link } from 'react-router-dom';

export default function StudentRoadmapPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEligible, setIsEligible] = useState(true);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [studentCriteria, setStudentCriteria] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [updatingNodeId, setUpdatingNodeId] = useState(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyRoadmap();
      
      setIsEligible(data.is_eligible);
      setEligibilityMessage(data.message || '');
      setStudentCriteria(data.student_criteria || null);

      if (data.is_eligible && data.roadmap) {
        setRoadmapData(data.roadmap);
      } else {
        setRoadmapData(null);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setError(err.response?.data?.detail || 'Failed to load career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      setUpdatingNodeId(milestoneId);
      const res = await updateMilestoneStatus(milestoneId, newStatus);
      if (res.success) {
        setRoadmapData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: res.milestones,
            stats: res.stats
          };
        });
      }
    } catch (err) {
      console.error('Failed to update milestone:', err);
      alert('Failed to update milestone progress.');
    } finally {
      setUpdatingNodeId(null);
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
          title="AI Skill Gap & Career Roadmap Engine"
          subtitle="Personalized step-by-step career path generated specifically for your dream role target."
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto space-y-8">
          
          {/* Top Title Banner & Plan Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-bg border border-theme p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-primary tracking-tight flex items-center gap-2">
                  AI Skill Gap & Career Roadmap Engine
                </h1>
                <p className="text-xs text-secondary mt-0.5">
                  Personalized step-by-step career path generated specifically for your dream role target.
                </p>
              </div>
            </div>

            {roadmapData?.stats && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold self-start md:self-auto shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{roadmapData.stats.total_weeks} Weeks Guided Plan ({Math.ceil(roadmapData.stats.total_weeks / 4)} Months)</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-secondary">
                Analyzing recruiter eligibility and generating AI career roadmap...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchRoadmap}
                className="inline-flex items-center gap-2 px-4 py-2 bg-theme border border-theme rounded-xl text-xs font-semibold text-primary hover:bg-theme/80 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          ) : !isEligible ? (
            /* ─────────────────────────────────────────────────────────────
               INELIGIBLE ALERT BOX (When no company matches student eligibility)
               ───────────────────────────────────────────────────────────── */
            <div className="bg-card-bg border border-amber-500/30 rounded-2xl p-8 space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-2xs font-mono font-bold uppercase tracking-wider">
                    Company Eligibility Restriction
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-primary">
                    Roadmap Unavailable Currently
                  </h2>
                  <p className="text-sm text-secondary leading-relaxed">
                    {eligibilityMessage || "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he."}
                  </p>
                </div>
              </div>

              {studentCriteria && (
                <div className="bg-secondary/40 border border-theme rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Your Current Profile Parameters:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-card-bg rounded-lg border border-theme">
                      <span className="text-2xs text-secondary block uppercase">Branch</span>
                      <span className="font-semibold text-primary">{studentCriteria.branch}</span>
                    </div>
                    <div className="p-2.5 bg-card-bg rounded-lg border border-theme">
                      <span className="text-2xs text-secondary block uppercase">CGPA</span>
                      <span className="font-semibold text-primary">{studentCriteria.cgpa || 'Not set'}</span>
                    </div>
                    <div className="p-2.5 bg-card-bg rounded-lg border border-theme">
                      <span className="text-2xs text-secondary block uppercase">Degree</span>
                      <span className="font-semibold text-primary">{studentCriteria.degree}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={fetchRoadmap}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-check Company Eligibility
                </button>
                <Link
                  to="/student/profile"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-theme border border-theme hover:bg-theme/80 text-primary rounded-xl text-xs font-semibold transition-all"
                >
                  Update Profile Details
                </Link>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               TARGET ROADMAP & MILESTONE TIMELINE (When eligible)
               ───────────────────────────────────────────────────────────── */
            <div className="space-y-8">
              
              {/* Target Roadmap Main Card */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-primary tracking-tight">
                      Target Roadmap: <span className="text-indigo-600 dark:text-indigo-400">{roadmapData.target_role}</span>
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-2xs font-mono font-extrabold uppercase tracking-widest self-start md:self-auto">
                    <Sparkles className="w-3 h-3" /> AI INTELLIGENCE POWERED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Left Specs */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-2xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        CURRENT LEVEL
                      </span>
                      <p className="text-sm font-extrabold text-primary mt-0.5">
                        {roadmapData.current_level}
                      </p>
                    </div>

                    <div>
                      <span className="text-2xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        TARGET GOAL
                      </span>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {roadmapData.target_goal}
                      </p>
                    </div>
                  </div>

                  {/* Right Progress */}
                  <div className="space-y-3 bg-secondary/30 p-5 rounded-2xl border border-theme">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-secondary">
                        Overall Roadmap Completion
                      </span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {roadmapData.stats.completion_percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-theme/80 h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${roadmapData.stats.completion_percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-2xs font-medium text-secondary pt-1">
                      <span>
                        {roadmapData.stats.completed_count} of {roadmapData.stats.total_count} Milestones Completed
                      </span>
                      <span className="font-semibold text-primary truncate max-w-[180px] text-right">
                        Next: {roadmapData.stats.next_milestone}
                      </span>
                    </div>

                    {/* Time Tracking Info */}
                    <div className="mt-2 pt-2 border-t border-theme/60 flex items-center justify-between text-2xs font-mono text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>Completed: <strong className="text-primary">{roadmapData.stats.completed_weeks} Weeks</strong></span>
                      </span>
                      <span>
                        Remaining: <strong className="text-indigo-600 dark:text-indigo-400">{roadmapData.stats.remaining_weeks} Weeks</strong>
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Milestone Node Timeline Title */}
              <div className="flex items-center justify-between pt-2">
                <h2 className="text-lg font-extrabold text-primary tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Milestone Node Timeline
                </h2>
                <span className="text-xs text-secondary font-mono">
                  Real-time Skill Gap Tracking
                </span>
              </div>

              {/* Vertical Milestone Nodes */}
              <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-theme">
                {roadmapData.milestones.map((milestone, idx) => {
                  const isCompleted = milestone.status === 'completed';
                  const isInProgress = milestone.status === 'in_progress';
                  const isUpdating = updatingNodeId === milestone.id;

                  return (
                    <div key={milestone.id} className="relative group">
                      
                      {/* Timeline Node Icon Circle */}
                      <div
                        className={`absolute -left-6 md:-left-10 top-6 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform group-hover:scale-110 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                            : isInProgress
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                            : 'bg-secondary border-2 border-theme text-secondary'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span>{milestone.id}</span>
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div className="bg-card-bg border border-theme rounded-2xl p-6 md:p-7 space-y-5 shadow-xs hover:shadow-md transition-all">
                        
                        {/* Header: Status, Duration, Toggle */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-3 py-1 rounded-md text-2xs font-semibold uppercase tracking-wider ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : isInProgress
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                  : 'bg-secondary/60 text-secondary border border-theme'
                              }`}
                            >
                              {milestone.status === 'completed'
                                ? 'Completed'
                                : milestone.status === 'in_progress'
                                ? 'In Progress'
                                : 'Upcoming'}
                            </span>

                            <span className="inline-flex items-center gap-1 text-2xs font-mono text-secondary">
                              <Clock className="w-3 h-3 text-secondary" />
                              {milestone.duration_weeks} Weeks
                            </span>
                          </div>

                          {/* Quick Interactive Status Switcher */}
                          <div className="flex items-center gap-1.5">
                            {isUpdating ? (
                              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                            ) : (
                              <>
                                {!isCompleted && (
                                  <button
                                    onClick={() => handleStatusChange(milestone.id, 'completed')}
                                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-2xs font-medium border border-emerald-500/20 transition-colors"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                                {!isInProgress && (
                                  <button
                                    onClick={() => handleStatusChange(milestone.id, 'in_progress')}
                                    className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-2xs font-medium border border-indigo-500/20 transition-colors"
                                  >
                                    Set In Progress
                                  </button>
                                )}
                                {milestone.status !== 'upcoming' && (
                                  <button
                                    onClick={() => handleStatusChange(milestone.id, 'upcoming')}
                                    className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-secondary rounded-lg text-2xs font-medium border border-theme transition-colors"
                                  >
                                    Mark Upcoming
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-primary tracking-tight">
                            {milestone.title}
                          </h3>
                          <p className="text-xs text-secondary leading-relaxed mt-1">
                            {milestone.description}
                          </p>
                        </div>

                        {/* KEY SKILLS TO MASTER */}
                        {milestone.key_skills && milestone.key_skills.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="text-2xs font-mono font-bold text-secondary uppercase tracking-wider block">
                              KEY SKILLS TO MASTER:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {milestone.key_skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-theme text-xs font-medium text-primary shadow-2xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Curated Learning Resources (100% Unpaid & Verified) */}
                        {milestone.resources && milestone.resources.length > 0 && (
                          <div className="pt-3 border-t border-theme/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Curated Learning Resources ({milestone.resources.length})</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              {milestone.resources.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target={res.url.startsWith('/') ? '_self' : '_blank'}
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium hover:text-indigo-700 transition-colors"
                                >
                                  <span>{res.title}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
