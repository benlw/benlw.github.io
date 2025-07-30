function Timer({ timeLeft, isRunning, onStart, onReset, formatTime }) {
  try {
    return (
      <div data-name="timer" data-file="components/Timer.js">
        <div className="text-4xl md:text-6xl font-mono font-bold mb-4 md:mb-6 text-shadow">
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-[var(--text-secondary)] mb-6 md:mb-8">
          {isRunning ? '保持专注' : '准备开始'}
        </div>
        
        <div className="flex gap-3 md:gap-4 justify-center">
          <button
            onClick={onStart}
            className="timer-button primary flex items-center gap-2"
          >
            <div className={`icon-${isRunning ? 'pause' : 'play'} text-lg`}></div>
            {isRunning ? '暂停' : '开始'}
          </button>
          
          <button
            onClick={onReset}
            className="timer-button secondary flex items-center gap-2"
          >
            <div className="icon-rotate-ccw text-lg"></div>
            重置
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Timer component error:', error);
    return null;
  }
}