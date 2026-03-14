import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AudioClipPlayerProps {
  audioFilePath: string;
  startTimeMs?: number;
  endTimeMs?: number;
  word?: string;
  disfluencyType?: string;
  severity?: string;
}

export function AudioClipPlayer({
  audioFilePath,
  startTimeMs,
  endTimeMs,
  word,
  disfluencyType,
  severity,
}: AudioClipPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSec = startTimeMs != null ? startTimeMs / 1000 : 0;
  const endSec = endTimeMs != null ? endTimeMs / 1000 : undefined;

  const fetchSignedUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: urlError } = await supabase.storage
        .from('session-audio')
        .createSignedUrl(audioFilePath, 60);

      if (urlError || !data?.signedUrl) {
        throw new Error('Could not access audio file');
      }
      setAudioUrl(data.signedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audio');
    } finally {
      setIsLoading(false);
    }
  }, [audioFilePath]);

  useEffect(() => {
    fetchSignedUrl();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchSignedUrl]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    audio.currentTime = startSec;
    audio.play();
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
      if (endSec && audioRef.current.currentTime >= endSec) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 50);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startSec;
    setCurrentTime(startSec);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
        if (endSec && audioRef.current.currentTime >= endSec) {
          audioRef.current.pause();
          setIsPlaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 50);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const severityColor = severity === 'severe' ? 'destructive' : severity === 'moderate' ? 'default' : 'secondary';

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
        <Volume2 className="w-4 h-4" />
        <span>{error}</span>
        <Button variant="ghost" size="sm" onClick={fetchSignedUrl}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
      {/* Context labels */}
      {(word || disfluencyType) && (
        <div className="flex flex-col gap-1 min-w-0">
          {word && <span className="text-sm font-medium text-foreground truncate">"{word}"</span>}
          <div className="flex gap-1">
            {disfluencyType && <Badge variant="outline" className="text-xs">{disfluencyType}</Badge>}
            {severity && <Badge variant={severityColor} className="text-xs">{severity}</Badge>}
          </div>
        </div>
      )}

      {/* Playback controls */}
      <div className="flex items-center gap-1 ml-auto">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePlay}
              disabled={!audioUrl}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRestart}
              disabled={!audioUrl}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>

      {/* Time indicator */}
      {startTimeMs != null && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {(startSec).toFixed(1)}s
          {endSec ? ` – ${endSec.toFixed(1)}s` : ''}
        </span>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          preload="auto"
        />
      )}
    </div>
  );
}
