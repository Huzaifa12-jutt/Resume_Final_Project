import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import VerifyEmail from '../pages/Auth/VerifyEmail';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import Unauthorized from '../pages/Auth/Unauthorized';
import LandingPage from '../pages/Landing/LandingPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';
import RoleRoute from '../components/auth/RoleRoute';
import RecruiterOverviewPage from '../pages/Recruiter/RecruiterOverviewPage';
import RecruiterJobsPage from '../pages/Recruiter/RecruiterJobsPage';
import RecruiterCandidatesPage from '../pages/Recruiter/RecruiterCandidatesPage';
import RecruiterAnalyticsPage from '../pages/Recruiter/RecruiterAnalyticsPage';
import RecruiterCompanyPage from '../pages/Recruiter/RecruiterCompanyPage';
import RecruiterSettingsPage from '../pages/Recruiter/RecruiterSettingsPage';
import RecruiterJobDashboardPage from '../pages/Recruiter/RecruiterJobDashboardPage';
import CandidateOverviewPage from '../pages/Candidate/CandidateOverviewPage';
import CandidateBrowseJobsPage from '../pages/Candidate/CandidateBrowseJobsPage';
import CandidateSavedJobsPage from '../pages/Candidate/CandidateSavedJobsPage';
import CandidateApplicationsPage from '../pages/Candidate/CandidateApplicationsPage';
import CandidateProfilePage from '../pages/Candidate/CandidateProfilePage';
import CandidateSettingsPage from '../pages/Candidate/CandidateSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/verify-email" element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/recruiter" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterOverviewPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterJobsPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:jobId" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterJobDashboardPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/recruiter/candidates" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterCandidatesPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/recruiter/analytics" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterAnalyticsPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/recruiter/company" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterCompanyPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/recruiter/settings" element={<ProtectedRoute><RoleRoute allowedRoles={['recruiter']}><RecruiterSettingsPage /></RoleRoute></ProtectedRoute>} />

      <Route path="/candidate" element={<ProtectedRoute><RoleRoute allowedRoles={['candidate']}><CandidateOverviewPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/candidate/jobs" element={<ProtectedRoute><RoleRoute allowedRoles={['candidate']}><CandidateBrowseJobsPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/candidate/saved" element={<ProtectedRoute><RoleRoute allowedRoles={['candidate']}><CandidateSavedJobsPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/candidate/applications" element={<ProtectedRoute><RoleRoute allowedRoles={['candidate']}><CandidateApplicationsPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/candidate/profile" element={<ProtectedRoute><RoleRoute allowedRoles={['candidate']}><CandidateProfilePage /></RoleRoute></ProtectedRoute>} />
      <Route path="/candidate/settings" element={<ProtectedRoute><RoleRoute allowedRoles={['candidate']}><CandidateSettingsPage /></RoleRoute></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
