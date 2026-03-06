import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Server, Shield, Lock, Database, FileJson, Network, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const TechnicalIntegration = () => {
  return (
    <>
      <Helmet>
        <title>Technical Integration & Security | Stammerly for IT Teams</title>
        <meta name="description" content="Technical integration specifications for IT procurement teams. EHR interoperability with SystmOne and EMIS Web, API documentation, penetration testing results, and infrastructure details." />
        <link rel="canonical" href="https://stammerly.com/technical-integration" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-sky/5 via-background to-primary/5" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/procurement">
              <Button variant="ghost" size="sm" className="mb-8 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Procurement
              </Button>
            </Link>
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent-sky/10 px-4 py-1.5 rounded-full mb-6">
                <Server className="w-4 h-4 text-accent-sky" />
                <span className="text-sm font-medium text-accent-sky">For IT & InfoSec Teams</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                Technical Integration & Security
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl">
                Everything your IT department needs to evaluate Stammerly for deployment within NHS trusts, local authorities, or school academy networks.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto space-y-8">

            {/* EHR Interoperability */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Network className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">EHR Interoperability</h2>
                      <p className="text-sm text-muted-foreground mt-1">Integration with NHS clinical systems</p>
                    </div>
                  </div>
                  <div className="space-y-6 text-muted-foreground">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Supported Systems</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { name: "SystmOne (TPP)", status: "API Integration", detail: "HL7 FHIR R4 compliant. Stammerly pushes structured clinical summaries as DocumentReference resources. Supports CareConnect profiles." },
                          { name: "EMIS Web", status: "API Integration", detail: "EMIS Partner API integration. Exports SNOMED CT-coded observations (fluency metrics, session summaries) as structured entries in patient records." },
                          { name: "Rio (Servelec)", status: "File Export", detail: "CSV and HL7v2 ADT message export for community mental health and children's services using Rio." },
                          { name: "Other EHR Systems", status: "FHIR R4", detail: "Any system supporting HL7 FHIR R4 can receive Stammerly data via our RESTful API. We provide pre-built profiles and implementation guides." },
                        ].map((sys) => (
                          <Card key={sys.name} className="border border-border/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground text-sm">{sys.name}</span>
                                <Badge variant="outline" className="text-xs">{sys.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{sys.detail}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Data Standards</h3>
                      <ul className="space-y-2 text-sm">
                        {[
                          "HL7 FHIR R4 (primary integration standard)",
                          "SNOMED CT for clinical terminology coding",
                          "NHS Data Dictionary compliant field naming",
                          "NHS Number as patient identifier (where available and consented)",
                          "ISO 8601 timestamps, UTC storage, local display",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">API Overview</h3>
                      <Card className="bg-foreground/5 border-border/20 font-mono text-xs overflow-x-auto">
                        <CardContent className="p-4 space-y-1">
                          <p><span className="text-success">GET</span>  /api/v1/patients/&#123;id&#125;/sessions</p>
                          <p><span className="text-success">GET</span>  /api/v1/patients/&#123;id&#125;/metrics/summary</p>
                          <p><span className="text-primary">POST</span> /api/v1/export/fhir/document-reference</p>
                          <p><span className="text-primary">POST</span> /api/v1/export/emis/observation</p>
                          <p><span className="text-success">GET</span>  /api/v1/export/csv/&#123;patient_id&#125;</p>
                          <p className="text-muted-foreground mt-2">// Full OpenAPI 3.0 spec available on request</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security & Pen Testing */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-success/10">
                      <Shield className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">Penetration Testing & Security</h2>
                      <p className="text-sm text-muted-foreground mt-1">Independent third-party verification</p>
                    </div>
                  </div>
                  <div className="space-y-6 text-muted-foreground">
                    <Card className="bg-success/5 border-success/20">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-success/10 text-success border-success/20">Latest Test</Badge>
                          <span className="text-sm font-medium text-foreground">February 2026</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Testing Firm</p>
                            <p className="font-semibold text-foreground text-sm">NCC Group</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Methodology</p>
                            <p className="font-semibold text-foreground text-sm">OWASP Top 10 + CREST</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Critical Findings</p>
                            <p className="font-semibold text-success text-sm">0 Critical / 0 High</p>
                          </div>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-2">Summary of Findings:</h4>
                        <ul className="space-y-1.5 text-sm">
                          {[
                            "0 Critical vulnerabilities",
                            "0 High-severity vulnerabilities",
                            "2 Medium-severity findings (both remediated within 48 hours)",
                            "5 Low/Informational findings (accepted risk with documented rationale)",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground mt-3">
                          Full report available under NDA for procurement teams. Contact <Link to="/contact" className="text-primary hover:underline">governance@stammerly.com</Link>.
                        </p>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Security Certifications & Practices</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { title: "Cyber Essentials Plus", desc: "NCSC-backed certification — annual assessment" },
                          { title: "ISO 27001", desc: "Information security management system (in progress)" },
                          { title: "DTAC Compliant", desc: "NHS Digital Technology Assessment Criteria" },
                          { title: "Data Sovereignty", desc: "All data stored in UK (London) data centres" },
                        ].map((cert) => (
                          <Card key={cert.title} className="border border-border/30">
                            <CardContent className="p-4">
                              <p className="font-semibold text-foreground text-sm">{cert.title}</p>
                              <p className="text-xs text-muted-foreground">{cert.desc}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Infrastructure */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-accent-orange/10">
                      <Database className="w-6 h-6 text-accent-orange" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Infrastructure Overview</h2>
                  </div>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: "Cloud Provider", value: "AWS eu-west-2 (London)" },
                        { label: "Database", value: "PostgreSQL 15 (encrypted at rest, AES-256)" },
                        { label: "Audio Storage", value: "S3 with SSE-KMS, auto-deletion after 90 days" },
                        { label: "Transit Encryption", value: "TLS 1.3 minimum, HSTS enforced" },
                        { label: "Authentication", value: "OAuth 2.0 + PKCE, MFA supported" },
                        { label: "API Rate Limiting", value: "Token-bucket, 100 req/min per client" },
                        { label: "Backups", value: "Daily automated, 30-day retention, tested quarterly" },
                        { label: "Uptime SLA", value: "99.9% (monitored via independent third party)" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-2">
                          <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="text-foreground font-medium">{item.label}:</span> {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Flow */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FileJson className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Data Flow & Processing</h2>
                  </div>
                  <ol className="space-y-4 text-sm text-muted-foreground">
                    {[
                      { step: "On-Device Processing", detail: "Audio is captured by the pendant microphone and processed locally using a quantised TFLite model. Raw audio never leaves the device in real-time." },
                      { step: "Encrypted Sync", detail: "When the pendant syncs via Bluetooth LE (BLE 5.0), processed speech metrics and short audio clips are transferred to the parent's phone, encrypted with AES-256-GCM." },
                      { step: "Cloud Upload", detail: "Encrypted payloads are uploaded to our UK-based cloud infrastructure over TLS 1.3. The encryption key is unique per user and rotated quarterly." },
                      { step: "Clinical Analysis", detail: "Server-side models perform detailed disfluency classification, prosody analysis, and trend detection. Results are stored in the patient's encrypted record." },
                      { step: "Therapist Access", detail: "Authorised therapists access patient data through role-based access control (RBAC). All access is logged in an immutable audit trail." },
                      { step: "EHR Export", detail: "On therapist request, structured clinical summaries are pushed to the connected EHR system via FHIR R4 or EMIS Partner API." },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0 mt-0.5 w-7 h-7 p-0 flex items-center justify-center text-xs font-bold font-mono">{i + 1}</Badge>
                        <div>
                          <span className="font-semibold text-foreground">{item.step}</span>
                          <p className="text-muted-foreground">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="text-center pt-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Request Full Documentation</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                We provide DPIA templates, OpenAPI specs, network architecture diagrams, and full pen test reports under NDA. Contact our technical governance team.
              </p>
              <Link to="/contact">
                <Button variant="hero" size="lg" className="rounded-xl gap-2">
                  Request Technical Pack <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default TechnicalIntegration;
