import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Save, User, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileState } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password Reset States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Loading States
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setProfileError('Name is required');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await API.put('/auth/profile', { name, bio, avatar });
      if (response.data && response.data.success) {
        updateProfileState(response.data.data);
        setProfileSuccess('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await API.put('/auth/profile', { name, password });
      if (response.data && response.data.success) {
        setPasswordSuccess('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header Title */}
      <div>
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your account information and password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: General Profile Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">Public Profile Info</h3>
          </div>

          {profileSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                title="Email address cannot be changed."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Short Bio</label>
              <textarea
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little bit about yourself..."
                className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {profileLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile Info</span>
            </button>
          </form>
        </div>

        {/* Right Side: Change Password */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Lock className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">Reset Password</h3>
          </div>

          {passwordSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                required
                value={password}
                placeholder="Min 6 characters"
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                placeholder="Repeat password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {passwordLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Reset Password</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
