import { useState, useEffect } from 'react';
import { Settings, Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleShell from '../../components/layout/RoleShell';
import { authService } from '../../services/authService';
import { gmailService } from '../../services/gmailService';
import { useAuth } from '../../contexts/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function RecruiterSettingsPage() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  
  // Gmail integration state
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null });
  const [loadingGmail, setLoadingGmail] = useState(true);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);
  const [userId] = useState(user?.id || 'default-user');

  useEffect(() => {
    checkGmailStatus();
    
    // Check if just connected from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gmail_connected') === 'true') {
      checkGmailStatus();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkGmailStatus = async () => {
    try {
      const status = await gmailService.getStatus(userId);
      setGmailStatus(status);
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    } finally {
      setLoadingGmail(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const { auth_url } = await gmailService.getAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      toast.error('Failed to connect Gmail. Please try again.');
    }
  };

  const handleFetchEmails = async () => {
    setFetchingEmails(true);
    setFetchResult(null);
    
    try {
      const result = await gmailService.fetchEmails(userId);
      setFetchResult(result);
      if (result.success) {
        toast.success(`Fetched ${result.candidates_saved} candidates from Gmail`);
      }
    } catch (error) {
      toast.error('Failed to fetch emails. Please check your Gmail connection.');
      setFetchResult({
        success: false,
        message: 'Failed to fetch emails. Please check your Gmail connection.'
      });
    } finally {
      setFetchingEmails(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await authService.updateMe(form);
      toast.success('Settings saved.');
    } catch (error) {
      toast.error(error.message || 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleShell title="Settings" subtitle="Update your recruiter profile and contact details." role="recruiter">
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                required
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Button type="submit" variant="primary" size="md" icon={Settings} isLoading={saving}>
                Save settings
              </Button>
            </div>
          </form>
        </Card>

        {/* Gmail Integration */}
        <Card>
          <div className="flex items-center mb-4">
            <Mail className="text-indigo-600 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-slate-800">Gmail Integration</h3>
          </div>

          {loadingGmail ? (
            <div className="text-slate-500 text-sm">Loading Gmail status...</div>
          ) : (
            <>
              {/* Connection Status */}
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  {gmailStatus.connected ? (
                    <>
                      <CheckCircle className="text-green-600 mr-2" size={18} />
                      <span className="text-green-700 font-medium text-sm">Connected</span>
                      {gmailStatus.email && (
                        <span className="ml-2 text-slate-600 text-sm">({gmailStatus.email})</span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600 mr-2" size={18} />
                      <span className="text-red-700 font-medium text-sm">Not Connected</span>
                    </>
                  )}
                </div>
              </div>

              {/* Connect Button */}
              {!gmailStatus.connected && (
                <Button
                  onClick={handleConnectGmail}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Connect Gmail Account
                </Button>
              )}

              {/* Fetch Emails Section */}
              {gmailStatus.connected && (
                <div className="mt-4">
                  <p className="text-slate-600 text-sm mb-3">
                    Fetch resumes from your Gmail inbox and spam folders. Emails with PDF attachments 
                    containing "resume", "CV", or "application" in the subject will be processed automatically.
                  </p>
                  <Button
                    onClick={handleFetchEmails}
                    disabled={fetchingEmails}
                    variant="primary"
                    size="md"
                    className="w-full"
                    icon={fetchingEmails ? RefreshCw : Mail}
                    isLoading={fetchingEmails}
                  >
                    {fetchingEmails ? 'Fetching Emails...' : 'Fetch Emails'}
                  </Button>
                </div>
              )}

              {/* Fetch Result */}
              {fetchResult && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    fetchResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-medium text-sm ${
                      fetchResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {fetchResult.message}
                  </p>
                  {fetchResult.success && (
                    <div className="mt-2 text-xs text-slate-600">
                      <p>Emails fetched: {fetchResult.candidates_fetched}</p>
                      <p>Candidates saved: {fetchResult.candidates_saved}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </RoleShell>
  );
}
