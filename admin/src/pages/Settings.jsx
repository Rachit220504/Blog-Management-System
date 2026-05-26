import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { validateSettingsForm } from '../utils/validators';
import { formatRole } from '../utils/formatters';
import { getPermissionsForRole } from '../config/permissions';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import FormField, { inputClass } from '../components/ui/FormField';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfileState, permissions } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [appPrefs, setAppPrefs] = useState(() => ({
    compactSidebar: localStorage.getItem('admin-pref-compact-sidebar') === 'true',
    defaultStatus: localStorage.getItem('admin-pref-default-status') || 'draft',
  }));

  const permissionLabels = useMemo(() => getPermissionsForRole(user?.role), [user?.role]);

  const saveProfile = async () => {
    const formErrors = validateSettingsForm({ name, avatar });
    setErrors(formErrors);
    if (Object.keys(formErrors).length) return;

    try {
      const response = await authApi.updateProfile({ name, avatar, bio });
      updateProfileState(response.data.data);
      toast.success('Profile saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile save failed');
    }
  };

  const savePassword = async () => {
    if (!password || password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await authApi.updateProfile({ name, password });
      toast.success('Password updated');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    }
  };

  const savePref = (key, value) => {
    localStorage.setItem(key, String(value));
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Update your profile, password, and local dashboard preferences." />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white">Profile</h3>
          <div className="mt-5 grid gap-4">
            <FormField label="Name" error={errors.name} required>
              <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Avatar URL" error={errors.avatar}>
              <input value={avatar} onChange={(event) => setAvatar(event.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Bio">
              <textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} className={inputClass} />
            </FormField>
            <button onClick={saveProfile} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 sm:w-fit">Save Profile</button>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <h4 className="text-base font-semibold text-white">Change Password</h4>
            <div className="mt-4 grid gap-4">
              <FormField label="New Password">
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
              </FormField>
              <FormField label="Confirm Password">
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
              </FormField>
              <button onClick={savePassword} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-fit">Update Password</button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white">Current Account</h3>
            <div className="mt-4 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`} alt={user?.name || 'Admin'} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
              <div>
                <p className="text-lg font-semibold text-white">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="info">{formatRole(user?.role || 'user')}</Badge>
                  <Badge tone="neutral">{permissions.length} permissions</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white">App Preferences</h3>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span>Compact sidebar</span>
                <input type="checkbox" checked={appPrefs.compactSidebar} onChange={(event) => { setAppPrefs((current) => ({ ...current, compactSidebar: event.target.checked })); savePref('admin-pref-compact-sidebar', event.target.checked); }} />
              </label>
              <label className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span className="mb-2 block">Default post status</span>
                <select value={appPrefs.defaultStatus} onChange={(event) => { setAppPrefs((current) => ({ ...current, defaultStatus: event.target.value })); savePref('admin-pref-default-status', event.target.value); }} className={inputClass}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white">Permissions Snapshot</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {permissionLabels.map((permission) => <Badge key={permission}>{permission}</Badge>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
