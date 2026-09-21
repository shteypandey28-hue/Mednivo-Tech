import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Building2, Bell, Lock, CreditCard, Stethoscope, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { authAPI, clinicAPI } from "@/lib/api";
import { TemplateDesigner } from "@/components/TemplateDesigner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [clinic, setClinic] = useState<any>(null);

  const [settingsData, setSettingsData] = useState({
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    appointmentDuration: 15,
    defaultConsultationFee: 500,
    autoGenerateInvoice: true,
  });

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const { data } = await clinicAPI.get();
        setClinic(data);
        setClinicData({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
        });
        if (data.clinicSettings) {
           setSettingsData({
             workingHoursStart: data.clinicSettings.workingHoursStart || '09:00',
             workingHoursEnd: data.clinicSettings.workingHoursEnd || '18:00',
             appointmentDuration: data.clinicSettings.appointmentDuration || 15,
             defaultConsultationFee: data.clinicSettings.defaultConsultationFee || 500,
             autoGenerateInvoice: data.clinicSettings.autoGenerateInvoice ?? true,
           });
        }
      } catch (error) {
        console.error('Failed to fetch clinic', error);
      }
    };
    fetchClinic();
  }, []);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    specialty: user?.specialty || '',
    qualification: user?.qualification || '',
    registrationNumber: user?.registrationNumber || '',
    consultationFee: user?.consultationFee || 0,
  });

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      const { data } = await authAPI.updateProfile({
        name: profileData.name,
        specialty: profileData.specialty,
        qualification: profileData.qualification,
        registrationNumber: profileData.registrationNumber,
        consultationFee: Number(profileData.consultationFee)
      });
      updateUser(data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Clinic Form State
  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  const handleClinicSave = async () => {
    try {
      setIsSaving(true);
      await clinicAPI.update(clinicData);
      alert('Clinic details updated successfully!');
    } catch (error) {
      console.error('Failed to update clinic', error);
      alert('Failed to update clinic details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      setIsSaving(true);
      await clinicAPI.updateSettings(settingsData);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings', error);
      alert('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Doctor Profile', icon: User },
    { id: 'clinic', label: 'Clinic Details', icon: Building2 },
    { id: 'templates', label: 'Prescription Templates', icon: SettingsIcon },
    { id: 'preferences', label: 'Consultation Preferences', icon: Stethoscope },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & PIN', icon: Lock },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and clinic preferences.</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 overflow-hidden flex-shrink-0">
          <div className="flex flex-col p-2 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-emerald-700 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <User className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Profile Picture</h3>
                    <p className="text-sm text-slate-500 mb-3">JPG, GIF or PNG. Max size of 800K</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Select Image</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
                    <Input 
                      value={profileData.name} 
                      onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Specialty</label>
                    <Input 
                      value={profileData.specialty} 
                      onChange={e => setProfileData(p => ({ ...p, specialty: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Qualifications</label>
                    <Input 
                      value={profileData.qualification} 
                      onChange={e => setProfileData(p => ({ ...p, qualification: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Registration Number</label>
                    <Input 
                      value={profileData.registrationNumber} 
                      onChange={e => setProfileData(p => ({ ...p, registrationNumber: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Consultation Fee (₹)</label>
                    <Input 
                      value={profileData.consultationFee} 
                      onChange={e => setProfileData(p => ({ ...p, consultationFee: Number(e.target.value) }))}
                      type="number" 
                      className="h-11" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'clinic' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-700 cursor-pointer hover:bg-indigo-50 transition-colors">
                    <Building2 className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Clinic Logo</h3>
                    <p className="text-sm text-slate-500 mb-3">Square image recommended. Max size 1MB.</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Select Image</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Clinic Name</label>
                    <Input 
                      value={clinicData.name} 
                      onChange={e => setClinicData(p => ({ ...p, name: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Address</label>
                    <Input 
                      value={clinicData.address} 
                      onChange={e => setClinicData(p => ({ ...p, address: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Contact Phone</label>
                    <Input 
                      value={clinicData.phone} 
                      onChange={e => setClinicData(p => ({ ...p, phone: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Contact Email</label>
                    <Input 
                      value={clinicData.email} 
                      onChange={e => setClinicData(p => ({ ...p, email: e.target.value }))}
                      type="email"
                      className="h-11" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Website (Optional)</label>
                    <Input 
                      value={clinicData.website} 
                      onChange={e => setClinicData(p => ({ ...p, website: e.target.value }))}
                      className="h-11" 
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleClinicSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <TemplateDesigner />
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Working Hours Start</label>
                    <Input 
                      type="time"
                      value={settingsData.workingHoursStart} 
                      onChange={e => setSettingsData(p => ({ ...p, workingHoursStart: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Working Hours End</label>
                    <Input 
                      type="time"
                      value={settingsData.workingHoursEnd} 
                      onChange={e => setSettingsData(p => ({ ...p, workingHoursEnd: e.target.value }))}
                      className="h-11" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Default Appointment Duration (minutes)</label>
                    <Input 
                      type="number"
                      value={settingsData.appointmentDuration} 
                      onChange={e => setSettingsData(p => ({ ...p, appointmentDuration: Number(e.target.value) }))}
                      className="h-11" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleSettingsSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Default Consultation Fee (₹)</label>
                    <Input 
                      type="number"
                      value={settingsData.defaultConsultationFee} 
                      onChange={e => setSettingsData(p => ({ ...p, defaultConsultationFee: Number(e.target.value) }))}
                      className="h-11" 
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <h4 className="font-medium text-slate-900">Auto-Generate Invoices</h4>
                      <p className="text-sm text-slate-500">Automatically create an invoice when an appointment is completed.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settingsData.autoGenerateInvoice}
                        onChange={e => setSettingsData(p => ({ ...p, autoGenerateInvoice: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleSettingsSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Billing Settings
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Current Password</label>
                    <Input type="password" placeholder="Enter current password" className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">New Password</label>
                    <Input type="password" placeholder="Enter new password" className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Confirm New Password</label>
                    <Input type="password" placeholder="Confirm new password" className="h-11" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={() => alert("Password updated successfully!")}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"
                  >
                    <Save className="w-4 h-4" /> Update Password
                  </Button>
                </div>
              </div>
            )}

            {!['profile', 'clinic', 'preferences', 'billing', 'security'].includes(activeTab) && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SettingsIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Settings Section</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">This section is available in the full version of Mednivo. Configure your {tabs.find(t => t.id === activeTab)?.label?.toLowerCase()} here.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
