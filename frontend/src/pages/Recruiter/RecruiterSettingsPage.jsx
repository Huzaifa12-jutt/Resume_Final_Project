import { useState, useEffect, useRef } from 'react';
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
  
  // Gmail integration state (the backend identifies the recruiter from the JWT)
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null });
  const [loadingGmail, setLoadingGmail] = useState(true);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [disconnectingGmail, setDisconnectingGmail] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);
  const [gmailError, setGmailError] = useState(null);
  // Set when we return from a failed OAuth callback — checkGmailStatus must
  // not clear it (its own async completion would otherwise wipe the banner).
  const callbackErrorRef = useRef(null);

  useEffect(() => {
    // Handle the OAuth callback result FIRST (synchronously), before the async
    // status check can clobber the banner below.
    const urlParams = new URLSearchParams(window.location.search);
    const gmailResult = urlParams.get('gmail_connected');
    if (gmailResult === 'true') {
      toast.success('Gmail connected successfully.');
    } else if (gmailResult === 'error') {
      const reason = urlParams.get('reason') || 'error';
      const msg = {
        missing_state: 'Gmail connection failed: missing state. Please try again.',
        invalid_state: 'Gmail connection failed: invalid session. Please reconnect.',
        error: 'Gmail connection failed. Please check your Google OAuth credentials and redirect URI, then try again.',
      }[reason] || 'Gmail connection failed. Please try again.';
      callbackErrorRef.current = msg;
      setGmailError(msg);
      toast.error(msg);
    }
    if (gmailResult) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    // The ref only needs to protect the banner during the initial status
    // check, so clear it once that completes.
    checkGmailStatus().finally(() => {
      callbackErrorRef.current = null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkGmailStatus = async () => {
    try {
      const status = await gmailService.getStatus();
      setGmailStatus(status);
      // Don't clear a banner left over from a failed OAuth callback.
      if (!callbackErrorRef.current) {
        setGmailError(null);
      }
    } catch (error) {
      console.error('Error checking Gmail status:', error);
      if (!callbackErrorRef.current) {
        setGmailError(error.message || 'Failed to check Gmail status');
      }
    } finally {
      setLoadingGmail(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const { auth_url } = await gmailService.getAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      console.error('Failed to get Gmail auth URL:', error);
      setGmailError(error.message || 'Failed to connect Gmail. Please try again.');
      toast.error(error.message || 'Failed to connect Gmail. Please try again.');
    }
  };

  const handleDisconnectGmail = async () => {
    setDisconnectingGmail(true);
    try {
      await gmailService.disconnect();
      setGmailStatus({ connected: false, email: null });
      setFetchResult(null);
      toast.success('Gmail disconnected.');
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
      setGmailError(error.message || 'Failed to disconnect Gmail');
      toast.error(error.message || 'Failed to disconnect Gmail');
    } finally {
      setDisconnectingGmail(false);
    }
  };

  const handleFetchEmails = async () => {
    setFetchingEmails(true);
    setFetchResult(null);
    
    try {
      const result = await gmailService.fetchEmails();
      setFetchResult(result);
      if (result.success) {
        toast.success(`Fetched ${result.candidates_saved} candidates from Gmail`);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      const msg = error.message || 'Failed to fetch emails. Please check your Gmail connection.';
      toast.error(msg);
      setFetchResult({ success: false, message: msg });
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

              {/* Backend / config error */}
              {gmailError && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-amber-800 font-medium text-sm">{gmailError}</p>
                </div>
              )}

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

              {/* Fetch Emails + Disconnect Section */}
              {gmailStatus.connected && (
                <div className="mt-4 space-y-3">
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
                  <Button
                    onClick={handleDisconnectGmail}
                    disabled={disconnectingGmail}
                    variant="danger"
                    size="md"
                    className="w-full"
                    isLoading={disconnectingGmail}
                  >
                    Disconnect Gmail
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
