import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Save, RefreshCw, Bell, Shield, User, Globe, Database, Mail } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Checkbox from './Checkbox';
import Textarea from './Textarea';
import Badge from './Badge';

interface SystemSettings {
  appLogo: any;
  favicon: any;
  footerText: string;
  primaryColor: string | number | readonly string[] | undefined;
  secondaryColor: string | number | readonly string[] | undefined;
  accentColor: string | number | readonly string[] | undefined;
  appName: string | number | readonly string[] | undefined;
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    dateFormat: string;
    language: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    emailServer: string;
    smsProvider: string;
    notificationTemplates: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: boolean;
    ipWhitelist: string[];
    auditLogging: boolean;
  };
  workflow: {
    autoAssignment: boolean;
    defaultPriority: string;
    escalationEnabled: boolean;
    escalationTime: number;
    reminderEnabled: boolean;
    reminderInterval: number;
  };
  documents: {
    maxFileSize: number;
    allowedFormats: string[];
    storageProvider: string;
    retentionPeriod: number;
    compressionEnabled: boolean;
  };
}

interface SettingsManagerProps {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => Promise<void>;
  onReset: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onSave,
  onReset,
  loading = false,
  readOnly = false
}) => {
  const [currentSettings, setCurrentSettings] = useState<SystemSettings>(settings);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const { i18n } = useTranslation();

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'workflow', label: 'Workflow', icon: User },
    { id: 'documents', label: 'Documents', icon: Database }
  ];

  const timezones = [
    { value: 'Asia/Colombo', label: 'Asia/Colombo (UTC+5:30)' },
    { value: 'UTC', label: 'UTC (UTC+0)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
    { value: 'Europe/London', label: 'Europe/London (UTC+0)' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'si', label: 'Sinhala' },
    { value: 'ta', label: 'Tamil' }
  ];

  const smsProviders = [
    { value: 'dialog', label: 'Dialog' },
    { value: 'mobitel', label: 'Mobitel' },
    { value: 'etisalat', label: 'Etisalat' },
    { value: 'airtel', label: 'Airtel' }
  ];

  const storageProviders = [
    { value: 'local', label: 'Local Storage' },
    { value: 's3', label: 'Amazon S3' },
    { value: 'gcs', label: 'Google Cloud Storage' },
    { value: 'azure', label: 'Azure Blob Storage' }
  ];

  const fileFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'txt', label: 'TXT' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [section]: {
        ...((prev[section] as any)),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedSettingChange = (section: keyof SystemSettings, parentKey: string, key: string, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [section]: {
        ...((prev[section] as any)),
        [parentKey]: {
          ...((prev[section] as any)[parentKey]),
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(currentSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setCurrentSettings(settings);
    setHasChanges(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
          <Input
            value={currentSettings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
          <Input
            value={currentSettings.general.siteDescription}
            onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <Select
            value={currentSettings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            options={timezones}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
          <Select
            value={currentSettings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            options={dateFormats}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <Select
            value={currentSettings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            options={languages}
            disabled={readOnly}
          />
        </div>
      </div>

      <div>
        <Checkbox
          label="Maintenance Mode"
          checked={currentSettings.general.maintenanceMode}
          onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
          disabled={readOnly}
        />
        <p className="text-sm text-gray-500 mt-1">
          When enabled, only administrators can access the system
        </p>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Checkbox
            label="Email Notifications"
            checked={currentSettings.notifications.emailEnabled}
            onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
            disabled={readOnly}
          />
        </div>
        <div>
          <Checkbox
            label="SMS Notifications"
            checked={currentSettings.notifications.smsEnabled}
            onChange={(e) => handleSettingChange('notifications', 'smsEnabled', e.target.checked)}
            disabled={readOnly}
          />
        </div>
        <div>
          <Checkbox
            label="In-App Notifications"
            checked={currentSettings.notifications.inAppEnabled}
            onChange={(e) => handleSettingChange('notifications', 'inAppEnabled', e.target.checked)}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Server</label>
          <Input
            value={currentSettings.notifications.emailServer}
            onChange={(e) => handleSettingChange('notifications', 'emailServer', e.target.value)}
            placeholder="smtp.example.com"
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMS Provider</label>
          <Select
            value={currentSettings.notifications.smsProvider}
            onChange={(e) => handleSettingChange('notifications', 'smsProvider', e.target.value)}
            options={smsProviders}
            disabled={readOnly}
          />
        </div>
      </div>

      <div>
        <Checkbox
          label="Enable Notification Templates"
          checked={currentSettings.notifications.notificationTemplates}
          onChange={(e) => handleSettingChange('notifications', 'notificationTemplates', e.target.checked)}
          disabled={readOnly}
        />
        <p className="text-sm text-gray-500 mt-1">
          Allow customization of notification messages
        </p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
        <Input
          type="number"
          value={currentSettings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          min="5"
          max="1440"
          disabled={readOnly}
        />
      </div>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Password Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
            <Input
              type="number"
              value={currentSettings.security.passwordPolicy.minLength}
              onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
              min="6"
              max="50"
              disabled={readOnly}
            />
          </div>
          <div className="space-y-3">
            <Checkbox
              label="Require Uppercase Letters"
              checked={currentSettings.security.passwordPolicy.requireUppercase}
              onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
              disabled={readOnly}
            />
            <Checkbox
              label="Require Lowercase Letters"
              checked={currentSettings.security.passwordPolicy.requireLowercase}
              onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
              disabled={readOnly}
            />
            <Checkbox
              label="Require Numbers"
              checked={currentSettings.security.passwordPolicy.requireNumbers}
              onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
              disabled={readOnly}
            />
            <Checkbox
              label="Require Special Characters"
              checked={currentSettings.security.passwordPolicy.requireSpecialChars}
              onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Additional Security</h4>
        <div className="space-y-4">
          <Checkbox
            label="Two-Factor Authentication"
            checked={currentSettings.security.twoFactorAuth}
            onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            disabled={readOnly}
          />
          <Checkbox
            label="Audit Logging"
            checked={currentSettings.security.auditLogging}
            onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );

  const renderWorkflowSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Checkbox
            label="Auto Assignment"
            checked={currentSettings.workflow.autoAssignment}
            onChange={(e) => handleSettingChange('workflow', 'autoAssignment', e.target.checked)}
            disabled={readOnly}
          />
          <p className="text-sm text-gray-500 mt-1">
            Automatically assign tasks to available officers
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Priority</label>
          <Select
            value={currentSettings.workflow.defaultPriority}
            onChange={(e) => handleSettingChange('workflow', 'defaultPriority', e.target.value)}
            options={priorities}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Escalation Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Checkbox
              label="Enable Escalation"
              checked={currentSettings.workflow.escalationEnabled}
              onChange={(e) => handleSettingChange('workflow', 'escalationEnabled', e.target.checked)}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Time (hours)</label>
            <Input
              type="number"
              value={currentSettings.workflow.escalationTime}
              onChange={(e) => handleSettingChange('workflow', 'escalationTime', parseInt(e.target.value))}
              min="1"
              max="168"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Reminder Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Checkbox
              label="Enable Reminders"
              checked={currentSettings.workflow.reminderEnabled}
              onChange={(e) => handleSettingChange('workflow', 'reminderEnabled', e.target.checked)}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Interval (hours)</label>
            <Input
              type="number"
              value={currentSettings.workflow.reminderInterval}
              onChange={(e) => handleSettingChange('workflow', 'reminderInterval', parseInt(e.target.value))}
              min="1"
              max="72"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
          <Input
            type="number"
            value={currentSettings.documents.maxFileSize}
            onChange={(e) => handleSettingChange('documents', 'maxFileSize', parseInt(e.target.value))}
            min="1"
            max="100"
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Provider</label>
          <Select
            value={currentSettings.documents.storageProvider}
            onChange={(e) => handleSettingChange('documents', 'storageProvider', e.target.value)}
            options={storageProviders}
            disabled={readOnly}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Formats</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {fileFormats.map(format => (
            <Checkbox
              key={format.value}
              label={format.label}
              checked={currentSettings.documents.allowedFormats.includes(format.value)}
              onChange={(e) => {
                const newFormats = e.target.checked
                  ? [...currentSettings.documents.allowedFormats, format.value]
                  : currentSettings.documents.allowedFormats.filter(f => f !== format.value);
                handleSettingChange('documents', 'allowedFormats', newFormats);
              }}
              disabled={readOnly}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (days)</label>
          <Input
            type="number"
            value={currentSettings.documents.retentionPeriod}
            onChange={(e) => handleSettingChange('documents', 'retentionPeriod', parseInt(e.target.value))}
            min="1"
            max="3650"
            disabled={readOnly}
          />
        </div>
        <div>
          <Checkbox
            label="Enable Compression"
            checked={currentSettings.documents.compressionEnabled}
            onChange={(e) => handleSettingChange('documents', 'compressionEnabled', e.target.checked)}
            disabled={readOnly}
          />
          <p className="text-sm text-gray-500 mt-1">
            Compress documents to save storage space
          </p>
        </div>
      </div>
    </div>
  );

  const renderBrandingSettings = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
            <Input
              value={currentSettings.appName}
              onChange={e => {
                setCurrentSettings(prev => ({ ...prev, appName: e.target.value }));
                setHasChanges(true);
              }}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setCurrentSettings(prev => ({ ...prev, appLogo: ev.target?.result as string }));
                    setHasChanges(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              disabled={readOnly}
            />
            {currentSettings.appLogo && (
              <img src={currentSettings.appLogo} alt="App Logo" className="mt-2 h-12" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
            <input
              type="file"
              accept="image/x-icon,image/png,image/svg+xml"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setCurrentSettings(prev => ({ ...prev, favicon: ev.target?.result as string }));
                    setHasChanges(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              disabled={readOnly}
            />
            {currentSettings.favicon && (
              <img src={currentSettings.favicon} alt="Favicon" className="mt-2 h-8 w-8" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <Input
              value={currentSettings.footerText || ''}
              onChange={e => {
                setCurrentSettings(prev => ({ ...prev, footerText: e.target.value }));
                setHasChanges(true);
              }}
              disabled={readOnly}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <input
              type="color"
              value={typeof currentSettings.primaryColor === 'string' ? currentSettings.primaryColor : '#2563eb'}
              onChange={e => {
                setCurrentSettings(prev => ({ ...prev, primaryColor: e.target.value }));
                setHasChanges(true);
              }}
              className="w-12 h-8 p-0 border-none bg-transparent"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
            <input
              type="color"
              value={typeof currentSettings.secondaryColor === 'string' ? currentSettings.secondaryColor : '#64748b'}
              onChange={e => {
                setCurrentSettings(prev => ({ ...prev, secondaryColor: e.target.value }));
                setHasChanges(true);
              }}
              className="w-12 h-8 p-0 border-none bg-transparent"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
            <input
              type="color"
              value={typeof currentSettings.accentColor === 'string' ? currentSettings.accentColor : '#f59e0b'}
              onChange={e => {
                setCurrentSettings(prev => ({ ...prev, accentColor: e.target.value }));
                setHasChanges(true);
              }}
              className="w-12 h-8 p-0 border-none bg-transparent"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'workflow':
        return renderWorkflowSettings();
      case 'documents':
        return renderDocumentSettings();
      case 'branding':
        return renderBrandingSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="warning" size="sm">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || loading || readOnly}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default SettingsManager; 