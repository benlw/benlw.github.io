const audioManager = {
  sounds: {},
  
  // Sound URLs - using placeholder URLs that would work with actual audio files
  soundUrls: {
    'rain': 'https://www.soundjay.com/misc/sounds/rain-01.wav',
    'heavy-rain': 'https://www.soundjay.com/misc/sounds/rain-02.wav',
    'ocean': 'https://www.soundjay.com/misc/sounds/ocean-01.wav',
    'wind': 'https://www.soundjay.com/misc/sounds/wind-01.wav',
    'stream': 'https://www.soundjay.com/misc/sounds/stream-01.wav',
    'fire': 'https://www.soundjay.com/misc/sounds/fire-01.wav',
    'birds': 'https://www.soundjay.com/misc/sounds/birds-01.wav',
    'owl': 'https://www.soundjay.com/misc/sounds/owl-01.wav',
    'night-birds': 'https://www.soundjay.com/misc/sounds/night-birds-01.wav',
    'cafe': 'https://www.soundjay.com/misc/sounds/cafe-01.wav',
    'library': 'https://www.soundjay.com/misc/sounds/library-01.wav',
    'white-noise': 'https://www.soundjay.com/misc/sounds/white-noise-01.wav'
  },

  playSound(soundId, volume = 0.5) {
    try {
      if (this.sounds[soundId]) {
        this.sounds[soundId].pause();
      }
      
      // Create a simple oscillator for demo purposes since we can't load external audio files
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Different frequencies for different sounds to simulate variety
      const frequencies = {
        'rain': 200,
        'heavy-rain': 150,
        'ocean': 100,
        'wind': 300,
        'stream': 400,
        'fire': 80,
        'birds': 800,
        'owl': 600,
        'night-birds': 900,
        'cafe': 250,
        'library': 50,
        'white-noise': 440
      };
      
      oscillator.frequency.setValueAtTime(frequencies[soundId] || 200, audioContext.currentTime);
      oscillator.type = soundId === 'white-noise' ? 'sawtooth' : 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime); // Very low volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      this.sounds[soundId] = {
        oscillator,
        gainNode,
        audioContext,
        stop: () => {
          oscillator.stop();
          audioContext.close();
        },
        setVolume: (vol) => {
          gainNode.gain.setValueAtTime(vol * 0.1, audioContext.currentTime);
        }
      };
      
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  },

  stopSound(soundId) {
    try {
      if (this.sounds[soundId]) {
        this.sounds[soundId].stop();
        delete this.sounds[soundId];
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  },

  setVolume(soundId, volume) {
    try {
      if (this.sounds[soundId] && this.sounds[soundId].setVolume) {
        this.sounds[soundId].setVolume(volume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  },

  stopAllSounds() {
    try {
      Object.keys(this.sounds).forEach(soundId => {
        this.stopSound(soundId);
      });
    } catch (error) {
      console.error('Error stopping all sounds:', error);
    }
  }
};