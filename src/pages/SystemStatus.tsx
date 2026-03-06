import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CheckCircle, AlertTriangle, XCircle, Clock, Server, Database, Wifi, Shield, Activity } from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "outage";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
  icon: React.ReactNode;
  latency?: string;
}

interface Incident {
  id: string;
  date: string;
  title: string;
  status: "resolved" | "investigating" | "monitoring";
  description: string;
  duration?: string;
}

const services: Service[] = [
  { name: "Web Application", status: "operational", uptime: 99.98, icon: <Activity className="w-4 h-4" />, latency: "42ms" },
  { name: "Authentication", status: "operational", uptime: 99.99, icon: <Shield className="w-4 h-4" />, latency: "38ms" },
  { name: "Database", status: "operational", uptime: 99.97, icon: <Database className="w-4 h-4" />, latency: "12ms" },
  { name: "AI Analysis Engine", status: "operational", uptime: 99.91, icon: <Server className="w-4 h-4" />, latency: "285ms" },
  { name: "Audio Processing", status: "operational", uptime: 99.95, icon: <Wifi className="w-4 h-4" />, latency: "156ms" },
  { name: "Real-time Sync", status: "operational", uptime: 99.96, icon: <Wifi className="w-4 h-4" />, latency: "8ms" },
];

const incidents: Incident[] = [
  {
    id: "1",
    date: "2026-02-28",
    title: "Elevated AI Analysis Latency",
    status: "resolved",
    description: "Increased response times on AI speech analysis due to upstream provider maintenance. No data loss occurred.",
    duration: "47 minutes",
  },
  {
    id: "2",
    date: "2026-02-15",
    title: "Scheduled Maintenance — Database Migration",
    status: "resolved",
    description: "Planned database schema migration to support new clinical metrics. Read-only mode was active for 12 minutes.",
    duration: "12 minutes",
  },
  {
    id: "3",
    date: "2026-01-22",
    title: "Audio Processing Delays",
    status: "resolved",
    description: "Temporary queue backlog on audio transcription pipeline during peak usage. All files were processed within SLA.",
    duration: "23 minutes",
  },
];

const statusConfig: Record<ServiceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  operational: { label: "Operational", color: "bg-success text-success-foreground", icon: <CheckCircle className="w-4 h-4" /> },
  degraded: { label: "Degraded", color: "bg-gold text-gold-foreground", icon: <AlertTriangle className="w-4 h-4" /> },
  outage: { label: "Outage", color: "bg-destructive text-destructive-foreground", icon: <XCircle className="w-4 h-4" /> },
};

const incidentStatusConfig: Record<string, { label: string; color: string }> = {
  resolved: { label: "Resolved", color: "bg-success/10 text-success border-success/20" },
  investigating: { label: "Investigating", color: "bg-destructive/10 text-destructive border-destructive/20" },
  monitoring: { label: "Monitoring", color: "bg-gold/10 text-gold border-gold/20" },
};

// Generate 90-day uptime bars (mock data)
const uptimeDays = Array.from({ length: 90 }, (_, i) => {
  const rand = Math.random();
  if (rand > 0.97) return "degraded";
  if (rand > 0.995) return "outage";
  return "operational";
});

const SystemStatus = () => {
  const allOperational = services.every((s) => s.status === "operational");
  const overallUptime = (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2);

  return (
    <>
      <Helmet>
        <title>System Status | Stammerly Trust Centre</title>
        <meta name="description" content="Real-time system status, uptime monitoring, and incident history for the Stammerly platform." />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative overflow-hidden py-16 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${allOperational ? "bg-success/10 text-success" : "bg-gold/10 text-gold"}`}>
                {allOperational ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                <span className="font-semibold">{allOperational ? "All Systems Operational" : "Some Systems Degraded"}</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">System Status</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {overallUptime}% average uptime across all services over the last 90 days.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="container mx-auto px-4 -mt-4 pb-12">
          <Card variant="glass" className="mb-8">
            <CardContent className="p-6 space-y-4">
              {services.map((service) => {
                const cfg = statusConfig[service.status];
                return (
                  <div key={service.name} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{service.icon}</span>
                      <span className="font-medium text-foreground">{service.name}</span>
                      {service.latency && <span className="text-xs text-muted-foreground hidden sm:inline">({service.latency})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:inline">{service.uptime}%</span>
                      <Badge className={cfg.color}>{cfg.icon}<span className="ml-1">{cfg.label}</span></Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 90-Day Uptime Chart */}
          <Card variant="glass" className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">90-Day Uptime History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-[2px] items-end h-8">
                {uptimeDays.map((status, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm h-full ${
                      status === "operational" ? "bg-success" : status === "degraded" ? "bg-gold" : "bg-destructive"
                    }`}
                    title={`Day ${90 - i}: ${status}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Incident Log */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" /> Incident History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incidents.map((incident) => {
                const cfg = incidentStatusConfig[incident.status];
                return (
                  <div key={incident.id} className="border border-border/30 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{incident.title}</h3>
                        <p className="text-xs text-muted-foreground">{incident.date} {incident.duration && `• Duration: ${incident.duration}`}</p>
                      </div>
                      <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default SystemStatus;
