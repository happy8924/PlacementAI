import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  // Public
  '/': 'Home — AI-Powered Career & Placement Platform',
  '/login': 'Login — PlacementAI',
  '/signup': 'Create Account — PlacementAI',
  '/forgot-password': 'Forgot Password — PlacementAI',
  '/reset-password': 'Reset Password — PlacementAI',
  '/awaiting-approval': 'Pending Approval — PlacementAI',

  // Student Module
  '/student/dashboard': 'Student Dashboard — PlacementAI',
  '/student/profile': 'My Profile — PlacementAI',
  '/student/resume': 'Resume Intelligence & ATS — PlacementAI',
  '/student/roadmap': 'Skill Gap & Career Roadmap — PlacementAI',
  '/student/interview': 'AI Mock Interview — PlacementAI',
  '/student/jobs': 'Jobs & Opportunities — PlacementAI',
  '/student/applications': 'My Applications — PlacementAI',
  '/student/bookmarks': 'Saved Jobs — PlacementAI',
  '/student/notifications': 'Notifications — PlacementAI',
  '/student/settings': 'Account Settings — PlacementAI',

  // Recruiter Module
  '/recruiter/dashboard': 'Recruiter Dashboard — PlacementAI',
  '/recruiter/jobs': 'Manage Job Vacancies — PlacementAI',
  '/recruiter/applicants': 'Candidate Pipeline — PlacementAI',
  '/recruiter/profile': 'Company Profile — PlacementAI',

  // TPO Module
  '/tpo/dashboard': 'TPO Dashboard — PlacementAI',
  '/tpo/approvals': 'Approvals Queue — PlacementAI',
  '/tpo/students': 'Student Directory — PlacementAI',
  '/tpo/recruitment': 'Recruitment Oversight — PlacementAI',
  '/tpo/analytics': 'Placement Analytics — PlacementAI',
  '/tpo/audit': 'Audit Timeline — PlacementAI',

  // Admin Module
  '/admin/dashboard': 'Admin Console — PlacementAI',
  '/admin/users': 'User Governance — PlacementAI',
  '/admin/students': 'Student Directory — PlacementAI Admin',
  '/admin/recruiters': 'Recruiter Directory — PlacementAI Admin',
  '/admin/tpos': 'TPO Directory — PlacementAI Admin',
  '/admin/roles': 'Roles & RBAC — PlacementAI',
  '/admin/placement': 'Placement Drives — PlacementAI Admin',
  '/admin/ai-center': 'AI Center — PlacementAI',
  '/admin/system': 'System Health — PlacementAI',
  '/admin/audit': 'Audit Logs — PlacementAI Admin',
  '/admin/reports': 'Executive Reports — PlacementAI',
  '/admin/settings': 'System Settings — PlacementAI',
  '/admin/profile': 'Admin Profile — PlacementAI'
};

export default function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Exact match or fallback
    let matchedTitle = ROUTE_TITLES[pathname];
    
    // Dynamic matching for routes like /admin/users/:id
    if (!matchedTitle) {
      if (pathname.startsWith('/admin/users/')) {
        matchedTitle = 'User Details — PlacementAI Admin';
      } else if (pathname.startsWith('/recruiter/')) {
        matchedTitle = 'Recruiter Portal — PlacementAI';
      } else if (pathname.startsWith('/student/')) {
        matchedTitle = 'Student Portal — PlacementAI';
      } else if (pathname.startsWith('/tpo/')) {
        matchedTitle = 'TPO Portal — PlacementAI';
      } else {
        matchedTitle = 'PlacementAI — Career Readiness Platform';
      }
    }

    document.title = matchedTitle;
  }, [location]);

  return null;
}
