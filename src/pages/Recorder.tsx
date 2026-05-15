import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mic, Square, Play, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import PageBackground from "@/components/PageBackground";
import { HubNavigation } from "@/components/HubNavigation";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const tickLevel = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    setLevel(Math.min(1, Math.sqrt(sum / data.length) * 2));
    rafRef.current = requestAnimationFrame(tickLevel);
  };

  const startRecording = async () => {
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      tickLevel();

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
      setIsRecording(true);
      toast.success("Recording started");
    } catch (err) {
      console.error(err);
      toast.error("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    stopAll();
    setIsRecording(false);
    setLevel(0);
    toast.success("Recording saved");
  };

  const discard = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setElapsed(0);
  };

  const download = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `stammerly-recording-${Date.now()}.webm`;
    a.click();
  };

  return (
    <>
      <PageBackground />
      <Helmet>
        <title>Recorder | Stammerly</title>
        <meta name="description" content="Record and review your speech practice with Stammerly's audio recorder." />
      </Helmet>
      <HubNavigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">Recorder</h1>
          <p className="text-muted-foreground mt-2">
            Capture a quick speech sample to review or share with your therapist.
          </p>
        </header>

        <Card className="backdrop-blur-md bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle>Audio capture</CardTitle>
            <CardDescription>
              Tap record, speak naturally, then stop to review your clip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div
                aria-hidden
                className="h-32 w-32 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center transition-transform"
                style={{ transform: `scale(${1 + level * 0.4})` }}
              >
                <Mic
                  className={`h-12 w-12 ${isRecording ? "text-destructive" : "text-primary"}`}
                  aria-label="Microphone"
                />
              </div>
              <div className="text-2xl font-mono tabular-nums" aria-live="polite">
                {formatTime(elapsed)}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {!isRecording ? (
                <Button size="lg" onClick={startRecording} className="gap-2">
                  <Mic className="h-4 w-4" /> Start recording
                </Button>
              ) : (
                <Button size="lg" variant="destructive" onClick={stopRecording} className="gap-2">
                  <Square className="h-4 w-4" /> Stop
                </Button>
              )}
            </div>

            {audioUrl && (
              <div className="space-y-3 rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Play className="h-4 w-4" /> Latest recording
                </div>
                <audio src={audioUrl} controls className="w-full" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={discard} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Discard
                  </Button>
                  <Button size="sm" onClick={download} className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </PageBackground>
  );
};

export default Recorder;
