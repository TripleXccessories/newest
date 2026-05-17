import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Save, Play, Bot, Heart, Phone, Scroll } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import IntroReplayModal from '@/components/intro/IntroReplayModal';
import BotNamingCard from '@/components/bots/BotNamingCard';
import BenevolentBenefactorForm from '@/components/settings/BenevolentBenefactorForm';
import KillSwitchContactPanel from '@/components/settings/KillSwitchContactPanel';
import LegacyEstatePanel from '@/components/settings/LegacyEstatePanel';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'my_bots', label: 'My Bots', icon: Bot },
  { id: 'legacy', label: 'Legacy & Estate', icon: Scroll },
];

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', bio: '', trader_experience: 'beginner' });
  const [notifSettings, setNotifSettings] = useState({ signals: true, community: true, system: true, email: true });
  const [showIntroReplay, setShowIntroReplay] = useState(false);
  const [botPersonas, setBotPersonas] = useState([]);
  const [userBotProfiles, setUserBotProfiles] = useState([]);

  useEffect(() => {
    base44.entities.BotPersona.list().then(setBotPersonas).catch(() => {});
    base44.entities.UserBotProfile.list().then(setUserBotProfiles).catch(() => {});
  }, []);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setFormData((f) => ({ ...f, full_name: u?.full_name || '' }));
    }).catch(() => {});
    base44.entities.UserProfile.list('-created_date', 1).then(([p]) => {
      if (p) {
        setProfile(p);
        setFormData((f) => ({ ...f, bio: p.bio || '', trader_experience: p.trader_experience || 'beginner' }));
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: formData.full_name });
    if (profile?.id) {
      await base44.entities.UserProfile.update(profile.id, { bio: formData.bio, trader_experience: formData.trader_experience });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AnimatePresence>
        {showIntroReplay && (
          <IntroReplayModal
            userName={user?.full_name?.split(' ')[0] || 'Trader'}
            onClose={() => setShowIntroReplay(false)}
          />
        )}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <SettingsIcon size={22} className="text-[#00d4aa]" /> Settings
        </h1>
        <p className="text-sm text-[#64748b] mt-1">Manage your IINT Beta account and preferences.</p>
      </div>

      <div className="flex flex-wrap gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'bg-[#00d4aa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        {tab === 'profile' && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Profile Information</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#00d4aa]/20 border-2 border-[#00d4aa]/40 flex items-center justify-center text-2xl font-bold text-[#00d4aa]">
                {formData.full_name?.charAt(0) || user?.full_name?.charAt(0) || 'T'}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f1f5f9]">{user?.full_name || 'Trader'}</p>
                <p className="text-xs text-[#64748b]">{user?.email || ''}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-bold rounded">BETA TESTER</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Full Name</label>
              <input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Tell the community about your trading style..."
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa] resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Trading Experience</label>
              <select
                value={formData.trader_experience}
                onChange={(e) => setFormData({ ...formData, trader_experience: e.target.value })}
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 disabled:opacity-60 transition-colors">
              <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#070b14] border border-[#1e293b] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-[#f1f5f9]">Two-Factor Authentication</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748b] bg-[#1e293b] px-2 py-0.5 rounded">Coming Soon</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#070b14] border border-[#1e293b] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-[#f1f5f9]">Change Password</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Update your account password</p>
                </div>
                <button className="px-3 py-1.5 border border-[#1e293b] text-sm text-[#64748b] rounded-lg hover:border-[#00d4aa]/40 hover:text-[#f1f5f9] transition-colors">
                  Update
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#070b14] border border-[#1e293b] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-[#f1f5f9]">Active Sessions</p>
                  <p className="text-xs text-[#64748b] mt-0.5">1 active session</p>
                </div>
                <button className="px-3 py-1.5 border border-red-500/30 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                  Revoke All
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'my_bots' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#f1f5f9]">My Bots</h2>
                <p className="text-xs text-[#64748b] mt-0.5">Name your bots and customize how they address you. Fixed titles never change.</p>
              </div>
              <button
                onClick={() => setShowIntroReplay(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-[#00d4aa]/30 text-[#00d4aa] rounded-lg text-xs font-medium hover:bg-[#00d4aa]/10 transition-colors"
              >
                <Play size={12} /> Replay Intro
              </button>
            </div>

            <div className="grid gap-4">
              {botPersonas.length === 0 ? (
                <p className="text-sm text-[#64748b] text-center py-8">Loading bots...</p>
              ) : (
                botPersonas.map((bot) => {
                  const ubp = userBotProfiles.find((u) => u.bot_persona_id === bot.id);
                  return (
                    <BotNamingCard
                      key={bot.id}
                      bot={bot}
                      userBotProfile={ubp}
                      onSave={async (data) => {
                        if (ubp) {
                          await base44.entities.UserBotProfile.update(ubp.id, data);
                        } else {
                          const u = await base44.auth.me();
                          await base44.entities.UserBotProfile.create({ user_id: u.id, bot_persona_id: bot.id, ...data });
                        }
                        const updated = await base44.entities.UserBotProfile.list();
                        setUserBotProfiles(updated);
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === 'legacy' && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[#f1f5f9] flex items-center gap-2">
              <Scroll size={16} className="text-[#f59e0b]" /> Legacy &amp; Estate
            </h2>
            <p className="text-xs text-[#64748b]">Designate your Benevolent Benefactor, emergency contact, and review how IINT handles your account in the event of your passing.</p>
            <LegacyEstatePanel
              profile={profile}
              onSave={async (data) => {
                if (profile?.id) {
                  await base44.entities.UserProfile.update(profile.id, data);
                  setProfile(prev => ({ ...prev, ...data }));
                }
              }}
            />
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Notification Preferences</h2>
            <div className="space-y-3">
              {[
                { key: 'signals', label: 'Signal Alerts', desc: 'Get notified when new AI signals are published' },
                { key: 'community', label: 'Community Activity', desc: 'Replies and mentions in community posts' },
                { key: 'system', label: 'System Updates', desc: 'Platform updates and beta announcements' },
                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-[#070b14] border border-[#1e293b] rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-[#f1f5f9]">{label}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings({ ...notifSettings, [key]: !notifSettings[key] })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${notifSettings[key] ? 'bg-[#00d4aa]' : 'bg-[#1e293b]'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifSettings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}