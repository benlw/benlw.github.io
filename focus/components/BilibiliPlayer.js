function BilibiliPlayer({ bilibiliUrl, onUrlChange, volume, onClose }) {
  try {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMiniMode, setIsMiniMode] = React.useState(false);
    const [embedUrl, setEmbedUrl] = React.useState('');

    const extractBilibiliId = (url) => {
      // Extract BV id from various Bilibili URL formats
      const patterns = [
        /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
        /bilibili\.com\/video\/(av\d+)/,
        /b23\.tv\/([a-zA-Z0-9]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const loadVideo = () => {
      const videoId = extractBilibiliId(bilibiliUrl);
      if (videoId) {
        // Create embed URL for Bilibili
        const embedUrl = `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=0&muted=0&loop=1`;
        setEmbedUrl(embedUrl);
      }
    };

    const togglePlay = () => {
      const iframe = document.getElementById('bilibili-player');
      if (iframe) {
        // Send message to iframe to control playback
        const message = isPlaying ? 'pause' : 'play';
        iframe.contentWindow.postMessage(message, '*');
        setIsPlaying(!isPlaying);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" data-name="bilibili-player" data-file="components/BilibiliPlayer.js">
        <div className="glass-card p-6 w-full max-w-lg relative z-[101]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Bilibili 背景音乐</h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white">
              <div className="icon-x text-xl"></div>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bilibili 链接</label>
              <input
                type="text"
                value={bilibiliUrl}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="粘贴 Bilibili 视频链接..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary-color)]"
              />
            </div>
            
            <button
              onClick={loadVideo}
              className="timer-button primary w-full"
              disabled={!bilibiliUrl}
            >
              加载视频
            </button>
            
            {embedUrl && (
              <div className="space-y-3">
                <iframe
                  id="bilibili-player"
                  src={embedUrl}
                  width="100%"
                  height={isMiniMode ? "120" : "200"}
                  frameBorder="0"
                  allowFullScreen
                  className="rounded-lg w-full"
                  style={{
                    minHeight: isMiniMode ? '120px' : '200px',
                    maxWidth: '100%'
                  }}
                ></iframe>
                
                <div className="flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="timer-button secondary flex-1"
                  >
                    {isPlaying ? '暂停' : '播放'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-xs text-[var(--text-secondary)]">
              <p