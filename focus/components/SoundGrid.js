function SoundGrid({ activeSounds, onSoundToggle }) {
  try {
    const sounds = [
      { id: 'rain', name: '雨声', icon: 'cloud-rain' },
      { id: 'heavy-rain', name: '下雨', icon: 'cloud-drizzle' },
      { id: 'ocean', name: '海浪', icon: 'waves' },
      { id: 'wind', name: '风声', icon: 'wind' },
      { id: 'stream', name: '小溪', icon: 'waves' },
      { id: 'fire', name: '火炉', icon: 'flame' },
      { id: 'birds', name: '鸟叫', icon: 'bird' },
      { id: 'owl', name: '知更鸟', icon: 'bird' },
      { id: 'night-birds', name: '鸟鸣', icon: 'twitter' },
      { id: 'cafe', name: '咖啡厅', icon: 'coffee' },
      { id: 'library', name: '图书馆', icon: 'book-open' },
      { id: 'white-noise', name: '白噪音', icon: 'radio' }
    ];

    return (
      <div className="grid grid-cols-3 gap-3" data-name="sound-grid" data-file="components/SoundGrid.js">
        {sounds.map((sound) => (
          <div
            key={sound.id}
            onClick={() => onSoundToggle(sound.id)}
            className={`sound-button ${activeSounds.has(sound.id) ? 'active' : ''}`}
          >
            <div className={`icon-${sound.icon} text-xl mb-2 mx-auto`}></div>
            <div className="text-sm font-medium">{sound.name}</div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('SoundGrid component error:', error);
    return null;
  }
}