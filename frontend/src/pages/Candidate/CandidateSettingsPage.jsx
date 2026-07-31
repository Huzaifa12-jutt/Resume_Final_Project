import { useState } from 'react';
import toast from 'react-hot-toast';
import RoleShell from '../../components/layout/RoleShell';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function CandidateSettingsPage() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || user?.name || '', phone: user?.phone || '' });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await authService.updateMe(form);
      toast.success('Settings saved.');
    } catch (error) {
      toast.error(error.message || 'Unable to save settings');
    }
  };

  return (
    <RoleShell title="Settings" subtitle="Adjust your account details and preferences." role="candidate">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" required />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Phone
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
        </label>
        <button type="submit" className="mt-5 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Save settings</button>
      </form>
    </RoleShell>
  );
}
