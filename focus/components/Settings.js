function Settings({ settings, onSettingsChange, onClose }) {
  try {
    const [localSettings, setLocalSettings] = React.useState(settings);

    const handleSave = () => {
      onSettingsChange(localSettings);
      onClose();
    };

    const handleChange = (key, value) => {
      setLocalSettings(prev => ({
        ...prev,
        [key]: value
      }));
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" data-name="settings" data-file="components/Settings.js">
        <div className="glass-card p-6 w-full max-w-sm relative z-[101]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">设置</h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white">
              <div className="icon-x text-xl"></div>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">工作时间 (分钟)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.workTime}
                onChange={(e) => handleChange('workTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">短休息 (分钟)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreak}
                onChange={(e) => handleChange('shortBreak', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">长休息 (分钟)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreak}
                onChange={(e) => handleChange('longBreak', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.volume}
                onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {Math.round(localSettings.volume * 100)}%
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="timer-button secondary flex-1">
              取消
            </button>
            <button onClick={handleSave} className="timer-button primary flex-1">
              保存
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Settings component error:', error);
    return null;
  }
}