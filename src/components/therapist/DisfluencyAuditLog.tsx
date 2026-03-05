import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Headphones, Play, Loader2, AlertTriangle, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

interface Annotation {
  id: string;
  disfluencyLogId: string;
  assessmentCorrect: boolean;
  correctedType: string | null;
  correctedSeverity: string | null;
  notes: string | null;
}

interface DisfluencyAuditLogProps {
  patientId: string;
}

const DISFLUENCY_TYPES = [
  'block', 'prolongation', 'sound_repetition', 'syllable_repetition',
  'word_repetition', 'phrase_repetition', 'revision', 'interjection',
];

const SEVERITY_LEVELS = ['mild', 'moderate', 'severe'];

export function DisfluencyAuditLog({ patientId }: DisfluencyAuditLogProps) {
  const [events, setEvents] = useState<DisfluencyEvent[]>([]);
  const [annotations, setAnnotations] = useState<Map<string, Annotation>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DisfluencyEvent | null>(null);

  // Annotation form state
  const [annotationCorrect, setAnnotationCorrect] = useState<boolean | null>(null);
  const [correctedType, setCorrectedType] = useState('');
  const [correctedSeverity, setCorrectedSeverity] = useState('');
  const [annotationNotes, setAnnotationNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patientId || patientId === 'all') {
      setEvents([]);
      setAnnotations(new Map());
      setLoading(false);
      return;
    }
    fetchDisfluencyEvents();
  }, [patientId]);

  // Load annotation form when event is selected
  useEffect(() => {
    if (!selectedEvent) return;
    const existing = annotations.get(selectedEvent.id);
    if (existing) {
      setAnnotationCorrect(existing.assessmentCorrect);
      setCorrectedType(existing.correctedType || '');
      setCorrectedSeverity(existing.correctedSeverity || '');
      setAnnotationNotes(existing.notes || '');
    } else {
      setAnnotationCorrect(null);
      setCorrectedType('');
      setCorrectedSeverity('');
      setAnnotationNotes('');
    }
  }, [selectedEvent, annotations]);

  const fetchDisfluencyEvents = async () => {
    setLoading(true);
    try {
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

      const sessionIds = [...new Set(logs.map(l => l.session_id).filter(Boolean))] as string[];
      const logIds = logs.map(l => l.id);

      // Fetch sessions and annotations in parallel
      const [sessionsResult, annotationsResult] = await Promise.all([
        supabase
          .from('practice_sessions')
          .select('id, audio_file_path, session_date, exercise_name')
          .in('id', sessionIds),
        supabase
          .from('therapist_annotations')
          .select('*')
          .in('disfluency_log_id', logIds),
      ]);

      const sessionMap = new Map(
        sessionsResult.data?.map(s => [s.id, { audioFilePath: s.audio_file_path, sessionDate: s.session_date, exerciseName: s.exercise_name }]) || []
      );

      // Build annotations map
      const annMap = new Map<string, Annotation>();
      annotationsResult.data?.forEach(a => {
        annMap.set(a.disfluency_log_id, {
          id: a.id,
          disfluencyLogId: a.disfluency_log_id,
          assessmentCorrect: a.assessment_correct,
          correctedType: a.corrected_type,
          correctedSeverity: a.corrected_severity,
          notes: a.notes,
        });
      });
      setAnnotations(annMap);

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

  const saveAnnotation = useCallback(async () => {
    if (!selectedEvent || annotationCorrect === null) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existing = annotations.get(selectedEvent.id);
      const payload = {
        disfluency_log_id: selectedEvent.id,
        therapist_id: user.id,
        assessment_correct: annotationCorrect,
        corrected_type: !annotationCorrect ? correctedType || null : null,
        corrected_severity: !annotationCorrect ? correctedSeverity || null : null,
        notes: annotationNotes || null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('therapist_annotations')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('therapist_annotations')
          .insert(payload);
        if (error) throw error;
      }

      // Update local state
      setAnnotations(prev => {
        const next = new Map(prev);
        next.set(selectedEvent.id, {
          id: existing?.id || '',
          disfluencyLogId: selectedEvent.id,
          assessmentCorrect: annotationCorrect,
          correctedType: !annotationCorrect ? correctedType || null : null,
          correctedSeverity: !annotationCorrect ? correctedSeverity || null : null,
          notes: annotationNotes || null,
        });
        return next;
      });

      toast.success(annotationCorrect ? 'Marked as correct' : 'Correction saved');
    } catch (err) {
      console.error('Failed to save annotation:', err);
      toast.error('Failed to save annotation');
    } finally {
      setSaving(false);
    }
  }, [selectedEvent, annotationCorrect, correctedType, correctedSeverity, annotationNotes, annotations]);

  const severityBadge = (severity: string) => {
    const variant = severity === 'severe' ? 'destructive' as const : severity === 'moderate' ? 'default' as const : 'secondary' as const;
    return <Badge variant={variant} className="text-xs">{severity}</Badge>;
  };

  const annotationIcon = (eventId: string) => {
    const ann = annotations.get(eventId);
    if (!ann) return null;
    return ann.assessmentCorrect
      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
      : <XCircle className="w-3.5 h-3.5 text-destructive" />;
  };

  const formatTimestamp = (ms: number | null) => {
    if (ms == null) return '—';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Stats
  const totalAnnotated = annotations.size;
  const correctCount = Array.from(annotations.values()).filter(a => a.assessmentCorrect).length;
  const accuracyRate = totalAnnotated > 0 ? Math.round((correctCount / totalAnnotated) * 100) : null;

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
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground flex-1">
              Play audio to verify AI assessments, then mark each as correct or incorrect.
            </p>
            {accuracyRate !== null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">AI Accuracy:</span>
                <Badge variant={accuracyRate >= 80 ? 'default' : 'destructive'} className="font-mono">
                  {accuracyRate}%
                </Badge>
                <span className="text-xs text-muted-foreground">({correctCount}/{totalAnnotated} verified)</span>
              </div>
            )}
          </div>
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
                    <TableHead className="w-8">Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Word</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEvent(event)}>
                      <TableCell className="text-center">
                        {annotationIcon(event.id)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(event.sessionDate)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        "{event.word}"
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{event.disfluencyType}</Badge>
                      </TableCell>
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
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          >
                            <Play className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
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

      {/* Audio Playback + Annotation Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              Audit & Annotate
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {/* Event context */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Word:</span>{' '}
                  <span className="font-medium text-foreground">"{selectedEvent.word}"</span>
                </div>
                <div>
                  <span className="text-muted-foreground">AI Type:</span>{' '}
                  <Badge variant="outline" className="text-xs">{selectedEvent.disfluencyType}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">AI Severity:</span>{' '}
                  {severityBadge(selectedEvent.severity)}
                </div>
                <div>
                  <span className="text-muted-foreground">Exercise:</span>{' '}
                  <span className="text-xs text-foreground">{selectedEvent.exerciseName}</span>
                </div>
              </div>

              {/* Audio player */}
              {selectedEvent.audioFilePath && (
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
              )}

              {/* Annotation section */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Clinician Verification</p>
                
                {/* Correct / Incorrect buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={annotationCorrect === true ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setAnnotationCorrect(true)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    AI Correct
                  </Button>
                  <Button
                    variant={annotationCorrect === false ? 'destructive' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setAnnotationCorrect(false)}
                  >
                    <XCircle className="w-4 h-4" />
                    AI Incorrect
                  </Button>
                </div>

                {/* Correction fields (shown when incorrect) */}
                {annotationCorrect === false && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Correct Type</label>
                      <Select value={correctedType} onValueChange={setCorrectedType}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISFLUENCY_TYPES.map(t => (
                            <SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, ' ')}</SelectItem>
                          ))}
                          <SelectItem value="not_a_disfluency" className="text-xs">Not a disfluency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Correct Severity</label>
                      <Select value={correctedSeverity} onValueChange={setCorrectedSeverity}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_LEVELS.map(s => (
                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                          ))}
                          <SelectItem value="none" className="text-xs">None (false positive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <Textarea
                  placeholder="Optional clinical notes on this assessment..."
                  value={annotationNotes}
                  onChange={(e) => setAnnotationNotes(e.target.value)}
                  className="text-sm min-h-[60px]"
                />

                {/* Save */}
                <Button
                  onClick={saveAnnotation}
                  disabled={annotationCorrect === null || saving}
                  className="w-full"
                  size="sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  {annotations.has(selectedEvent.id) ? 'Update Annotation' : 'Save Annotation'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Annotations are stored securely and used to track AI model accuracy over time. Audio clips auto-delete after 90 days per GDPR data minimisation.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
