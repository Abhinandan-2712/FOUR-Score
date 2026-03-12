"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineCog } from "react-icons/hi";
import { FaSave } from "react-icons/fa";

const TABS = [
  { id: "general", label: "General" },
  // { id: "email", label: "Email" },
  // { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  // General Settings
  const [appName, setAppName] = useState("FOUR Score");
  const [appDescription, setAppDescription] = useState("Fitness and wellness platform");
  const [supportEmail, setSupportEmail] = useState("support@fourscore.com");
  const [contactPhone, setContactPhone] = useState("+1 234 567 8900");

  // Email Settings
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("noreply@fourscore.com");
  const [fromName, setFromName] = useState("FOUR Score");

  // Notification Settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);

  // Security Settings
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecialChars, setRequireSpecialChars] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  // Admin password change (UI only, no real API)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const handleChangePassword = () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < minPasswordLength) {
      toast.error(`New password must be at least ${minPasswordLength} characters long`);
      return;
    }

    if (requireUppercase && !/[A-Z]/.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }
    if (requireLowercase && !/[a-z]/.test(newPassword)) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }
    if (requireNumbers && !/[0-9]/.test(newPassword)) {
      toast.error("Password must contain at least one number");
      return;
    }
    if (requireSpecialChars && !/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) {
      toast.error("Password must contain at least one special character");
      return;
    }

    // TODO: Replace with real API call
    toast.success("Admin password updated (mock). Integrate API here.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const chipClasses = (active) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-[#0A3161] text-white shadow-sm"
        : "text-[#2158A3] hover:bg-[#F2F5FA]"
    }`;

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3161] text-white shadow-md">
          <HiOutlineCog className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#0A3161] leading-6">Settings</h1>
          <p className="text-sm text-[#2158A3]">Manage application settings and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-lg border border-[#C8D7E9] bg-white p-1 shadow-sm mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={chipClasses(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-2xl border border-[#C8D7E9] shadow-md p-6 md:p-7">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-[#0A3161] mb-4">General Settings</h2>
            
            <div>
              <label className="text-xs font-medium text-[#2158A3]">
                App Name <span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2158A3]">App Description</label>
              <textarea
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-[#C8D7E9] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A3161]/30 resize-none"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  Support Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#2158A3]">Contact Phone</label>
                <Input
                  type="tel"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-[#0A3161] mb-4">Email Settings</h2>
            
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  SMTP Host <span className="text-red-500">*</span>
                </label>
                <Input
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  SMTP Port <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  SMTP Username <span className="text-red-500">*</span>
                </label>
                <Input
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  SMTP Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  From Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  From Name <span className="text-red-500">*</span>
                </label>
                <Input
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-[#0A3161] mb-4">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#C8D7E9] bg-white">
                <div>
                  <p className="text-sm font-medium text-[#0A3161]">Push Notifications</p>
                  <p className="text-xs text-[#5671A6] mt-1">Enable push notifications for users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotificationsEnabled}
                    onChange={(e) => setPushNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[#C8D7E9] bg-white">
                <div>
                  <p className="text-sm font-medium text-[#0A3161]">Email Notifications</p>
                  <p className="text-xs text-[#5671A6] mt-1">Send email notifications to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotificationsEnabled}
                    onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[#C8D7E9] bg-white">
                <div>
                  <p className="text-sm font-medium text-[#0A3161]">SMS Notifications</p>
                  <p className="text-xs text-[#5671A6] mt-1">Send SMS notifications to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsNotificationsEnabled}
                    onChange={(e) => setSmsNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-8">
            {/* <h2 className="text-sm font-semibold text-[#0A3161] mb-2">Security Settings</h2> */}

            {/* Password Policy */}
            {/* <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  Minimum Password Length <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="6"
                  max="20"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-[#2158A3]">Password Requirements</p>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#C8D7E9] bg-white">
                  <span className="text-sm text-[#0A3161]">Require Uppercase Letters</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireUppercase}
                      onChange={(e) => setRequireUppercase(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[#C8D7E9] bg-white">
                  <span className="text-sm text-[#0A3161]">Require Lowercase Letters</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireLowercase}
                      onChange={(e) => setRequireLowercase(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[#C8D7E9] bg-white">
                  <span className="text-sm text-[#0A3161]">Require Numbers</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireNumbers}
                      onChange={(e) => setRequireNumbers(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[#C8D7E9] bg-white">
                  <span className="text-sm text-[#0A3161]">Require Special Characters</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireSpecialChars}
                      onChange={(e) => setRequireSpecialChars(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A3161]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A3161]"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#2158A3]">
                  Session Timeout (minutes) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                />
              </div>
            </div> */}

            {/* Change Admin Password */}
            <div className="">
            {/* <div className="pt-6 border-t border-[#E0E7F5] space-y-4"> */}
              <h3 className="text-sm font-semibold text-[#0A3161]">Change Admin Password</h3>
              <p className="text-xs text-[#5671A6]">
                Update the password for your admin account. Make sure to choose a strong password that
                follows the policy above.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="text-xs font-medium text-[#2158A3]">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#2158A3]">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#2158A3]">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  className="bg-[#0A3161] hover:bg-[#0D3D7A] text-white font-medium px-6 gap-2"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-[#E0E7F5]">
          <Button
            type="button"
            onClick={handleSave}
            className="bg-[#0A3161] hover:bg-[#0D3D7A] text-white font-medium px-6 gap-2"
          >
            <FaSave className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
