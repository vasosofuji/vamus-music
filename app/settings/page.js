'use client';

import { useTheme } from '@/app/context/ThemeContext';
import './settings.css';

export default function SettingsPage() {
  const { theme, changeTheme, defaultTheme } = useTheme();

  const handleColorChange = (key, value) => {
    changeTheme({ ...theme, [key]: value });
  };

  return (
    <div className="settings-page animate-fade-up">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your Vamus experience</p>
      </div>

      <section className="settings-section">
        <h2>App Theme</h2>
        <p className="settings-desc">Choose how Vamus looks for you.</p>
        
        <div className="color-pickers-container">
          <label className="color-picker-label">
            Background Color
            <div className="color-input-wrapper">
              <input type="color" value={theme.bg || '#000000'} onChange={(e) => handleColorChange('bg', e.target.value)} />
            </div>
          </label>
          <label className="color-picker-label">
            Surface Color
            <div className="color-input-wrapper">
              <input type="color" value={theme.surface || '#121212'} onChange={(e) => handleColorChange('surface', e.target.value)} />
            </div>
          </label>
          <label className="color-picker-label">
            Primary Accent
            <div className="color-input-wrapper">
              <input type="color" value={theme.primary || '#1ed760'} onChange={(e) => handleColorChange('primary', e.target.value)} />
            </div>
          </label>
          <label className="color-picker-label">
            Text Color
            <div className="color-input-wrapper">
              <input type="color" value={theme.text || '#ffffff'} onChange={(e) => handleColorChange('text', e.target.value)} />
            </div>
          </label>
          
          <button 
            className="action-btn secondary settings-reset-btn" 
            onClick={() => changeTheme(defaultTheme)}
          >
            Reset to Defaults
          </button>
        </div>

        <div className="live-preview-container" style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.surface}` }}>
          <h3 className="live-preview-title">Live Preview</h3>
          <div className="live-preview-surface" style={{ backgroundColor: theme.surface }}>
            <p>This is a surface element.</p>
            <button className="live-preview-btn" style={{ backgroundColor: theme.primary, color: '#000' }}>
              Primary Button
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
