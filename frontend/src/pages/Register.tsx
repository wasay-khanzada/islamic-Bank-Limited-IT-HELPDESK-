import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import islamicLogo from "@/assets/islamic-logo.png";
import backgroundImage from "@/assets/islamic-Bank-2-min-1.jpg";
import {
  Mail, Lock, User, Hash, Building2, Briefcase,
  ArrowRight, Loader2, ShieldCheck, BadgeCheck, Eye, EyeOff, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DEPARTMENTS = [
  { id: 1, name: "IT" },
  { id: 2, name: "HR" },
  { id: 3, name: "Finance" },
  { id: 4, name: "Operations" },
  { id: 5, name: "Branch Banking" },
];

const DESIGNATIONS = [
  "SOII", "SOI", "AMII", "AMI", "AVPII", "AVPI", "VPII", "VPI", "SVPII", "SVPI", "SEVPII", "SEVPI",
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth() as any;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    employeeId: "", branchCode: "", department: "", designation: "",
  });

  const set = (field: string, value: string) =>
    setForm(p => ({ ...p, [field]: value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error("Full name is required"); return; }
    if (!form.email.trim())       { toast.error("Email is required"); return; }
    if (!form.password)           { toast.error("Password is required"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId.trim()) { toast.error("Employee ID is required"); return; }
    if (!form.branchCode.trim()) { toast.error("Branch code is required"); return; }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        employeeId: form.employeeId,
        branchCode: form.branchCode,
        departmentId: Number(form.department),
        designation: form.designation,
      });
      toast.success("Registration submitted! Awaiting approval.");
      navigate("/login");
    } catch {}
    finally { setLoading(false); }
  };

  const d = isDark;

  return (
    <div className="min-h-screen flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .reg-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .reg-heading { font-family: 'Poppins', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .ra1 { animation: slideUp 0.45s cubic-bezier(.22,.68,0,1.15) 0.04s both; }
        .ra2 { animation: slideUp 0.45s cubic-bezier(.22,.68,0,1.15) 0.10s both; }
        .ra3 { animation: slideUp 0.45s cubic-bezier(.22,.68,0,1.15) 0.16s both; }
        .ra4 { animation: slideUp 0.45s cubic-bezier(.22,.68,0,1.15) 0.22s both; }
        .ra5 { animation: slideUp 0.45s cubic-bezier(.22,.68,0,1.15) 0.28s both; }
        .ra6 { animation: slideUp 0.45s cubic-bezier(.22,.68,0,1.15) 0.34s both; }
        .step-in { animation: stepIn 0.35s cubic-bezier(.22,.68,0,1.15) both; }
        .left-panel { animation: fadeIn 0.9s ease both; }

        /* DARK INPUTS */
        .reg-input {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 46px;
          border-radius: 12px;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          transition: all 0.2s ease;
          outline: none;
          letter-spacing: 0.01em;
        }

        .reg-input.dark-input {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.09);
          color: #fff;
        }
        .reg-input.dark-input::placeholder { color: rgba(255,255,255,0.2); font-weight: 300; }
        .reg-input.dark-input:focus {
          background: rgba(255,255,255,0.075);
          border-color: rgba(200,151,58,0.55);
          box-shadow: 0 0 0 3px rgba(200,151,58,0.07);
        }
        .reg-input.dark-input:-webkit-autofill,
        .reg-input.dark-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(20,4,38,0.99) inset;
          -webkit-text-fill-color: #fff;
        }

        /* LIGHT INPUTS — crisp white with strong definition */
        .reg-input.light-input {
          background: #ffffff;
          border: 1.5px solid #d4c4e8;
          color: #1a0530;
          box-shadow: 0 2px 8px rgba(60,10,90,0.08), 0 1px 2px rgba(60,10,90,0.04);
        }
        .reg-input.light-input::placeholder { color: #b09cc5; font-weight: 300; }
        .reg-input.light-input:focus {
          background: #fff;
          border-color: #C8973A;
          box-shadow: 0 0 0 3px rgba(200,151,58,0.18), 0 2px 8px rgba(60,10,90,0.08);
        }
        .reg-input.light-input:-webkit-autofill,
        .reg-input.light-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
          -webkit-text-fill-color: #1a0530;
        }

        /* DARK SELECTS */
        .reg-select {
          width: 100%;
          height: 48px;
          padding: 0 36px 0 46px;
          border-radius: 12px;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          transition: all 0.2s ease;
          outline: none;
          appearance: none;
          cursor: pointer;
        }

        .reg-select.dark-select {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.65);
        }
        .reg-select.dark-select:focus {
          background: rgba(255,255,255,0.075);
          border-color: rgba(200,151,58,0.55);
          box-shadow: 0 0 0 3px rgba(200,151,58,0.07);
          color: rgba(255,255,255,0.9);
        }
        .reg-select.dark-select option { background: #130225; color: #fff; }

        /* LIGHT SELECTS — clean white */
        .reg-select.light-select {
          background: #ffffff;
          border: 1.5px solid #d4c4e8;
          color: #8060a0;
          box-shadow: 0 2px 8px rgba(60,10,90,0.08), 0 1px 2px rgba(60,10,90,0.04);
        }
        .reg-select.light-select:focus {
          background: #fff;
          border-color: #C8973A;
          box-shadow: 0 0 0 3px rgba(200,151,58,0.18), 0 2px 8px rgba(60,10,90,0.08);
          color: #1a0530;
        }
        .reg-select.light-select option { background: #fff; color: #1a0530; }

        .field-icon-l {
          position: absolute; left: 15px; top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          pointer-events: none;
          transition: color 0.2s;
        }
        .field-icon-r {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          width: 15px; height: 15px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .field-icon-r.chevron { pointer-events: none; }

        .field-label {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.09em;
          margin-bottom: 7px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .submit-btn {
          height: 50px;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #1a0428;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, #C8973A 0%, #E8B84B 50%, #C8973A 100%);
          background-size: 200% auto;
          box-shadow: 0 4px 18px rgba(200,151,58,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
          flex: 2;
        }
        .submit-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 26px rgba(200,151,58,0.5);
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .step-dot { height: 6px; border-radius: 3px; transition: all 0.35s cubic-bezier(.22,.68,0,1.2); }

        .noise {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          background-repeat: repeat; background-size: 128px; opacity: 0.35;
        }

        .float-anim { animation: floatUp 6s ease-in-out infinite; }
        .spin { animation: spin 1s linear infinite; }

        /* ── PILL TOGGLE ── */
        .tt-wrap { position: absolute; top: 20px; right: 20px; z-index: 50; }
        .tt-pill {
          position: relative;
          display: flex;
          align-items: center;
          width: 72px;
          height: 34px;
          border-radius: 999px;
          padding: 3px;
          cursor: pointer;
          border: none;
          transition: background 0.35s ease, box-shadow 0.35s ease;
        }
        .tt-pill.is-dark {
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 2px 14px rgba(0,0,0,0.28);
        }
        .tt-pill.is-light {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(180,140,220,0.4);
          box-shadow: 0 2px 14px rgba(60,10,90,0.15);
        }
        .tt-thumb {
          position: absolute;
          width: 27px; height: 27px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), background 0.35s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.22);
          left: 3px;
        }
        .tt-thumb.is-dark {
          background: linear-gradient(135deg,#C8973A,#E8B84B);
          transform: translateX(0px);
        }
        .tt-thumb.is-light {
          background: linear-gradient(135deg,#5B1E7A,#7B3A9E);
          transform: translateX(38px);
        }
        .tt-icons {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 0 6px;
          pointer-events: none; position: relative; z-index: 1;
        }
      `}</style>

      <div className="reg-root min-h-screen w-full flex flex-col lg:flex-row" style={{ position: "relative" }}>

        {/* ── PILL THEME TOGGLE ── */}
        <div className="tt-wrap">
          <button
            className={`tt-pill ${d ? "is-dark" : "is-light"}`}
            onClick={() => setIsDark(v => !v)}
            title={d ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className={`tt-thumb ${d ? "is-dark" : "is-light"}`}>
              {d
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a0428" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </div>
            <div className="tt-icons">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={d ? "rgba(200,151,58,0.85)" : "rgba(91,30,122,0.28)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={d ? "rgba(255,255,255,0.22)" : "rgba(91,30,122,0.75)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
          </button>
        </div>

        {/* ── LEFT PANEL ── */}
        <div
          className="left-panel hidden lg:flex flex-col justify-between relative overflow-hidden"
          style={{ flex: "1 1 48%", minHeight: "100vh" }}
        >
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover", backgroundPosition: "center",
            filter: d ? "brightness(0.38) saturate(0.7)" : "brightness(0.38) saturate(0.7)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(140deg, rgba(35,6,65,0.92) 0%, rgba(75,12,105,0.55) 45%, rgba(15,3,30,0.95) 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: d
              ? "linear-gradient(to right, transparent 52%, rgba(12,2,22,0.97) 100%)"
              : "linear-gradient(to right, transparent 52%, rgba(245,238,255,0.97) 100%)",
          }} />
          <div className="noise" />
          <div style={{ position: "absolute", top: "-80px", left: "-80px", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,151,58,0.12), transparent 70%)", pointerEvents: "none" }} />

          <div className="relative z-10 flex flex-col justify-between h-full p-12">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={islamicLogo} alt="islamic Bank" style={{ width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} />
              <div>
                <p style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, lineHeight: 1 }}>islamic Bank Limited</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, letterSpacing: "0.12em", marginTop: 3, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>IT HELPDESK SYSTEM</p>
              </div>
            </div>

            {/* Headline */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(200,151,58,0.18)", border: "1px solid rgba(200,151,58,0.38)", color: "#E8C870", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 22, fontFamily: "'Inter', sans-serif" }}>
                <BadgeCheck style={{ width: 11, height: 11 }} />
                EMPLOYEE REGISTRATION
              </div>
              <h2 className="reg-heading" style={{ color: "#fff", fontSize: "clamp(1.9rem, 2.8vw, 2.5rem)", lineHeight: 1.2, fontWeight: 800, marginBottom: 14, maxWidth: 380, letterSpacing: "-0.02em" }}>
                Join the<br />
                <span style={{ color: "#C8973A" }}>Helpdesk Network.</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.72, maxWidth: 340, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                Register with your official islamic Bank credentials. Your account will be reviewed and approved by an administrator.
              </p>
            </div>

            {/* Steps */}
            <div className="float-anim" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { n: 1, label: "Account Credentials", desc: "Name, email & password" },
                { n: 2, label: "Employee Details", desc: "ID, branch & department" },
                { n: 3, label: "Admin Approval", desc: "Review within 24 hours" },
              ].map(item => (
                <div
                  key={item.n}
                  style={{
                    display: "flex", alignItems: "center", gap: 13,
                    padding: "11px 15px", borderRadius: 11,
                    background: step === item.n
                      ? "rgba(200,151,58,0.10)"
                      : "rgba(255,255,255,0.05)",
                    border: step === item.n
                      ? "1px solid rgba(200,151,58,0.25)"
                      : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: item.n < step ? "rgba(200,151,58,0.9)" : item.n === step ? "rgba(200,151,58,0.18)" : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${item.n <= step ? "rgba(200,151,58,0.45)" : "rgba(255,255,255,0.10)"}`,
                    color: item.n < step ? "#1a0428" : item.n === step ? "#C8973A" : "rgba(255,255,255,0.32)",
                    fontSize: 11.5, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                  }}>
                    {item.n < step ? "✓" : item.n}
                  </div>
                  <div>
                    <p style={{ color: item.n <= step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{item.label}</p>
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, marginTop: 2, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ── */}
        <div
          className="flex items-center justify-center relative overflow-hidden"
          style={{
            flex: "1 1 52%", minHeight: "100vh",
            background: d
              ? "linear-gradient(160deg, #160228 0%, #0d011c 55%, #180330 100%)"
              : "linear-gradient(160deg, #f5eeff 0%, #ede0ff 40%, #f7f0ff 100%)",
            transition: "background 0.4s ease",
          }}
        >
          {/* Light mode decorative elements */}
          {!d && <>
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,30,122,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,151,58,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #C8973A 30%, #5B1E7A 70%, transparent)", opacity: 0.7, pointerEvents: "none" }} />
          </>}

          {/* Dark mode glow */}
          {d && <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,12,115,0.28) 0%, transparent 65%)", pointerEvents: "none" }} />}
          
          <div className="noise" />

          <div className="lg:hidden absolute top-8 left-0 right-0 flex justify-center z-20">
            <img src={islamicLogo} alt="islamic Bank" style={{ width: 56, height: 56, objectFit: "contain" }} />
          </div>

          <div className="relative z-10 w-full px-8 py-14" style={{ maxWidth: 450 }}>

            {/* Header */}
            <div className="ra1" style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <h1 className="reg-heading" style={{ color: d ? "#fff" : "#1a0530", fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {step === 1 ? "Create Account" : "Employee Info"}
                </h1>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <div className="step-dot" style={{ width: step === 1 ? 22 : 7, background: step >= 1 ? "#C8973A" : d ? "rgba(255,255,255,0.15)" : "rgba(91,30,122,0.2)" }} />
                  <div className="step-dot" style={{ width: step === 2 ? 22 : 7, background: step >= 2 ? "#C8973A" : d ? "rgba(255,255,255,0.15)" : "rgba(91,30,122,0.2)" }} />
                </div>
              </div>
              <p style={{ color: d ? "rgba(255,255,255,0.32)" : "#8060a0", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                {step === 1 ? "Step 1 of 2 — Account credentials" : "Step 2 of 2 — Employee details"}
              </p>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form key="step1" className="step-in" onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="ra2">
                  <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <input className={`reg-input ${d ? "dark-input" : "light-input"}`} type="text" placeholder="Abdul Wasay" value={form.name} onChange={e => set("name", e.target.value)} required />
                    <User className="field-icon-l" style={{ color: form.name ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                  </div>
                </div>

                <div className="ra3">
                  <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Official Email</label>
                  <div style={{ position: "relative" }}>
                    <input className={`reg-input ${d ? "dark-input" : "light-input"}`} type="email" placeholder="you@islamicbank.com" value={form.email} onChange={e => set("email", e.target.value)} required />
                    <Mail className="field-icon-l" style={{ color: form.email ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                  </div>
                </div>

                <div className="ra4">
                  <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input className={`reg-input ${d ? "dark-input" : "light-input"}`} type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
                    <Lock className="field-icon-l" style={{ color: form.password ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                    <div className="field-icon-r" onClick={() => setShowPassword(s => !s)} style={{ color: d ? "rgba(255,255,255,0.25)" : "#b09cc5" }}>
                      {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </div>
                  </div>
                </div>

                <div className="ra5">
                  <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input className={`reg-input ${d ? "dark-input" : "light-input"}`} type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} required />
                    <Lock className="field-icon-l" style={{ color: form.confirmPassword ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                    <div className="field-icon-r" onClick={() => setShowConfirm(s => !s)} style={{ color: d ? "rgba(255,255,255,0.25)" : "#b09cc5" }}>
                      {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </div>
                  </div>
                </div>

                <div className="ra6" style={{ marginTop: 4 }}>
                  <button type="submit" className="submit-btn" style={{ width: "100%", flex: "unset" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      Continue <ArrowRight style={{ width: 16, height: 16 }} />
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form key="step2" className="step-in" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="ra2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Employee ID</label>
                    <div style={{ position: "relative" }}>
                      <input className={`reg-input ${d ? "dark-input" : "light-input"}`} type="text" placeholder="42478" value={form.employeeId} onChange={e => set("employeeId", e.target.value)} required />
                      <Hash className="field-icon-l" style={{ color: form.employeeId ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                    </div>
                  </div>
                  <div>
                    <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Branch Code</label>
                    <div style={{ position: "relative" }}>
                      <input className={`reg-input ${d ? "dark-input" : "light-input"}`} type="text" placeholder="KHI-001" value={form.branchCode} onChange={e => set("branchCode", e.target.value)} required />
                      <Building2 className="field-icon-l" style={{ color: form.branchCode ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                    </div>
                  </div>
                </div>

                <div className="ra3">
                  <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Department</label>
                  <div style={{ position: "relative" }}>
                    <select className={`reg-select ${d ? "dark-select" : "light-select"}`} value={form.department} onChange={e => set("department", e.target.value)}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                    </select>
                    <Building2 className="field-icon-l" style={{ color: form.department ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                    <ChevronDown className="field-icon-r chevron" style={{ color: d ? "rgba(255,255,255,0.3)" : "#b09cc5" }} />
                  </div>
                </div>

                <div className="ra4">
                  <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.42)" : "#4a1870" }}>Designation</label>
                  <div style={{ position: "relative" }}>
                    <select className={`reg-select ${d ? "dark-select" : "light-select"}`} value={form.designation} onChange={e => set("designation", e.target.value)}>
                      <option value="">Select designation</option>
                      {DESIGNATIONS.map(des => <option key={des} value={des}>{des}</option>)}
                    </select>
                    <Briefcase className="field-icon-l" style={{ color: form.designation ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                    <ChevronDown className="field-icon-r chevron" style={{ color: d ? "rgba(255,255,255,0.3)" : "#b09cc5" }} />
                  </div>
                </div>

                <div className="ra5" style={{
                  display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", borderRadius: 11,
                  background: d ? "rgba(200,151,58,0.06)" : "rgba(91,30,122,0.07)",
                  border: d ? "1px solid rgba(200,151,58,0.16)" : "1px solid rgba(91,30,122,0.2)",
                  boxShadow: d ? "none" : "0 2px 8px rgba(60,10,90,0.06)",
                }}>
                  <ShieldCheck style={{ width: 14, height: 14, color: "rgba(200,151,58,0.85)", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: d ? "rgba(255,255,255,0.38)" : "#8060a0", fontSize: 11.5, lineHeight: 1.6, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                    Your registration will be reviewed and approved by an IT admin within 24 hours.
                  </p>
                </div>

                <div className="ra6" style={{ display: "flex", gap: 10, marginTop: 2 }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    style={{
                      height: 50, flex: 1,
                      background: d ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                      border: d ? "1.5px solid rgba(255,255,255,0.09)" : "1.5px solid #d4c4e8",
                      borderRadius: 12,
                      color: d ? "rgba(255,255,255,0.5)" : "#5B1E7A",
                      fontSize: 13,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: d ? "none" : "0 2px 8px rgba(60,10,90,0.08)",
                    }}
                  >
                    ← Back
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {loading
                        ? <><Loader2 className="spin" style={{ width: 16, height: 16 }} /> Creating…</>
                        : <><span>Create Account</span><ArrowRight style={{ width: 16, height: 16 }} /></>
                      }
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Divider + login link */}
            <div style={{ marginTop: 28 }}>
              <div style={{ height: 1, background: d ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" : "linear-gradient(90deg, transparent, rgba(91,30,122,0.25), transparent)", marginBottom: 20 }} />
              <p style={{ textAlign: "center", color: d ? "rgba(255,255,255,0.3)" : "#8060a0", fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#C8973A", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;