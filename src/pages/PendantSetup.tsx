import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalibrationSequence } from "@/components/CalibrationSequence";
import { PairingWizard } from "@/components/PairingWizard";
import { OfflineStorageQueue } from "@/components/OfflineStorageQueue";
import { SecureAccountLinking } from "@/components/SecureAccountLinking";
import { Footer } from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const PendantSetup = () => {
  return (
    <>
      <Helmet>
        <title>Stammerly | Pendant Setup & Onboarding</title>
        <meta
          name="description"
          content="Set up your Stammerly pendant — voice calibration, Bluetooth and Wi-Fi pairing, offline storage monitoring, and secure account linking."
        />
      </Helmet>

      <main className="min-h-screen bg-background relative">
        <PageBackground />

        {/* Hero */}
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/hub/parent">
              <Button variant="ghost" size="sm" className="mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" /> Parent Hub
              </Button>
            </Link>

            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent-orange/10 px-4 py-1.5 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-accent-orange" />
                <span className="text-sm font-medium text-foreground">Hardware Onboarding</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-3">
                Set Up Your Pendant
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mb-12">
                Follow these steps to connect, calibrate, and secure your child's Stammerly pendant.
              </motion.p>
            </motion.div>

            {/* Two-column layout */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid lg:grid-cols-2 gap-6 max-w-5xl"
            >
              {/* Left column */}
              <div className="space-y-6">
                <motion.div variants={fadeUp}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                    Connect Your Pendant
                  </h2>
                  <PairingWizard />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                    Voice Calibration
                  </h2>
                  <CalibrationSequence />
                </motion.div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <motion.div variants={fadeUp}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                    Storage Monitor
                  </h2>
                  <OfflineStorageQueue />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                    Link a Professional
                  </h2>
                  <SecureAccountLinking />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default PendantSetup;
