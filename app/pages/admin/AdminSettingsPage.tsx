import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useSettings } from '../../hooks/useSettings.tsx';
import Card from '../../components/common/Card.tsx';
import Button from '../../components/common/Button.tsx';
import Input from '../../components/common/Input.tsx';
import Select from '../../components/common/Select.tsx';
import Alert from '../../components/common/Alert.tsx';
import { Settings, Globe, Palette, Building, Save } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const settingsContext = useSettings();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Default settings if context is not available
  const defaultSettings = {
    language: 'en' as const,
    theme: 'light' as const,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    appName: 'GovFlow'
  };

  const settings = settingsContext?.settings || defaultSettings;

  const [formData, setFormData] = useState({
    language: settings.language,
    theme: settings.theme,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    appName: settings.appName
  });

  // Office information (not part of AppSettings, stored separately)
  const [officeInfo, setOfficeInfo] = useState({
    officeName: 'Divisional Secretariat Office',
    officeAddress: '123 Main Street, Colombo',
    officePhone: '+94 11 2345678',
    officeEmail: 'office@divsec.gov.lk'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settingsContext) {
        await settingsContext.updateSettings(formData);
      }
      // Save office info to localStorage
      localStorage.setItem('govflow-office-info', JSON.stringify(officeInfo));
      setAlert({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      language: settings.language,
      theme: settings.theme,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      appName: settings.appName
    });
    setOfficeInfo({
      officeName: 'Divisional Secretariat Office',
      officeAddress: '123 Main Street, Colombo',
      officePhone: '+94 11 2345678',
      officeEmail: 'office@divsec.gov.lk'
    });
    setAlert({ type: 'success', message: 'Settings reset to current values.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
          <Button onClick={handleSave} variant="primary" isLoading={isSaving}>
            <Save size={16} className="mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language & Theme Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Language & Theme</h3>
          </div>
          
          <div className="space-y-4">
            <Select
              label="Language"
              value={formData.language}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, language: e.target.value as 'en' | 'si' | 'ta' })}
              options={[
                { value: 'en', label: 'English' },
                { value: 'si', label: 'සිංහල' },
                { value: 'ta', label: 'தமிழ்' }
              ]}
            />
            
            <Select
              label="Theme"
              value={formData.theme}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' | 'auto' })}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' }
              ]}
            />
            
            <Select
              label="Primary Color"
              value={formData.primaryColor}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, primaryColor: e.target.value })}
              options={[
                { value: '#2563eb', label: 'Blue' },
                { value: '#059669', label: 'Green' },
                { value: '#7c3aed', label: 'Purple' },
                { value: '#dc2626', label: 'Red' },
                { value: '#ea580c', label: 'Orange' }
              ]}
            />
          </div>
        </Card>

        {/* Office Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Office Information</h3>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Office Name"
              value={officeInfo.officeName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficeInfo({ ...officeInfo, officeName: e.target.value })}
              placeholder="Enter office name"
            />
            
            <Input
              label="Office Address"
              value={officeInfo.officeAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficeInfo({ ...officeInfo, officeAddress: e.target.value })}
              placeholder="Enter office address"
            />
            
            <Input
              label="Office Phone"
              type="tel"
              value={officeInfo.officePhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficeInfo({ ...officeInfo, officePhone: e.target.value })}
              placeholder="Enter office phone number"
            />
            
            <Input
              label="Office Email"
              type="email"
              value={officeInfo.officeEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficeInfo({ ...officeInfo, officeEmail: e.target.value })}
              placeholder="Enter office email"
            />
          </div>
        </Card>
      </div>

      {/* System Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-primary" />
          <h3 className="text-lg font-semibold">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700">System Version</h4>
            <p className="text-lg font-semibold text-gray-900">1.0.0</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700">Database Status</h4>
            <p className="text-lg font-semibold text-green-600">Connected</p>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Settings Preview</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Language:</span>
              <p className="text-gray-900">{formData.language === 'en' ? 'English' : formData.language === 'si' ? 'සිංහල' : 'தமிழ்'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Theme:</span>
              <p className="text-gray-900">{formData.theme}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Primary Color:</span>
              <p className="text-gray-900">{formData.primaryColor}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Office:</span>
              <p className="text-gray-900">{officeInfo.officeName}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage; 