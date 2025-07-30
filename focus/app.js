class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = React.useState(false);
    const [activeSounds, setActiveSounds] = React.useState(new Set());
    const [showSettings, setShowSettings] = React.useState(false);
    const [settings, setSettings] = React.useState({
      workTime: 25,
      shortBreak: 5,
      longBreak: 15,
      volume: 0.5
    });

    const backgrounds = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
    ];
    const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

    // Background rotation effect
    React.useEffect(() => {
      const interval = setInterval(() => {
        setCurrentBgIndex(prev => (prev + 1) % backgrounds.length);
      }, 30000); // Change every 30 seconds
      return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
      const bgElement = document.querySelector('.background-image');
      if (bgElement) {
        bgElement.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
      }
    }, [currentBgIndex]);

    React.useEffect(() => {
      let interval = null;
      if (isRunning && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft(time => time - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setIsRunning(false);
        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYJGGS57eSZTgwOUarm7blmHgU6k9n0unAiBC13yO/eizEIHWq+7+OZURE');
        audio.play().catch(() => {}); // Ignore errors
      }
      return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
      setIsRunning(!isRunning);
    };

    const handleReset = () => {
      setIsRunning(false);
      setTimeLeft(settings.workTime * 60);
    };

    const handleSoundToggle = (soundId) => {
      const newActiveSounds = new Set(activeSounds);
      if (newActiveSounds.has(soundId)) {
        newActiveSounds.delete(soundId);
        audioManager.stopSound(soundId);
      } else {
        newActiveSounds.add(soundId);
        audioManager.playSound(soundId, settings.volume);
      }
      setActiveSounds(newActiveSounds);
    };

    const handleSettingsChange = (newSettings) => {
      setSettings(newSettings);
      if (!isRunning) {
        setTimeLeft(newSettings.workTime * 60);
      }
      // Update volume for all active sounds
      activeSounds.forEach(soundId => {
        audioManager.setVolume(soundId, newSettings.volume);
      });
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" data-name="app" data-file="app.js">
        <div className="glass-card p-4 md:p-8 w-full max-w-md text-center relative z-10">
          <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-shadow">番茄计时器</h1>
          
          <Timer 
            timeLeft={timeLeft}
            isRunning={isRunning}
            onStart={handleStart}
            onReset={handleReset}
            formatTime={formatTime}
          />
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text-secondary)]">环境音效</h3>
            <SoundGrid 
              activeSounds={activeSounds}
              onSoundToggle={handleSoundToggle}
            />
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="timer-button secondary mt-6"
          >
            设置
          </button>
          
          {showSettings && (
            <Settings 
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);