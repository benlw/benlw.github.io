function YouTubePlayer({ youtubeUrl, onUrlChange, volume, onClose }) {
  try {
    const [player, setPlayer] = React.useState(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMiniMode, setIsMiniMode] = React.useState(false);
    const playerRef = React.useRef(null);

    const extractVideoId = (url) => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const loadVideo = () => {
      const videoId = extractVideoId(youtubeUrl);
      if (videoId && player) {
        player.loadVideoById(videoId);
        player.setVolume(volume * 100);
      }
    };

    React.useEffect(() => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player('youtube-player', {
          height: isMiniMode ? '120' : '200',
          width: '100%',
          videoId: '',
          playerVars: {
            autoplay: 0,
            controls: 1,
            loop: 1,
            playlist: ''
          },
          events: {
            onReady: (event) => {
              setPlayer(event.target);
              event.target.setVolume(volume * 100);
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            }
          }
        });
      }
    }, [isMiniMode]);

    React.useEffect(() => {
      if (player) {
        player.setVolume(volume * 100);
      }
    }, [volume, player]);

    return (
      <div className={`fixed ${isMiniMode ? 'bottom-4 right-4 w-80' : 'inset-0'} ${isMiniMode ? '' : 'bg-black/50 flex items-center justify-center p-4'} z-[100]`} data-name="youtube-player" data-file="components/YouTubePlayer.js">
        <div className={`glass-card p-4 ${isMiniMode ? 'w-full' : 'w-full max-w-lg'} relative z-[101]`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${isMiniMode ? 'text-sm' : 'text-xl'} font-bold`}>YouTube 背景音乐</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsMiniMode(!isMiniMode)} 
                className="text-[var(--text-secondary)] hover:text-white"
                title={isMiniMode ? "展开" : "小窗模式"}
              >
                <div className={`icon-${isMiniMode ? 'maximize-2' : 'minimize-2'} text-lg`}></div>
              </button>
              <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white">
                <div className="icon-x text-lg"></div>
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {!isMiniMode && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube 链接</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="粘贴 YouTube 视频链接..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary-color)]"
                  />
                </div>
                
                <button
                  onClick={loadVideo}
                  className="timer-button primary w-full"
                  disabled={!youtubeUrl}
                >
                  播放视频
                </button>
              </>
            )}
            
            <div id="youtube-player" className={`rounded-lg overflow-hidden ${isMiniMode ? 'h-32' : ''}`}></div>
            
            {!isMiniMode && (
              <div className="text-xs text-[var(--text-secondary)]">
                提示：支持 YouTube 视频和播放列表链接
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('YouTubePlayer component error:', error);
    return null;
  }
}