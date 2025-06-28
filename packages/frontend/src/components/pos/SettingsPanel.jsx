import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Dialog, Toggle, Listbox } from '../ui';
import { CogIcon } from '@heroicons/react/24/outline';

const SettingsPanel = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState({
    taxEnabled: true,
    taxRate: 8,
    discountEnabled: true,
    receiptPrinting: true,
    soundEffects: false,
    darkMode: false,
    currency: 'USD',
    language: 'en',
    ...settings
  });

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  const handleToggleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings({
      taxEnabled: true,
      taxRate: 8,
      discountEnabled: true,
      receiptPrinting: true,
      soundEffects: false,
      darkMode: false,
      currency: 'USD',
      language: 'en'
    });
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="POS Settings" 
      size="md"
    >
      <div className="space-y-6">
        {/* Transaction Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Transaction Settings</h4>
          <div className="space-y-4">
            <Toggle
              enabled={localSettings.taxEnabled}
              onChange={(value) => handleToggleChange('taxEnabled', value)}
              label="Enable Tax Calculation"
              description="Automatically calculate tax on transactions"
            />
            
            <Toggle
              enabled={localSettings.discountEnabled}
              onChange={(value) => handleToggleChange('discountEnabled', value)}
              label="Enable Discounts"
              description="Allow discount application to items and transactions"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Listbox
                  value={localSettings.currency}
                  onChange={(value) => handleSelectChange('currency', value)}
                  options={currencyOptions}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={localSettings.taxRate}
                  onChange={(e) => handleSelectChange('taxRate', parseFloat(e.target.value))}
                  disabled={!localSettings.taxEnabled}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">System Settings</h4>
          <div className="space-y-4">
            <Toggle
              enabled={localSettings.receiptPrinting}
              onChange={(value) => handleToggleChange('receiptPrinting', value)}
              label="Auto-Print Receipts"
              description="Automatically print receipts after each transaction"
            />
            
            <Toggle
              enabled={localSettings.soundEffects}
              onChange={(value) => handleToggleChange('soundEffects', value)}
              label="Sound Effects"
              description="Play sounds for button clicks and notifications"
            />
            
            <Toggle
              enabled={localSettings.darkMode}
              onChange={(value) => handleToggleChange('darkMode', value)}
              label="Dark Mode"
              description="Use dark theme for the interface"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <Listbox
                value={localSettings.language}
                onChange={(value) => handleSelectChange('language', value)}
                options={languageOptions}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-6 flex justify-between">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
          >
            Reset to Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SettingsPanel;
