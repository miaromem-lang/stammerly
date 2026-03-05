import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Download, Settings, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";

const MOCK_SUBSCRIPTION = {
  plan: "Stammerly Family",
  price: "£4.99",
  interval: "monthly",
  status: "active" as const,
  nextBillingDate: "2026-04-05",
  cardLast4: "4242",
  cardBrand: "Visa",
  startDate: "2025-09-15",
};

const MOCK_INVOICES = [
  { id: "INV-2026-03", date: "2026-03-05", amount: "£4.99", status: "paid" },
  { id: "INV-2026-02", date: "2026-02-05", amount: "£4.99", status: "paid" },
  { id: "INV-2026-01", date: "2026-01-05", amount: "£4.99", status: "paid" },
  { id: "INV-2025-12", date: "2025-12-05", amount: "£4.99", status: "paid" },
];

export const SubscriptionPortal = () => {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelStep, setCancelStep] = useState<"confirm" | "reason" | "done">("confirm");

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading ${invoiceId}...`);
  };

  const handleUpdatePayment = () => {
    toast.info("Payment method update — this will be connected to your payment provider.");
  };

  const handleCancel = () => {
    setCancelStep("done");
    toast.success("Subscription cancelled. You'll retain access until your next billing date.");
  };

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <CreditCard className="w-5 h-5 text-primary" />
          Subscription & Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Current Plan */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-foreground">{MOCK_SUBSCRIPTION.plan}</p>
              <p className="text-xs text-muted-foreground">
                {MOCK_SUBSCRIPTION.price}/{MOCK_SUBSCRIPTION.interval}
              </p>
            </div>
            <Badge className="bg-success/20 text-success border-success/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Next billing:</span>{" "}
              {new Date(MOCK_SUBSCRIPTION.nextBillingDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div>
              <span className="font-medium text-foreground">Payment:</span>{" "}
              {MOCK_SUBSCRIPTION.cardBrand} ••••{MOCK_SUBSCRIPTION.cardLast4}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleUpdatePayment}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Update Card
          </Button>
          <Dialog open={showCancel} onOpenChange={(open) => { setShowCancel(open); if (!open) setCancelStep("confirm"); }}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
              >
                <Settings className="w-3.5 h-3.5" />
                Cancel Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-gold" />
                  {cancelStep === "done" ? "Subscription Cancelled" : "Cancel Subscription?"}
                </DialogTitle>
              </DialogHeader>
              {cancelStep === "confirm" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We're sorry to see you go. If you cancel, you'll retain full access until{" "}
                    <strong className="text-foreground">
                      {new Date(MOCK_SUBSCRIPTION.nextBillingDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                    . Your child's data will be preserved for 90 days.
                  </p>
                  <div className="bg-gold/10 p-3 rounded-lg border border-gold/20">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Consider pausing instead:</strong> You can skip a month without losing progress or data.
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowCancel(false)}>
                      Keep My Plan
                    </Button>
                    <Button variant="destructive" onClick={handleCancel}>
                      Yes, Cancel
                    </Button>
                  </DialogFooter>
                </div>
              )}
              {cancelStep === "done" && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Your subscription has been cancelled. Access continues until your next billing date.
                  </p>
                  <Button className="mt-4" onClick={() => setShowCancel(false)}>
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* Invoices */}
        <div>
          <p className="text-xs font-medium text-foreground mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Tax Invoices
          </p>
          <div className="space-y-2">
            {MOCK_INVOICES.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-lg text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{inv.id}</span>
                  <span className="text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-medium text-foreground">{inv.amount}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] gap-1"
                  onClick={() => handleDownloadInvoice(inv.id)}
                >
                  <Download className="w-3 h-3" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
