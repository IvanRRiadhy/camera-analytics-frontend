import { useEffect, useRef, useState } from 'react';
import flvjs from 'flv.js';
import Hls from 'hls.js';

interface UniversalVideoPlayerProps {
  streamUrl: string;
  engineWsUrl?: string;
  style?: React.CSSProperties;
}

export default function UniversalVideoPlayer({ 
  streamUrl, 
  engineWsUrl = 'ws://192.168.1.195:8282',
  style
}: UniversalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<flvjs.Player | Hls | null>(null);
  const latencyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    setIsLoading(true);
    setError(null);

    const destroyPlayer = () => {
      if (latencyIntervalRef.current) {
        clearInterval(latencyIntervalRef.current);
        latencyIntervalRef.current = null;
      }
      
      if (playerRef.current) {
        if (playerRef.current instanceof Hls) {
          playerRef.current.destroy();
        } else {
          const flvPlayer = playerRef.current as flvjs.Player;
          flvPlayer.pause();
          flvPlayer.unload();
          flvPlayer.detachMediaElement();
          flvPlayer.destroy();
        }
        playerRef.current = null;
      }
    };

    destroyPlayer();

    const videoElement = videoRef.current;

    // RTSP / FLV Logic
    if (streamUrl.startsWith('rtsp://')) {
      if (!flvjs.isSupported()) {
        setError("FLV format is not supported in this browser.");
        setIsLoading(false);
        return;
      }
      
      const wsEndpoint = `${engineWsUrl}/?url=${encodeURIComponent(streamUrl)}`;
      
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        hasAudio: false,
        url: wsEndpoint
      }, {
        enableWorker: false,
        enableStashBuffer: false,
        stashInitialSize: 128,
        autoCleanupSourceBuffer: true
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
      const playPromise = flvPlayer.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((e: any) => console.log("Autoplay prevented:", e));
      }
      playerRef.current = flvPlayer;

      latencyIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.buffered.length > 0) {
          const end = videoRef.current.buffered.end(0);
          const current = videoRef.current.currentTime;
          if (end - current > 2) {
            videoRef.current.currentTime = end;
          }
        }
      }, 2000);

      flvPlayer.on(flvjs.Events.ERROR, (errType: string, errDetail: string) => {
        setError(`FLV.js Error: ${errType} - ${errDetail}`);
        setIsLoading(false);
      });
    } 
    // HLS Logic
    else if (streamUrl.includes('m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ debug: false, enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(e => console.log("Autoplay prevented:", e));
        });
        
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) {
            setError("HLS Error: " + data.type);
            setIsLoading(false);
          }
        });
        playerRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = streamUrl;
        videoElement.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        setError("Your browser does not support HLS video.");
        setIsLoading(false);
      }
    } else {
      // Fallback for HTTP snapshot stream or unsupported protocol
      setIsLoading(false);
    }

    const handlePlaying = () => setIsLoading(false);
    videoElement.addEventListener('playing', handlePlaying);

    return () => {
      videoElement.removeEventListener('playing', handlePlaying);
      destroyPlayer();
    };
  }, [streamUrl, engineWsUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black', borderRadius: '4px', overflow: 'hidden', ...style }}>
      <video 
        ref={videoRef} 
        style={{ width: '100%', height: '100%', objectFit: 'contain', outline: 'none' }} 
        controls 
        autoPlay 
        muted 
      />
      
      {isLoading && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
            <p style={{ fontSize: '11px', fontFamily: 'monospace' }}>Connecting RTSP Stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc', padding: '16px', textAlign: 'center', zIndex: 10 }}>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ef4444' }}>{error}</p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
