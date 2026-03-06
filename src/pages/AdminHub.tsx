import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Shield, Activity, DollarSign, Users, Lock,
  AlertTriangle, Loader2, Save, RefreshCw, Eye, EyeOff,
  FileText, Headphones, Stethoscope, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HubNavigation } from "@/components/HubNavigation";
import PageBackground from "@/components/PageBackground";

// Permission areas with descriptions
const PERMISSION_AREAS = [
  { id: "user_accounts", label: "User Accounts", description: "Reset passwords, manage profiles", icon: Users, sensitive: false },
  { id: "clinical_audio", label: "Clinical Audio Files", description: "Access raw session recordings", icon: Headphones, sensitive: true },
  { id: "therapist_notes", label: "Therapist Diagnostic Notes", description: "View SOAP notes & clinical assessments", icon: Stethoscope, sensitive: true },
  { id: "safeguarding_alerts", label: "Safeguarding Alerts", description: "Review flagged distress incidents", icon: AlertTriangle, sensitive: true },
  { id: "billing_data", label: "Billing & Subscriptions", description: "Manage payments and invoices", icon: DollarSign, sensitive: false },
  { id: "api_rate_limits", label: "API Rate Limits", description: "Configure cost controls and limits", icon: Activity, sensitive: false },
  { id: "analytics_dashboard", label: "Analytics Dashboard", description: "View aggregate usage metrics", icon: Activity, sensitive: false },
  { id: "feature_requests", label: "Feature Requests", description: "Manage roadmap submissions", icon: MessageSquare, sensitive: false },
  { id: "audit_logs", label: "Audit Logs", description: "View system activity trail", icon: FileText, sensitive: false },
];

const PERMISSION_LEVELS = ["none", "read", "write", "full"] as const;

interface AdminPermission {
  id: string;
  user_id: string;
  permission_area: string;
  permission_level: string;
}

interface RateLimit {
  id: string;
  function_name: string;
  max_requests_per_minute: number;
  max_requests_per_hour: number;
  max_daily_cost_gbp: number;
  is_enabled: boolean;
}

interface UsageSummary {
  function_name: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
}

