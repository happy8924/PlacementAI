import React, { useEffect, useState } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import { getTpoStudents, getTpoStudentDetail } from '../../services/tpo';
import {
  Search,
  Filter,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  UserCheck,
  ExternalLink
} from 'lucide-react';

export default function TpoStudentsPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [placementStatus, setPlacementStatus] = useState('all');

  // Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTpoStudents({
        search,
        branch,
        graduation_year: graduationYear,
        min_cgpa: minCgpa ? parseFloat(minCgpa) : undefined,
        placement_status: placementStatus !== 'all' ? placementStatus : undefined
      });
      if (res.success) {
        setStudents(res.students);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.detail || 'Failed to query student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, branch, graduationYear, minCgpa, placementStatus]);

  const viewStudentDetails = async (studentId) => {
    setLoadingDetail(true);
    try {
      const res = await getTpoStudentDetail(studentId);
      if (res.success) {
        setSelectedStudent(res.student);
      }
    } catch (err) {
      console.error('Failed to fetch student detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <TpoLayout title="Student Directory & Readiness Hub">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Institutional Student Directory
          </h2>
          <p className="text-xs text-secondary font-mono">
            Search, filter, and audit verified student placement readiness, ATS scores, and applications.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-secondary border border-theme hover:bg-card-bg text-secondary hover:text-primary rounded-xl font-mono text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-card-bg border border-theme shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, roll..."
            className="w-full pl-9 pr-3 py-2 bg-secondary border border-theme rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Branch Filter */}
        <div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-theme rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Tech</option>
            <option value="Artificial Intelligence">AI & Data Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>
        </div>

        {/* Min CGPA */}
        <div>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            placeholder="Min CGPA (e.g. 7.5)"
            className="w-full px-3 py-2 bg-secondary border border-theme rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Grad Year */}
        <div>
          <select
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-theme rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">All Grad Years</option>
            <option value="2025">Class of 2025</option>
            <option value="2026">Class of 2026</option>
            <option value="2027">Class of 2027</option>
          </select>
        </div>

        {/* Placement Status */}
        <div>
          <select
            value={placementStatus}
            onChange={(e) => setPlacementStatus(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-theme rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed Only</option>
            <option value="unplaced">Unplaced Candidates</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-card-bg border border-theme rounded-2xl shadow-sm overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center text-secondary space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
            <p>Filtering student database records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-secondary space-y-2">
            <GraduationCap className="w-8 h-8 mx-auto text-indigo-400" />
            <p className="font-bold text-primary">No Matching Students Found</p>
            <p className="text-[11px]">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 border-b border-theme text-secondary text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll / Branch</th>
                  <th className="p-4">Academic CGPA</th>
                  <th className="p-4">ATS / Readiness</th>
                  <th className="p-4">Placement Status</th>
                  <th className="p-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {students.map((st) => {
                  const prof = st.profile || {};
                  const cgpa = prof.cgpa || '0.0';
                  const atsScore = prof.resume_score || prof.ats_score || null;

                  return (
                    <tr key={st.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-primary">{st.name}</div>
                        <div className="text-[11px] text-secondary">{st.app_id} • {st.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-primary font-semibold">
                          {st.student_details?.roll_number || prof.roll_number || 'N/A'}
                        </div>
                        <div className="text-[11px] text-secondary">
                          {st.student_details?.branch || prof.branch || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-primary px-2 py-0.5 rounded bg-secondary border border-theme">
                          {cgpa} CGPA
                        </span>
                      </td>
                      <td className="p-4">
                        {atsScore ? (
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            atsScore >= 75
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {atsScore}% ATS
                          </span>
                        ) : (
                          <span className="text-secondary text-[11px]">No Resume Evaluated</span>
                        )}
                      </td>
                      <td className="p-4">
                        {st.is_placed ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Placed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary text-secondary border border-theme w-max">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => viewStudentDetails(st.id)}
                          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg font-bold flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Comprehensive Review Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card-bg border border-theme max-w-2xl w-full rounded-2xl shadow-2xl p-6 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-primary uppercase">
                  Student Institutional Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-secondary text-secondary hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Summary Header */}
            <div className="p-4 rounded-xl bg-secondary border border-theme grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-secondary uppercase">Candidate</span>
                <p className="font-bold text-primary truncate">{selectedStudent.name}</p>
                <p className="text-[10px] text-indigo-400">{selectedStudent.app_id}</p>
              </div>
              <div>
                <span className="text-[10px] text-secondary uppercase">Branch & Year</span>
                <p className="font-bold text-primary">{selectedStudent.student_details?.branch || selectedStudent.profile?.branch || 'N/A'}</p>
                <p className="text-[10px] text-secondary">Class of {selectedStudent.student_details?.graduation_year || selectedStudent.profile?.graduation_year || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-secondary uppercase">Academic Score</span>
                <p className="font-bold text-emerald-400">{selectedStudent.profile?.cgpa || '0.0'} CGPA</p>
                <p className="text-[10px] text-secondary">Roll: {selectedStudent.student_details?.roll_number || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-secondary uppercase">ATS Score</span>
                <p className="font-bold text-indigo-400">{selectedStudent.profile?.resume_score || selectedStudent.profile?.ats_score || 'N/A'}%</p>
                <p className="text-[10px] text-secondary">Evaluated</p>
              </div>
            </div>

            {/* Tech Skills */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary uppercase text-[11px] tracking-wider">
                Recognized Technical Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.profile?.skills?.length > 0 ? (
                  selectedStudent.profile.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-secondary border border-theme text-primary text-[11px]"
                    >
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-secondary italic">No skills documented yet.</span>
                )}
              </div>
            </div>

            {/* Applications Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary uppercase text-[11px] tracking-wider">
                Campus Drive Applications ({selectedStudent.applications?.length || 0})
              </h4>
              {selectedStudent.applications?.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudent.applications.map((app, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-secondary/60 border border-theme flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-primary">{app.job_title || 'Position Applied'}</div>
                        <div className="text-secondary">{app.company_name || 'Recruiter'}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">No job applications submitted yet.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-secondary border border-theme rounded-xl text-secondary hover:text-primary"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </TpoLayout>
  );
}
