import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, UserCheck, FileText, AlertTriangle, Building2, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageBackground from "@/components/PageBackground";

const NhsCompliance = () => {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>NHS Compliance & Clinical Safety | Stammerly</title>
        <meta name="description" content="Stammerly's commitment to NHS Digital Technology Assessment Criteria (DTAC), DCB0129 clinical risk management, and clinical safety standards." />
      </Helmet>

      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">NHS & Clinical Compliance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Clinical Safety & <span className="text-primary">NHS Compliance</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stammerly is committed to meeting the highest standards of clinical safety and data governance required for deployment within NHS trusts and UK public sector education.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-6" />
          </div>

          {/* DTAC Compliance */}
          <Card className="mb-8 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">NHS Digital Technology Assessment Criteria (DTAC)</CardTitle>
                  <p className="text-muted-foreground">Our roadmap to full DTAC compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The DTAC is a baseline standard for digital health technologies entering the NHS. Stammerly is working towards full compliance across all five DTAC domains:
              </p>
              <div className="space-y-3">
                {[
                  { domain: "Clinical Safety", status: "In Progress", detail: "DCB0129 Clinical Risk Management process initiated. Hazard Log and Clinical Safety Case Report under development." },
                  { domain: "Data Protection", status: "In Progress", detail: "Data Protection Impact Assessment (DPIA) completed for child speech data processing. UK GDPR Article 35 obligations met." },
                  { domain: "Technical Security", status: "In Progress", detail: "AES-256 encryption at rest and in transit. Row-Level Security enforced on all database tables. JWT-validated API endpoints." },
                  { domain: "Interoperability", status: "Planned", detail: "FHIR-compatible data export capability planned for integration with NHS clinical systems." },
                  { domain: "Usability & Accessibility", status: "In Progress", detail: "WCAG 2.2 AA compliance programme underway. User testing with children who stammer conducted regularly." },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-background/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{item.domain}</h4>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        item.status === 'In Progress' ? 'bg-accent-orange/10 text-accent-orange' : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DCB0129 */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-success/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-success" />
                </div>
                <div>
                  <CardTitle className="text-2xl">DCB0129 Clinical Risk Management</CardTitle>
                  <p className="text-muted-foreground">Proactive patient safety for health IT systems</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                DCB0129 is the NHS standard for clinical risk management of health IT systems used by healthcare organisations. Stammerly adheres to this framework to ensure our AI-assisted speech analysis does not introduce clinical risk to patients.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-success mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Clinical Risk Management System</h4>
                  <p className="text-sm text-muted-foreground">Formal hazard identification, risk assessment, and mitigation processes documented and maintained.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-success mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Hazard Log</h4>
                  <p className="text-sm text-muted-foreground">Maintained hazard log identifying potential clinical risks from AI speech analysis outputs and mitigations in place.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-success mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Clinical Safety Case Report</h4>
                  <p className="text-sm text-muted-foreground">Safety case demonstrating that residual clinical risks are acceptable and appropriately managed.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-success mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Human Oversight Principle</h4>
                  <p className="text-sm text-muted-foreground">"AI flags patterns; humans make diagnoses." All clinical decisions are made by qualified SLTs, not automated systems.</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gold/10 border border-gold/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Important:</strong> Stammerly is a clinical support tool, not a medical device. It does not provide diagnoses, treatment recommendations, or replace professional clinical judgement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Named Officers */}
          <Card className="mb-8 border-2 border-accent-sky/30 shadow-xl bg-gradient-to-br from-accent-sky/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-sky/20 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-accent-sky" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Named Officers</CardTitle>
                  <p className="text-muted-foreground">Accountability and governance contacts</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-background/50 rounded-xl text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground text-lg mb-1">Data Protection Officer (DPO)</h4>
                  <p className="text-foreground font-medium mb-2">Mia Romem</p>
                  <p className="text-sm text-muted-foreground mb-2">Responsible for ensuring compliance with UK GDPR, the Data Protection Act 2018, and the ICO Children's Code.</p>
                  <a href="mailto:mia@stammerly.com" className="text-primary hover:underline text-sm">mia@stammerly.com</a>
                </div>
                <div className="p-6 bg-background/50 rounded-xl text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="font-bold text-foreground text-lg mb-1">Clinical Safety Officer (CSO)</h4>
                  <p className="text-foreground font-medium mb-2">To Be Appointed</p>
                  <p className="text-sm text-muted-foreground mb-2">Responsible for overseeing DCB0129 compliance, maintaining the Hazard Log, and signing off the Clinical Safety Case Report.</p>
                  <p className="text-xs text-muted-foreground italic">A qualified Clinical Safety Officer will be formally appointed prior to NHS deployment.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Commitments */}
          <Card className="mb-12 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Ongoing Commitments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Regular penetration testing and security audits",
                  "Annual Data Protection Impact Assessments for new features",
                  "Staff training on information governance and clinical safety",
                  "Incident response plan maintained and tested",
                  "Transparent reporting to commissioners and trust buyers",
                  "Alignment with NHS Data Security and Protection Toolkit (DSPT)",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/privacy-policy">Privacy & Ethics Policy</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/childrens-privacy">Children's Privacy Notice</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: March 2026. This page is reviewed quarterly and updated as our compliance posture matures.
          </p>
        </div>
      </main>
    </div>
  );
};

export default NhsCompliance;
