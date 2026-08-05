import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitPullRequest, Package, Layers, ShieldCheck, Sparkles, Zap, RefreshCw, 
  ChevronDown, ChevronUp, DollarSign, Activity, FileText, ArrowRight, CheckCircle2 
} from 'lucide-react';
import heroMockup from '../assets/hero_mockup.png';
import useAuthStore from '../store/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Workflow Simulator State
  const [simStage, setSimStage] = useState(1); // 0: Draft, 1: In Review, 2: Pending Approval, 3: Applied
  
  // Interactive Savings Calculator State
  const [bomCount, setBomCount] = useState(25);
  const [ecoFrequency, setEcoFrequency] = useState(10);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const stages = [
    { label: 'Draft', desc: 'Engineer proposes change' },
    { label: 'In Review', desc: 'Cross-functional validation' },
    { label: 'Pending Approval', desc: 'Approver sign-off' },
    { label: 'Applied ✓', desc: 'New version released' },
  ];

  const hoursSaved = Math.round(bomCount * ecoFrequency * 0.75);
  const costSavings = Math.round(hoursSaved * 85);

  const faqs = [
    {
      q: 'How does PLM handle BOM revision control?',
      a: 'PLM automatically increments versions (e.g. Rev A → Rev B) whenever an ECO is approved, archiving older revisions while maintaining full historical diffing capabilities.'
    },
    {
      q: 'Can custom approval stages be configured?',
      a: 'Yes! Admins can define custom approval stages, set required approver roles, and adjust workflow order index dynamically.'
    },
    {
      q: 'Does it support real-time WebSocket collaboration?',
      a: 'Absolutely. All connected clients receive instant Socket.IO updates when ECO stages change or approvals are granted.'
    },
    {
      q: 'Is there built-in AI impact analysis?',
      a: 'Yes, our integrated Google Gemini AI engine automatically scans upstream parent BOMs to report cost deltas and manufacturing risks before changes are applied.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-sienna-500 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sienna-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sienna-600/10 rounded-full blur-3xl" />
      </div>

      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sienna-500 to-sienna-700 flex items-center justify-center shadow-md shadow-sienna-500/20">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">PLM</span>
              <span className="text-xs text-sienna-600 font-bold ml-1.5 px-2.5 py-0.5 rounded-full bg-sienna-50 border border-sienna-200">System</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#features" className="hover:text-sienna-600 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-sienna-600 transition-colors">Workflow Demo</a>
            <a href="#calculator" className="hover:text-sienna-600 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-sienna-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-sienna-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sienna-600 to-sienna-500 hover:from-sienna-500 hover:to-sienna-400 rounded-xl shadow-md shadow-sienna-600/20 transition-all hover:scale-[1.02]"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sienna-600 to-sienna-500 hover:from-sienna-500 hover:to-sienna-400 rounded-xl shadow-md shadow-sienna-600/20 transition-all hover:scale-[1.02]"
                >
                  Get Started Free →
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sienna-50 border border-sienna-200 text-sienna-700 text-xs font-bold tracking-wide uppercase shadow-sm animate-fade-in">
          <Sparkles size={14} className="text-sienna-600" />
          Next-Gen Product Lifecycle & ECO Management
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-5xl mx-auto">
          <span className="text-slate-900 font-extrabold">Architect Hardware with</span> <br className="hidden sm:block" />
          <span className="text-gradient font-extrabold">Intelligent Change Control</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          Accelerate your engineering releases. Seamlessly manage Engineering Change Orders (ECOs), 
          multi-level Bills of Materials (BOMs), revision histories, and real-time AI cost impact analysis in one platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-sienna-600 hover:bg-sienna-500 rounded-xl shadow-xl shadow-sienna-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-sienna-600 hover:bg-sienna-500 rounded-xl shadow-xl shadow-sienna-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all hover:border-slate-400 flex items-center justify-center gap-2"
              >
                Explore Live Demo
              </button>
            </>
          )}
        </div>

        {/* Hero Mockup Frame */}
        <div className="pt-10 max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sienna-400 to-emerald-400 opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
            <div className="h-10 bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-500 font-mono ml-2 font-medium">plm.system/dashboard</span>
            </div>
            <img 
              src={heroMockup} 
              alt="PLM Software Dashboard Mockup" 
              className="w-full h-auto object-cover rounded-b-2xl shadow-inner" 
            />
          </div>
        </div>
      </section>

      {/* 3. Metrics Bar */}
      <section className="relative z-10 py-12 border-y border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-sienna-600">99.9%</p>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">Traceability & Auditability</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">4x</p>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">Faster Approval Cycles</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">100%</p>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">Multi-Level BOM Sync</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-600">Zero</p>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">Costly Scrap Errors</p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Workflow Demo Simulator */}
      <section id="workflow" className="relative z-10 py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sienna-50 border border-sienna-200 text-sienna-700 text-xs font-bold uppercase">
            <RefreshCw size={14} /> Interactive Workflow
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">Experience Modern Change Control</h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Try moving an Engineering Change Order (ECO) through our stage pipeline in real-time.
          </p>
        </div>

        {/* Interactive Simulator Card */}
        <div className="glass-card p-6 sm:p-10 max-w-4xl mx-auto space-y-8 bg-white border border-slate-200 rounded-2xl shadow-xl">
          {/* Pipeline Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stages.map((stg, i) => {
              const isActive = simStage === i;
              const isPassed = simStage > i;
              return (
                <button
                  key={i}
                  onClick={() => setSimStage(i)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    isActive 
                      ? 'bg-sienna-50 border-sienna-500 text-sienna-900 shadow-md' 
                      : isPassed 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stage 0{i + 1}</span>
                    {isPassed ? <CheckCircle2 size={16} className="text-emerald-600" /> : <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-sienna-600 live-pulse' : 'bg-slate-300'}`} />}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{stg.label}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{stg.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Simulated ECO State Display */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sienna-600">ECO-2026-009</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Upgrade Main PCB Microcontroller to Rev B</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                simStage === 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-sienna-100 text-sienna-800 border border-sienna-200'
              }`}>
                {stages[simStage].label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
              <div>
                <p className="text-slate-500 font-medium">Affected Product</p>
                <p className="font-bold text-slate-900">Smart IoT Gateway v2.4</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Proposed Change</p>
                <p className="font-bold text-slate-900">Component Swap: MCU_v1 → MCU_v2 (+15% speed)</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-medium">Click a stage above or use buttons:</span>
              <div className="flex gap-2">
                <button
                  disabled={simStage === 0}
                  onClick={() => setSimStage(prev => Math.max(0, prev - 1))}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={simStage === 3}
                  onClick={() => setSimStage(prev => Math.min(3, prev + 1))}
                  className="px-4 py-1.5 text-xs font-bold bg-sienna-600 hover:bg-sienna-500 rounded-lg text-white disabled:opacity-40 shadow-sm"
                >
                  Advance Stage →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sienna-50 border border-sienna-200 text-sienna-700 text-xs font-bold uppercase">
            <Zap size={14} /> Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">Built for Hardware & Systems Teams</h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Everything you need to orchestrate complex engineering changes with zero manual friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={GitPullRequest}
            title="ECO Kanban & Approval Workflows"
            desc="Drag and drop change orders across stages. Enforce role-based approver sign-offs with mandatory rejection reasons."
            badge="Workflows"
          />
          <FeatureCard 
            icon={Layers}
            title="Multi-Level BOM Trees & Diffing"
            desc="Explore nested component trees, aggregate total cost rollups, and inspect side-by-side revision diffs."
            badge="BOM Management"
          />
          <FeatureCard 
            icon={Sparkles}
            title="Real-Time AI Cost & Risk Engine"
            desc="Leverage integrated Google Gemini AI to automatically calculate cost deltas and manufacturing impact risks."
            badge="AI Intelligence"
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="Role-Based Security (RBAC)"
            desc="Assign explicit permissions for Engineering, Approver, Operations, and Admin roles to safeguard releases."
            badge="Security"
          />
          <FeatureCard 
            icon={Activity}
            title="Instant Socket.IO Live Syncing"
            desc="Collaborate seamlessly. All connected users receive instant live updates as change orders advance."
            badge="Real-Time"
          />
          <FeatureCard 
            icon={FileText}
            title="Export & Compliance Reporting"
            desc="Generate audit trails, printable PDF reports, and structured CSV exports for ISO & regulatory compliance."
            badge="Reporting"
          />
        </div>
      </section>

      {/* 6. Interactive ROI Calculator */}
      <section id="calculator" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="glass-card p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Calculate Your Engineering Time & Cost Savings</h3>
            <p className="text-slate-600 text-sm">See how much time and money PLM saves your hardware team monthly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Number of Active BOM Components</span>
                  <span className="text-sienna-600 font-extrabold">{bomCount} items</span>
                </div>
                <input 
                  type="range" min="5" max="200" value={bomCount} 
                  onChange={(e) => setBomCount(Number(e.target.value))}
                  className="w-full accent-sienna-600 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Monthly Change Orders (ECOs)</span>
                  <span className="text-sienna-600 font-extrabold">{ecoFrequency} ECOs/mo</span>
                </div>
                <input 
                  type="range" min="1" max="50" value={ecoFrequency} 
                  onChange={(e) => setEcoFrequency(Number(e.target.value))}
                  className="w-full accent-sienna-600 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center text-center space-y-3 shadow-inner">
              <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Estimated Monthly Impact</p>
              <div className="text-4xl font-extrabold text-emerald-600">${costSavings.toLocaleString()}</div>
              <p className="text-xs text-slate-600 font-semibold">{hoursSaved} engineering hours saved per month</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pricing Tiers */}
      <section id="pricing" className="relative z-10 py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sienna-50 border border-sienna-200 text-sienna-700 text-xs font-bold uppercase">
            <DollarSign size={14} /> Transparent Plans
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">Simple, Predictable Pricing</h2>
          <p className="text-slate-600 text-base sm:text-lg">Choose the plan that fits your engineering team's scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard 
            title="Starter" 
            price="$0" 
            period="forever free"
            desc="Ideal for individual engineers & small prototype projects."
            features={['Up to 5 Active Products', 'Basic ECO Approval Stage', 'Multi-Level BOM Views', 'CSV Export']}
            buttonText="Get Started Free"
            onClick={() => navigate('/signup')}
          />
          <PricingCard 
            title="Pro Engineer" 
            price="$49" 
            period="per user / month"
            popular
            desc="Full-featured change control for growing hardware teams."
            features={['Unlimited Products & BOMs', 'Multi-Stage Approval Routing', 'AI Cost & Risk Engine', 'Socket.IO Live Syncing', 'Audit Trail Logs']}
            buttonText="Start 14-Day Free Trial"
            onClick={() => navigate('/signup')}
          />
          <PricingCard 
            title="Enterprise" 
            price="Custom" 
            period="billed annually"
            desc="Custom workflows, dedicated support & compliance."
            features={['Custom Approval Stages', 'Dedicated Cloud / On-Premise', '24/7 SLA Support', 'ISO Compliance Audit Exports']}
            buttonText="Contact Sales"
            onClick={() => navigate('/signup')}
          />
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section id="faq" className="relative z-10 py-20 px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm">Everything you need to know about PLM system features.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-base">{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} className="text-sienna-600" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-slate-200 text-sm text-slate-700 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-sienna-950 text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Ready to Transform Your Hardware Workflow?</h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Join engineering teams delivering hardware faster with error-free change control.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="px-9 py-4 text-base font-bold text-white bg-sienna-600 hover:bg-sienna-500 rounded-xl shadow-xl shadow-sienna-600/30 transition-all hover:scale-[1.03]"
            >
              Get Started Free Now →
            </button>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="relative z-10 border-t border-slate-200 py-12 bg-white text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sienna-600 flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="font-bold text-slate-800">PLM Change Control System</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#features" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, badge }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200/90 hover:border-sienna-500/50 hover:shadow-lg transition-all duration-200 group space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-sienna-50 border border-sienna-200 flex items-center justify-center text-sienna-600 group-hover:scale-110 transition-transform">
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">{badge}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-sienna-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, period, desc, features, buttonText, popular, onClick }) {
  return (
    <div className={`p-8 rounded-3xl flex flex-col justify-between space-y-6 relative transition-all ${
      popular 
        ? 'bg-white border-2 border-sienna-500 shadow-xl shadow-sienna-600/10 scale-[1.02]' 
        : 'bg-white border border-slate-200 shadow-xs'
    }`}>
      {popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sienna-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
          Most Popular
        </span>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-slate-900">{price}</span>
          <span className="text-xs text-slate-500 font-semibold">{period}</span>
        </div>

        <ul className="space-y-3 pt-4 border-t border-slate-200 text-xs text-slate-700 font-medium">
          {features.map((feat, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-sienna-600 flex-shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onClick}
        className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all ${
          popular
            ? 'bg-sienna-600 hover:bg-sienna-500 text-white shadow-md shadow-sienna-600/20'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}