const AdminHub = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedLimits, setEditedLimits] = useState<Record<string, Partial<RateLimit>>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [permRes, limitRes, usageRes] = await Promise.all([
        (supabase as any).from("admin_permissions").select("*"),
        (supabase as any).from("api_rate_limits").select("*").order("function_name"),
        (supabase as any).from("api_usage_logs")
          .select("function_name, tokens_used, estimated_cost_gbp")
      ]);

      if (permRes.data) setPermissions(permRes.data);
      if (limitRes.data) setRateLimits(limitRes.data);

      // Aggregate usage by function
      if (usageRes.data) {
        const grouped: Record<string, UsageSummary> = {};
        for (const row of usageRes.data) {
          if (!grouped[row.function_name]) {
            grouped[row.function_name] = { function_name: row.function_name, total_requests: 0, total_tokens: 0, total_cost: 0 };
          }
          grouped[row.function_name].total_requests++;
          grouped[row.function_name].total_tokens += row.tokens_used || 0;
          grouped[row.function_name].total_cost += parseFloat(row.estimated_cost_gbp) || 0;
        }
        setUsageSummary(Object.values(grouped));
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRateLimit = async (limitId: string) => {
    const edits = editedLimits[limitId];
    if (!edits) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("api_rate_limits")
        .update({ ...edits, updated_at: new Date().toISOString() })
        .eq("id", limitId);
      if (error) throw error;
      toast.success("Rate limit updated");
      setEditedLimits((prev) => { const next = { ...prev }; delete next[limitId]; return next; });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (limitId: string, enabled: boolean) => {
    try {
      await (supabase as any)
        .from("api_rate_limits")
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("id", limitId);
      toast.success(enabled ? "Rate limiting enabled" : "Rate limiting disabled");
      loadData();
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "none": return "bg-muted text-muted-foreground";
      case "read": return "bg-accent-sky/10 text-accent-sky border-accent-sky/20";
      case "write": return "bg-gold/10 text-gold border-gold/20";
      case "full": return "bg-success/10 text-success border-success/20";
      default: return "";
    }
  };

  const totalDailyCost = usageSummary.reduce((sum, u) => sum + u.total_cost, 0);
  const totalRequests = usageSummary.reduce((sum, u) => sum + u.total_requests, 0);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <PageBackground />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <HubNavigation />

      <header className="glass-card-strong border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dev")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-destructive/90 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Super Admin Hub</span>
            </div>
            <Button variant="ghost" size="icon" onClick={loadData}>
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{totalRequests}</p>
              <p className="text-sm text-muted-foreground">Total API Calls</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gold">£{totalDailyCost.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Spend</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{rateLimits.filter(r => r.is_enabled).length}</p>
              <p className="text-sm text-muted-foreground">Active Limits</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-accent-orange">{permissions.length}</p>
              <p className="text-sm text-muted-foreground">Permission Rules</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rbac" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="rbac">RBAC Matrix</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
            <TabsTrigger value="usage">API Usage</TabsTrigger>
          </TabsList>

          {/* RBAC Matrix */}
          <TabsContent value="rbac" className="space-y-6">
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Role-Based Access Control Matrix
                </CardTitle>
                <CardDescription>
                  Define what each team role can access. <strong>Clinical data is restricted by default.</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-semibold text-foreground">Permission Area</th>
                        <th className="text-center py-3 px-2 font-semibold text-foreground">Customer Support</th>
                        <th className="text-center py-3 px-2 font-semibold text-foreground">Product Team</th>
                        <th className="text-center py-3 px-2 font-semibold text-foreground">Clinical Lead</th>
                        <th className="text-center py-3 px-2 font-semibold text-foreground">CTO / Founder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSION_AREAS.map((area) => {
                        const Icon = area.icon;
                        // Default matrix
                        const defaults: Record<string, Record<string, string>> = {
                          user_accounts: { support: "write", product: "read", clinical: "none", founder: "full" },
                          clinical_audio: { support: "none", product: "none", clinical: "full", founder: "full" },
                          therapist_notes: { support: "none", product: "none", clinical: "full", founder: "read" },
                          safeguarding_alerts: { support: "none", product: "none", clinical: "full", founder: "read" },
                          billing_data: { support: "read", product: "read", clinical: "none", founder: "full" },
                          api_rate_limits: { support: "none", product: "read", clinical: "none", founder: "full" },
                          analytics_dashboard: { support: "read", product: "full", clinical: "read", founder: "full" },
                          feature_requests: { support: "write", product: "full", clinical: "read", founder: "full" },
                          audit_logs: { support: "none", product: "read", clinical: "read", founder: "full" },
                        };

                        const levels = defaults[area.id] || {};

                        return (
                          <tr key={area.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-foreground">{area.label}</p>
                                  <p className="text-xs text-muted-foreground">{area.description}</p>
                                </div>
                                {area.sensitive && (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] ml-1">
                                    SENSITIVE
                                  </Badge>
                                )}
                              </div>
                            </td>
                            {["support", "product", "clinical", "founder"].map((role) => (
                              <td key={role} className="py-3 px-2 text-center">
                                <Badge variant="outline" className={`${getLevelBadgeColor(levels[role])} text-xs`}>
                                  {levels[role] === "none" ? (
                                    <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> None</span>
                                  ) : levels[role] === "read" ? (
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Read</span>
                                  ) : levels[role] === "write" ? (
                                    <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Write</span>
                                  ) : (
                                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Full</span>
                                  )}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Clinical Data Isolation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Customer Support agents have <strong>zero access</strong> to clinical audio files, therapist diagnostic notes, 
                        and safeguarding alerts. Only the Clinical Lead and CTO/Founder can access these resources. 
                        This separation is enforced at the database level via Row-Level Security policies.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limits */}
          <TabsContent value="rate-limits" className="space-y-4">
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-orange" />
                  API Rate Limits & Cost Controls
                </CardTitle>
                <CardDescription>
                  Prevent runaway costs from LLM API calls. Each function has independent limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rateLimits.map((limit) => {
                  const edits = editedLimits[limit.id] || {};
                  const hasEdits = Object.keys(edits).length > 0;

                  return (
                    <div key={limit.id} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground font-mono text-sm">{limit.function_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {limit.is_enabled ? "Active" : "Disabled"}
                          </span>
                          <Switch
                            checked={limit.is_enabled}
                            onCheckedChange={(v) => handleToggleEnabled(limit.id, v)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Max / minute</label>
                          <Input
                            type="number"
                            defaultValue={limit.max_requests_per_minute}
                            onChange={(e) =>
                              setEditedLimits((prev) => ({
                                ...prev,
                                [limit.id]: { ...prev[limit.id], max_requests_per_minute: parseInt(e.target.value) },
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Max / hour</label>
                          <Input
                            type="number"
                            defaultValue={limit.max_requests_per_hour}
                            onChange={(e) =>
                              setEditedLimits((prev) => ({
                                ...prev,
                                [limit.id]: { ...prev[limit.id], max_requests_per_hour: parseInt(e.target.value) },
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Daily budget (£)</label>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={limit.max_daily_cost_gbp}
                            onChange={(e) =>
                              setEditedLimits((prev) => ({
                                ...prev,
                                [limit.id]: { ...prev[limit.id], max_daily_cost_gbp: parseFloat(e.target.value) },
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      {hasEdits && (
                        <Button
                          variant="navy"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleUpdateRateLimit(limit.id)}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                          Save Changes
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Usage */}
          <TabsContent value="usage" className="space-y-4">
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gold" />
                  API Usage & Cost Breakdown
                </CardTitle>
                <CardDescription>
                  Real-time tracking of LLM token consumption and estimated costs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usageSummary.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No API usage recorded yet. Usage will appear here as functions are called.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {usageSummary.sort((a, b) => b.total_cost - a.total_cost).map((usage) => {
                      const costPercent = totalDailyCost > 0 ? (usage.total_cost / totalDailyCost) * 100 : 0;
                      return (
                        <div key={usage.function_name} className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-medium text-foreground">{usage.function_name}</span>
                            <span className="font-semibold text-gold">£{usage.total_cost.toFixed(4)}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mb-2">
                            <div
                              className="bg-gradient-to-r from-primary to-accent-sky h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(costPercent, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{usage.total_requests} requests</span>
                            <span>{usage.total_tokens.toLocaleString()} tokens</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 p-4 bg-gold/5 border border-gold/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Cost Protection</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Each function has an independent daily budget cap. When a function's daily spend reaches its limit, 
                        further calls are blocked and an alert is logged. This prevents a stuck microphone or infinite loop 
                        from draining the operational budget overnight.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminHub;
