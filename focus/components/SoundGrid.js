function SoundGrid({ activeSounds, onSoundToggle }) {
  try {
    const sounds = [
      { id: 'rain', name: '雨声', icon: 'cloud-rain' },
      { id: 'ocean', name: '海浪', icon: 'waves' },
      { id: 'wind', name: '风声', icon: 'wind' },
      { id: 'fire', name: '壁炉', icon: 'flame' },
      { id: 'birds', name: '鸟鸣', icon: 'bird' },
      { id: 'cafe', name: '咖啡厅', icon: 'coffee' },
      { id: 'library', name: '图书馆', icon: 'book-open' },
      { id: 'white-noise', name: '白噪音', icon: 'radio' },
      { id: 'brown-noise', name: '棕噪音', icon: 'volume-2' }
    ];

    return (
      <div className="grid grid-cols-3 gap-2 md:gap-3" data-name="sound-grid" data-file="components/SoundGrid.js">
        {sounds.map((sound) => (
          <div
            key={sound.id}
            onClick={() => onSoundToggle(sound.id)}
            className={`sound-button ${activeSounds.has(sound.id) ? 'active' : ''}`}
          >
            <div className={`icon-${sound.icon} text-lg md:text-xl mb-1 md:mb-2 mx-auto`}></div>
            <div className="text-xs md:text-sm font-medium">{sound.name}</div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('SoundGrid component error:', error);
    return null;
  }
}