import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText, Lock, Globe, AlertCircle, CreditCard, Scale, Info } from "lucide-react";
import logo from "../../assets/icons/logo2.png";

export default function Legal() {
  const [activeSegment, setActiveSegment] = useState("terms");

  const segments = [
    { id: "terms", label: "Terms of Service", icon: <FileText size={18} /> },
    { id: "privacy", label: "Privacy Protocol", icon: <ShieldCheck size={18} /> },
    { id: "refund", label: "Refund & Billing", icon: <CreditCard size={18} /> },
    { id: "disclaimer", label: "Legal Disclaimers", icon: <Scale size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Return to Overview</span>
        </Link>

        <header className="mb-16">
          <img src={logo} alt="DebtAI" className="w-16 h-16 mb-8" />
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6">Legal Framework</h1>
          <p className="text-stone-400 text-xl font-medium max-w-2xl leading-tight">Comprehensive documentation regarding operational boundaries, data integrity, and user obligations for the DebtAI platform.</p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 bg-stone-900/40 p-1.5 rounded-[32px] border border-stone-800 w-fit">
            {segments.map((segment) => (
                <button
                    key={segment.id}
                    onClick={() => setActiveSegment(segment.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[24px] font-bold text-xs uppercase tracking-widest transition-all ${activeSegment === segment.id ? "bg-white text-black shadow-xl" : "text-stone-500 hover:text-stone-300 hover:bg-white/5"}`}
                >
                    {segment.icon}
                    <span>{segment.label}</span>
                </button>
            ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
            <main className="lg:col-span-8">
                {activeSegment === "terms" && <TermsSection />}
                {activeSegment === "privacy" && <PrivacySection />}
                {activeSegment === "refund" && <RefundSection />}
                {activeSegment === "disclaimer" && <DisclaimerSection />}
            </main>

            <aside className="lg:col-span-4 space-y-8">
                <div className="bg-stone-900/50 border border-stone-800 p-8 rounded-[40px] space-y-6">
                    <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center">
                        <Info size={20} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Quick Summary</h3>
                    <ul className="space-y-4 text-sm text-stone-500 font-medium">
                        <li className="flex gap-3"><CheckCircle /> We don't sell your personal data.</li>
                        <li className="flex gap-3"><CheckCircle /> We are not financial advisors.</li>
                        <li className="flex gap-3"><CheckCircle /> AI can occasionally provide incorrect data.</li>
                        <li className="flex gap-3"><CheckCircle /> You can delete your account anytime.</li>
                    </ul>
                </div>
                <div className="p-8 border border-stone-800 rounded-[40px] text-center">
                    <p className="text-stone-500 text-sm font-bold mb-4">Need clarification?</p>
                    <Link to="/support" className="btn-primary w-full py-4 text-xs block text-center">Contact Legal Support</Link>
                </div>
            </aside>
        </div>

        <footer className="mt-32 pt-10 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
             <p className="text-[10px] font-black uppercase tracking-[0.5em]">© 2026 DebtAI Architecture • v4.2.0</p>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                <span>Last Updated: April 9, 2026</span>
                <span>Jurisdiction: New Delhi, India</span>
             </div>
        </footer>
      </div>
    </div>
  );
}

const CheckCircle = () => <div className="w-1.5 h-1.5 rounded-full bg-stone-700 mt-2 shrink-0" />;

const TermsSection = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <h2 className="text-4xl font-black tracking-tight">Terms of Service</h2>
        <div className="prose prose-invert prose-stone max-w-none text-stone-400 leading-relaxed space-y-8">
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">1. Agreement to Terms</h3>
                <p>By accessing DebtAI, you agree to be bound by these Terms. Our services are provided to authorized users who have successfully passed the architectural synchronization (onboarding).</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">2. The Intelligence Module (AI)</h3>
                <p>The DebtAI Chat and reporting tools utilize Large Language Models (LLMs). While highly advanced, these models can generate "hallucinations" or incorrect mathematical inferences. You must verification all calculated outputs manually.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>AI insights are for educational purposes only.</li>
                    <li>We do not guarantee the specific accuracy of debt reduction timelines generated by the AI.</li>
                    <li>System capacity is limited by subscription tier (Basic vs. High Growth).</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">3. User Obligations</h3>
                <p>You are responsible for providing current and accurate financial coefficients (Interest rates, Balances). Failure to do so renders the platform's analysis invalid.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">4. Payment Architecture</h3>
                <p>All premium transactions are processed via Razorpay. We do not store full credit card identifiers on our servers. By upgrading, you agree to Razorpay's independent Terms of Service.</p>
            </div>
        </div>
    </div>
);

const PrivacySection = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <h2 className="text-4xl font-black tracking-tight">Privacy Protocol</h2>
        <div className="prose prose-invert prose-stone max-w-none text-stone-400 leading-relaxed space-y-8">
            <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800 flex items-start gap-4">
                <Lock className="text-stone-300 mt-1" size={20} />
                <p className="text-sm font-bold text-stone-300 italic">"Your financial history is never for sale. We do not monetize user data via third-party advertising brokers."</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">1. Data Collection</h3>
                <p>We collect Net Inflow (Income), Core Outflow (Expenses), and Liability Units (Debts). This data is localized to your specific UUID in Google Firebase.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">2. Encryption Hierarchy</h3>
                <p>Data is persisted using industry-standard AES-256 encryption. We utilize TLS 1.3 for all data in transit between your interface and our cognitive processing units.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">3. Memory Purging</h3>
                <p>You have the right to 'Forget Profile'. Executing this command in the Profile module permanently deletes all financial records, chat transcripts, and habit history from our repositories.</p>
            </div>
        </div>
    </div>
);

const RefundSection = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <h2 className="text-4xl font-black tracking-tight">Refund & Billing Policy</h2>
        <div className="prose prose-invert prose-stone max-w-none text-stone-400 leading-relaxed space-y-8">
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">1. Subscription Cycles</h3>
                <p>DebtAI offers Monthly and Annual billing cycles. Subscriptions automatically renew at the end of each cycle unless terminated via your account dashboard.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">2. Refund Window</h3>
                <p>We provide a <strong>7-day satisfaction window</strong> for all 'High Growth' and 'Hyper Growth' upgrades. If the architectural insights do not meet your expectations, contact Support within 168 hours of purchase for a full reversal.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">3. Cancellation</h3>
                <p>You may cancel your upgrade at any time. Your Premium access will remain active until the end of the current paid billing horizon.</p>
            </div>
        </div>
    </div>
);

const DisclaimerSection = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <h2 className="text-4xl font-black tracking-tight">Risk Disclosure & Disclaimers</h2>
        <div className="prose prose-invert prose-stone max-w-none text-stone-400 leading-relaxed space-y-8">
            <div className="p-8 bg-red-950/20 border border-red-900/30 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-red-500 font-black uppercase tracking-[0.2em] text-[10px]">
                    <AlertCircle size={14} />
                    Absolute Legal Boundary
                </div>
                <h3 className="text-white text-2xl font-bold">Not a Financial Advisor</h3>
                <p className="text-stone-300 font-medium leading-relaxed">
                    DebtAI is <strong>not</strong> a bank, a licensed financial advisor, a debt settlement agency, or a legal firm. The information provided by our AI models is for informational purposes and should be considered mathematical experiments, not direct professional advice.
                </p>
                <p className="text-stone-500 text-sm italic">
                    Always consult with a licensed professional (Accountant, Lawyer, or Certified Financial Planner) before executing high-impact financial maneuvers.
                </p>
            </div>
            <div className="space-y-4">
                <h3 className="text-white text-xl font-bold">Operational Risks</h3>
                <p>Debt reduction strategies (Snowball, Avalanche) are mathematically sound but do not account for unforeseen emergencies, market shifts, or changes in personal liquidity. Execution risk lies entirely with the user.</p>
            </div>
        </div>
    </div>
);
