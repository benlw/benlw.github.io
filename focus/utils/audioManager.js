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
        this.sounds[soundId].stop();
      }
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = audioContext.createGain();
      
      // Create more realistic ambient sounds using multiple oscillators and noise
      let soundNodes = [];
      
      if (soundId === 'rain') {
        // Realistic rain with multiple frequency layers
        const createRainLayer = (frequency, qValue) => {
          const bufferSize = 8192;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          
          // Generate pink noise for more natural rain sound
          let b0, b1, b2, b3, b4, b5, b6;
          b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          }
          
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
          filter.Q.setValueAtTime(qValue, audioContext.currentTime);
          
          source.connect(filter);
          filter.connect(gainNode);
          source.start();
          return source;
        };
        
        // Layer multiple frequencies for realistic rain
        soundNodes.push(createRainLayer(1200, 0.7)); // High frequency droplets
        soundNodes.push(createRainLayer(600, 0.5));  // Medium rain
        soundNodes.push(createRainLayer(300, 0.3));  // Low rumble
        
      } else if (soundId === 'ocean') {
        // Ocean with wave patterns and foam
        const createOceanWave = () => {
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const lfo = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();
          
          // Main wave oscillators
          osc1.frequency.setValueAtTime(60, audioContext.currentTime);
          osc2.frequency.setValueAtTime(90, audioContext.currentTime);
          osc1.type = 'sine';
          osc2.type = 'triangle';
          
          // LFO for wave movement
          lfo.frequency.setValueAtTime(0.1, audioContext.currentTime);
          lfo.type = 'sine';
          lfoGain.gain.setValueAtTime(20, audioContext.currentTime);
          
          lfo.connect(lfoGain);
          lfoGain.connect(osc1.frequency);
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(200, audioContext.currentTime);
          filter.Q.setValueAtTime(1, audioContext.currentTime);
          
          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gainNode);
          
          osc1.start();
          osc2.start();
          lfo.start();
          
          return [osc1, osc2, lfo];
        };
        
        // Add foam noise
        const bufferSize = 4096;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const foam = audioContext.createBufferSource();
        foam.buffer = buffer;
        foam.loop = true;
        
        const foamFilter = audioContext.createBiquadFilter();
        foamFilter.type = 'highpass';
        foamFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        foam.connect(foamFilter);
        foamFilter.connect(gainNode);
        foam.start();
        
        soundNodes.push(...createOceanWave(), foam);
        
      } else if (soundId === 'wind') {
        // Layered wind with gusts
        const createWindLayer = (baseFreq, variation) => {
          const bufferSize = 8192;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          
          // Generate wind-like noise
          let lastValue = 0;
          for (let i = 0; i < bufferSize; i++) {
            const random = Math.random() * 2 - 1;
            lastValue = (lastValue * 0.99) + (random * 0.01);
            data[i] = lastValue;
          }
          
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
          filter.Q.setValueAtTime(0.3, audioContext.currentTime);
          
          // Add variation with LFO
          const lfo = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();
          lfo.frequency.setValueAtTime(0.05, audioContext.currentTime);
          lfo.type = 'sine';
          lfoGain.gain.setValueAtTime(variation, audioContext.currentTime);
          
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          source.connect(filter);
          filter.connect(gainNode);
          source.start();
          lfo.start();
          
          return [source, lfo];
        };
        
        soundNodes.push(...createWindLayer(800, 200));  // High wind
        soundNodes.push(...createWindLayer(400, 100));  // Medium wind
        soundNodes.push(...createWindLayer(150, 50));   // Low wind
        
      } else if (soundId === 'fire') {
        // Crackling fire with multiple elements
        const createCrackle = () => {
          const bufferSize = 2048;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          
          for (let i = 0; i < bufferSize; i++) {
            // Create crackling pattern
            const intensity = Math.pow(Math.random(), 4);
            const crackle = (Math.random() * 2 - 1) * intensity;
            data[i] = crackle * 0.3;
          }
          
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(300 + Math.random() * 400, audioContext.currentTime);
          filter.Q.setValueAtTime(0.8, audioContext.currentTime);
          
          source.connect(filter);
          filter.connect(gainNode);
          source.start();
          
          return source;
        };
        
        // Create base fire rumble
        const baseOsc = audioContext.createOscillator();
        baseOsc.frequency.setValueAtTime(80, audioContext.currentTime);
        baseOsc.type = 'triangle';
        
        const baseFilter = audioContext.createBiquadFilter();
        baseFilter.type = 'lowpass';
        baseFilter.frequency.setValueAtTime(200, audioContext.currentTime);
        
        baseOsc.connect(baseFilter);
        baseFilter.connect(gainNode);
        baseOsc.start();
        
        // Add multiple crackle layers
        soundNodes.push(baseOsc);
        soundNodes.push(createCrackle());
        soundNodes.push(createCrackle());
        
      } else if (soundId === 'white-noise') {
        // White noise
        const bufferSize = 4096;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gainNode);
        whiteNoise.start();
        soundNodes.push(whiteNoise);
        
      } else if (soundId === 'brown-noise') {
        // Brown noise (lower frequency)
        const bufferSize = 4096;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
        const brownNoise = audioContext.createBufferSource();
        brownNoise.buffer = buffer;
        brownNoise.loop = true;
        brownNoise.connect(gainNode);
        brownNoise.start();
        soundNodes.push(brownNoise);
        
      } else if (soundId === 'birds') {
        // Gentle bird ambience with random chirps
        const createBirdChirp = (baseFreq, variation) => {
          const osc = audioContext.createOscillator();
          const chirpGain = audioContext.createGain();
          
          osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
          osc.type = 'sine';
          
          // Random chirp pattern
          const chirpPattern = () => {
            const now = audioContext.currentTime;
            chirpGain.gain.setValueAtTime(0, now);
            chirpGain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            chirpGain.gain.linearRampToValueAtTime(0, now + 0.2);
            
            setTimeout(chirpPattern, Math.random() * 3000 + 1000);
          };
          
          setTimeout(chirpPattern, Math.random() * 2000);
          
          osc.connect(chirpGain);
          chirpGain.connect(gainNode);
          osc.start();
          
          return osc;
        };
        
        soundNodes.push(createBirdChirp(800, 200));
        soundNodes.push(createBirdChirp(1200, 300));
        soundNodes.push(createBirdChirp(600, 150));
        
      } else if (soundId === 'cafe') {
        // Cafe ambience with subtle chatter and background
        const bufferSize = 8192;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate cafe-like background murmur
        for (let i = 0; i < bufferSize; i++) {
          const base = Math.sin(i * 0.01) * 0.1;
          const chatter = Math.random() * 0.05 - 0.025;
          data[i] = base + chatter;
        }
        
        const cafeNoise = audioContext.createBufferSource();
        cafeNoise.buffer = buffer;
        cafeNoise.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, audioContext.currentTime);
        
        cafeNoise.connect(filter);
        filter.connect(gainNode);
        cafeNoise.start();
        
        soundNodes.push(cafeNoise);
        
      } else if (soundId === 'library') {
        // Very subtle library ambience
        const osc = audioContext.createOscillator();
        osc.frequency.setValueAtTime(60, audioContext.currentTime);
        osc.type = 'sine';
        
        const libraryFilter = audioContext.createBiquadFilter();
        libraryFilter.type = 'lowpass';
        libraryFilter.frequency.setValueAtTime(100, audioContext.currentTime);
        
        osc.connect(libraryFilter);
        libraryFilter.connect(gainNode);
        osc.start();
        
        soundNodes.push(osc);
        
      } else {
        // Default fallback
        const osc = audioContext.createOscillator();
        osc.frequency.setValueAtTime(200, audioContext.currentTime);
        osc.type = 'sine';
        osc.connect(gainNode);
        osc.start();
        soundNodes.push(osc);
      }
      
      gainNode.gain.setValueAtTime(volume * 0.08, audioContext.currentTime);
      gainNode.connect(audioContext.destination);
      
      this.sounds[soundId] = {
        soundNodes,
        gainNode,
        audioContext,
        stop: () => {
          soundNodes.forEach(node => {
            if (node.stop) node.stop();
          });
          audioContext.close();
        },
        setVolume: (vol) => {
          gainNode.gain.setValueAtTime(vol * 0.15, audioContext.currentTime);
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