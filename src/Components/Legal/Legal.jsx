import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Lock, AlertTriangle, Scale } from "lucide-react";

const Legal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("privacy"); // 'privacy' or 'terms'

  return (
    <div className="min-h-screen bg-[#f8ecdd] font-sans text-[#5B2D2D] selection:bg-[#5B2D2D] selection:text-white">
      
      {/* HEADER */}
      <header className="bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-[#5B2D2D]/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-[#5B2D2D]/10 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Legal & Compliance</h1>
          </div>
          <div className="text-sm font-semibold opacity-60 hidden sm:block">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* CRITICAL DISCLAIMER BANNER */}
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-[24px] mb-12 flex flex-col md:flex-row gap-6 items-start shadow-sm">
           <div className="p-3 bg-orange-100 text-orange-600 rounded-full shrink-0">
             <AlertTriangle size={32} />
           </div>
           <div>
             <h3 className="text-xl font-bold text-[#5B2D2D] mb-2">IMPORTANT: Not Financial Advice</h3>
             <p className="text-stone-600 leading-relaxed">
               DebtAI is an artificial intelligence-powered tool designed to assist with financial organization and habit formation. 
               <strong> We are NOT a certified financial planner, advisor, or banking institution.</strong> 
               The strategies, habits, and calculations provided by our AI are for informational purposes only. 
               Always consult with a qualified professional accountant or financial advisor before making major financial decisions, taking out loans, or liquidating assets.
             </p>
           </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-full shadow-sm border border-stone-200 inline-flex">
            <button 
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${activeTab === "privacy" ? "bg-[#5B2D2D] text-white shadow-md" : "text-stone-500 hover:bg-stone-50"}`}
            >
              <Shield size={18} /> Privacy Policy
            </button>
            <button 
              onClick={() => setActiveTab("terms")}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${activeTab === "terms" ? "bg-[#5B2D2D] text-white shadow-md" : "text-stone-500 hover:bg-stone-50"}`}
            >
              <FileText size={18} /> Terms of Service
            </button>
          </div>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-stone-100 min-h-[600px]">
          
          {activeTab === "privacy" && <PrivacyPolicyContent />}
          {activeTab === "terms" && <TermsContent />}

        </div>

        {/* FOOTER */}
        <div className="text-center mt-12 text-[#5B2D2D]/40 text-sm">
          <p>&copy; {new Date().getFullYear()} DebtAI. All rights reserved.</p>
          <p>Operated in Delhi, India.</p>
        </div>

      </main>
    </div>
  );
};

// --- SUB-COMPONENTS FOR CONTENT ---

const PrivacyPolicyContent = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Section title="1. Information We Collect">
      <p>To provide our financial tracking and AI services, we collect the following types of information:</p>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li><strong>Personal Identity:</strong> Name, Email address, and Google Profile picture (via Firebase Auth).</li>
        <li><strong>Financial Data:</strong> Income, expense records, debt details (amounts, interest rates, due dates), and transaction history you manually enter.</li>
        <li><strong>Document Data:</strong> Images of bills or receipts you upload for scanning. These are processed using Azure Computer Vision.</li>
        <li><strong>Usage Data:</strong> How you interact with the dashboard, feature usage, and premium status.</li>
      </ul>
    </Section>

    <Section title="2. How We Use Your Data">
      <p>We strictly use your data for internal app functionality:</p>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li>To calculate debt-free dates and financial health scores.</li>
        <li>To generate AI-powered habits and advice using OpenAI/Azure OpenAI models.</li>
        <li>To process subscription payments via Razorpay.</li>
        <li>To send account-related notifications (we do not sell your email).</li>
      </ul>
    </Section>

    <Section title="3. Third-Party Services & Data Sharing">
      <p>We do not sell your data. However, we share necessary data with trusted infrastructure providers:</p>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li><strong>Google Firebase:</strong> For secure database storage and authentication.</li>
        <li><strong>Microsoft Azure / OpenAI:</strong> Your financial context (anonymized where possible) is sent to LLMs to generate advice.</li>
        <li><strong>Razorpay:</strong> Payment processing. We <strong>do not</strong> store your credit card or bank account numbers on our servers.</li>
      </ul>
    </Section>

    <Section title="4. Data Security">
      <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
        <Lock className="shrink-0 text-emerald-600" size={24} />
        <p className="text-sm">
          We use industry-standard SSL encryption for data transmission. Your database entries are secured by Firebase Security Rules. 
          However, no method of transmission over the internet is 100% secure.
        </p>
      </div>
    </Section>

    <Section title="5. Your Rights (GDPR / DPDP India)">
      <p>You have the right to:</p>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li>Access the personal data we hold about you.</li>
        <li>Request deletion of your account and all associated data ("Right to be Forgotten").</li>
        <li>Opt-out of AI processing (though this limits app functionality).</li>
      </ul>
    </Section>
  </div>
);

const TermsContent = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Section title="1. Acceptance of Terms">
      <p>
        By accessing or using DebtAI, you agree to be bound by these Terms. If you disagree with any part of the terms, 
        you may not access the service. You must be at least 18 years old to use this application.
      </p>
    </Section>

    <Section title="2. Artificial Intelligence Limitations">
      <p>
        DebtAI uses Large Language Models (LLMs) to generate text. You acknowledge that:
      </p>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li><strong>Hallucinations:</strong> AI may occasionally generate incorrect or misleading financial figures.</li>
        <li><strong>No Professional Relationship:</strong> Using this app does not create a fiduciary or financial advisor-client relationship.</li>
        <li><strong>Verification:</strong> You must independently verify any advice (e.g., tax implications, loan terms) before acting on it.</li>
      </ul>
    </Section>

    <Section title="3. Premium Subscriptions & Refunds">
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li><strong>Payments:</strong> We use Razorpay for processing transactions.</li>
        <li><strong>Validity:</strong> Premium plans are valid for 30 days from the date of payment. They do not auto-renew automatically unless explicitly stated.</li>
        <li><strong>Refunds:</strong> Due to the digital nature of the service, all sales are final. We do not offer refunds for partial months used, except where required by law.</li>
      </ul>
    </Section>

    <Section title="4. User Conduct">
      <p>You agree not to:</p>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-600">
        <li>Use the service for money laundering or illegal activities.</li>
        <li>Attempt to reverse engineer the application code.</li>
        <li>Upload malicious files or receipts that are not yours.</li>
      </ul>
    </Section>

    <Section title="5. Limitation of Liability">
      <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100 text-red-800">
        <Scale className="shrink-0" size={24} />
        <p className="text-sm font-bold">
          To the maximum extent permitted by law, DebtAI and its creators shall not be liable for any indirect, incidental, 
          special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
          resulting from your use of the service or reliance on AI advice.
        </p>
      </div>
    </Section>

    <Section title="6. Governing Law">
      <p>
        These Terms shall be governed and construed in accordance with the laws of <strong>India</strong>. 
        Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in <strong>Delhi</strong>.
      </p>
    </Section>
  </div>
);

const Section = ({ title, children }) => (
  <section className="pb-6 border-b border-stone-100 last:border-0">
    <h2 className="text-xl font-bold text-[#5B2D2D] mb-4">{title}</h2>
    <div className="text-stone-600 leading-relaxed text-lg">
      {children}
    </div>
  </section>
);

export default Legal;