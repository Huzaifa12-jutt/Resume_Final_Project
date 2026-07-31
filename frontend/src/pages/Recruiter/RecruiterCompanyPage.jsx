import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function RecruiterCompanyPage() {
  useDocumentTitle('Company Profile');
  const [form, setForm] = useState({ company_name: '', industry: '', website: '', address: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const company = await atsService.getCompany();
        setForm({ company_name: company.company_name || '', industry: company.industry || '', website: company.website || '', address: company.address || '', description: company.description || '' });
      } catch {
        // Ignore missing company profile.
      }
    };
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await atsService.upsertCompany(form);
      toast.success('Company profile saved.');
    } catch (error) {
      toast.error(error.message || 'Unable to save company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleShell title="Company Profile" subtitle="Create a polished profile for your hiring organization." role="recruiter">
      <Card>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                required
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
              <input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                placeholder="Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                placeholder="https://acme.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                placeholder="123 Main St"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 resize-none"
              placeholder="Tell us about your company..."
            />
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <Button type="submit" variant="primary" size="md" icon={Building2} isLoading={saving}>
              Save company profile
            </Button>
          </div>
        </form>
      </Card>
    </RoleShell>
  );
}
