import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Headphones, Play, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AudioClipPlayer } from './AudioClipPlayer';

interface DisfluencyEvent {
  id: string;
  word: string;
  disfluencyType: string;
  disfluencyCategory: string;
  severity: string;
  timestampInSession: number | null;
  durationMs: number | null;
  phoneme: string | null;
  sessionId: string;
  audioFilePath: string | null;
  sessionDate: string;
  exerciseName: string;
}

interface DisfluencyAuditLogProps {
  patientId: string;
}

export function DisfluencyAuditLog({ patientId }: DisfluencyAuditLogProps) {
  const [events, setEvents] = useState<DisfluencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DisfluencyEvent | null>(null);

  useEffect(() => {
    if (!patientId || patientId === 'all') {
      setEvents([]);
      setLoading(false);
      return;
    }
    fetchDisfluencyEvents();
  }, [patientId]);

  const fetchDisfluencyEvents = async () => {
    setLoading(true);
    try {
      // Fetch disfluency logs with session info
      const { data: logs, error: logsError } = await supabase
        .from('disfluency_logs')
        .select('*')
        .eq('user_id', patientId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      if (!logs || logs.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      // Get unique session IDs to fetch audio paths
      const sessionIds = [...new Set(logs.map(l => l.session_id).filter(Boolean))] as string[];
      
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('id, audio_file_path, session_date, exercise_name')
        .in('id', sessionIds);

      const sessionMap = new Map(
        sessions?.map(s => [s.id, { audioFilePath: s.audio_file_path, sessionDate: s.session_date, exerciseName: s.exercise_name }]) || []
      );

      const mapped: DisfluencyEvent[] = logs.map(log => {
        const session = log.session_id ? sessionMap.get(log.session_id) : null;
        return {
          id: log.id,
          word: log.word,
          disfluencyType: log.disfluency_type,
          disfluencyCategory: log.disfluency_category,
          severity: log.severity || 'mild',
          timestampInSession: log.timestamp_in_session ? Number(log.timestamp_in_session) * 1000 : null,
          durationMs: log.duration_ms ? Number(log.duration_ms) : null,
          phoneme: log.phoneme,
          sessionId: log.session_id || '',
          audioFilePath: session?.audioFilePath || null,
          sessionDate: session?.sessionDate || log.created_at,
          exerciseName: session?.exerciseName || 'Unknown',
        };
      });

      setEvents(mapped);
    } catch (err) {
      console.error('Failed to fetch disfluency events:', err);
    } finally {
      setLoading(false);
    }
  };

  const severityBadge = (severity: string) => {
    const variant = severity === 'severe' ? 'destructive' : severity === 'moderate' ? 'default' : 'secondary';
    return <Badge variant={variant} className="text-xs">{severity}</Badge>;
  };

  const categoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {category}
      </Badge>
    );
  };

  const formatTimestamp = (ms: number | null) => {
    if (ms == null) return '—';
    const sec = ms / 1000;
    return `${sec.toFixed(1)}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (patientId === 'all') {
    return (
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Headphones className="w-5 h-5 text-primary" />
            Disfluency Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a specific patient to view their disfluency audit log.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Headphones className="w-5 h-5 text-primary" />
            Disfluency Audit Log
            <Badge variant="secondary" className="ml-2">{events.length} events</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click the play button to hear the exact audio segment for each flagged disfluency event.
          </p>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No disfluency events recorded for this patient yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Word</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(event.sessionDate)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        "{event.word}"
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{event.disfluencyType}</Badge>
                      </TableCell>
                      <TableCell>{categoryBadge(event.disfluencyCategory)}</TableCell>
                      <TableCell>{severityBadge(event.severity)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestampInSession)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {event.durationMs ? `${event.durationMs}ms` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {event.audioFilePath ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Play className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">No audio</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Playback Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              Audio Verification
            </DialogTitle>
          </DialogHeader>
          {selectedEvent?.audioFilePath && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Word:</span>{' '}
                  <span className="font-medium text-foreground">"{selectedEvent.word}"</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  <Badge variant="outline" className="text-xs">{selectedEvent.disfluencyType}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Severity:</span>{' '}
                  {severityBadge(selectedEvent.severity)}
                </div>
                <div>
                  <span className="text-muted-foreground">Exercise:</span>{' '}
                  <span className="text-xs text-foreground">{selectedEvent.exerciseName}</span>
                </div>
              </div>

              <AudioClipPlayer
                audioFilePath={selectedEvent.audioFilePath}
                startTimeMs={selectedEvent.timestampInSession ? selectedEvent.timestampInSession - 500 : undefined}
                endTimeMs={
                  selectedEvent.timestampInSession
                    ? selectedEvent.timestampInSession + (selectedEvent.durationMs || 1000) + 500
                    : undefined
                }
                word={selectedEvent.word}
                disfluencyType={selectedEvent.disfluencyType}
                severity={selectedEvent.severity}
              />

              <p className="text-xs text-muted-foreground">
                Audio clips are secured with 60-second signed URLs and accessible only to assigned therapists.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
