import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import islamicLogo from "@/assets/islamic-logo.png";
import backgroundImage from "@/assets/islamic-Bank-2-min-1.jpg";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response?.user?.role === "user") navigate("/dashboard");
      else if (response?.user?.role === "agent") navigate("/assigned-tickets");
      else if (response?.user?.role === "admin" || response?.user?.role === "super_admin") navigate("/tickets");
      else navigate("/dashboard");
    } catch {}
    finally { setLoading(false); }
  };

  const d = isDark;

  return (
    <div className="min-h-screen flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .login-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .login-heading { font-family: 'Poppins', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .a1 { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.15) 0.05s both; }
        .a2 { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.15) 0.12s both; }
        .a3 { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.15) 0.19s both; }
        .a4 { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.15) 0.26s both; }
        .a5 { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.15) 0.33s both; }
        .a6 { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.15) 0.40s both; }
        .left-panel { animation: fadeIn 0.9s ease both; }

        .field-wrap { position: relative; }

        .field-input {
          width: 100%;
          height: 50px;
          padding: 0 44px 0 46px;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          transition: all 0.2s ease;
          outline: none;
          letter-spacing: 0.01em;
        }

        /* DARK INPUTS */
        .field-input.dark-input {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.09);
          color: #fff;
        }
        .field-input.dark-input::placeholder { color: rgba(255,255,255,0.22); font-weight: 300; }
        .field-input.dark-input:focus {
          background: rgba(255,255,255,0.08);
          border-color: rgba(200,151,58,0.6);
          box-shadow: 0 0 0 3px rgba(200,151,58,0.08);
        }
        .field-input.dark-input:-webkit-autofill,
        .field-input.dark-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(20,5,40,0.98) inset;
          -webkit-text-fill-color: #fff;
        }

        /* LIGHT INPUTS — crisp white with strong borders */
        .field-input.light-input {
          background: #ffffff;
          border: 1.5px solid #d4c4e8;
          color: #1a0530;
          box-shadow: 0 2px 8px rgba(60,10,90,0.08), 0 1px 2px rgba(60,10,90,0.04);
        }
        .field-input.light-input::placeholder { color: #b09cc5; font-weight: 300; }
        .field-input.light-input:focus {
          background: #fff;
          border-color: #C8973A;
          box-shadow: 0 0 0 3px rgba(200,151,58,0.18), 0 2px 8px rgba(60,10,90,0.08);
        }
        .field-input.light-input:-webkit-autofill,
        .field-input.light-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
          -webkit-text-fill-color: #1a0530;
        }

        .field-icon-left {
          position: absolute; left: 15px; top: 50%;
          transform: translateY(-50%);
          width: 17px; height: 17px;
          pointer-events: none;
          transition: color 0.2s;
        }
        .field-icon-right {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.09em;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .sign-btn {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #1a0428;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, #C8973A 0%, #E8B84B 50%, #C8973A 100%);
          background-size: 200% auto;
          box-shadow: 0 4px 18px rgba(200,151,58,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
        }
        .sign-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 28px rgba(200,151,58,0.5);
          transform: translateY(-1px);
        }
        .sign-btn:active:not(:disabled) { transform: translateY(0px); }
        .sign-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .divider-line { height: 1px; }

        .noise {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          background-repeat: repeat; background-size: 128px; opacity: 0.35;
        }

        .float-anim { animation: floatUp 6s ease-in-out infinite; }
        .stat-card { flex: 1; padding: 14px 16px; border-radius: 12px; backdrop-filter: blur(8px); transition: border-color 0.2s; }
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

        /* Light mode stat cards */
        .stat-card-light {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(180,140,220,0.35);
          box-shadow: 0 2px 12px rgba(60,10,90,0.08);
          backdrop-filter: blur(12px);
        }
      `}</style>

      <div className="login-root min-h-screen w-full flex flex-col lg:flex-row" style={{ position: "relative" }}>

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
          style={{ flex: "1 1 55%", minHeight: "100vh" }}
        >
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover", backgroundPosition: "center",
            filter: d ? "brightness(0.38) saturate(0.7)" : "brightness(0.42) saturate(0.65)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: d
              ? "linear-gradient(140deg, rgba(35,6,65,0.92) 0%, rgba(75,12,105,0.55) 45%, rgba(15,3,30,0.95) 100%)"
              : "linear-gradient(140deg, rgba(35,6,65,0.92) 0%, rgba(75,12,105,0.55) 45%, rgba(15,3,30,0.95) 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: d
              ? "linear-gradient(to right, transparent 55%, rgba(12,2,22,0.97) 100%)"
              : "linear-gradient(to right, transparent 55%, rgba(245,238,255,0.97) 100%)",
          }} />
          <div className="noise" />
          <div style={{ position: "absolute", top: "-100px", left: "-100px", width: 350, height: 350, borderRadius: "50%", background: d ? "radial-gradient(circle, rgba(200,151,58,0.10), transparent 70%)" : "radial-gradient(circle, rgba(200,151,58,0.25), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "8%", width: 220, height: 220, borderRadius: "50%", background: d ? "radial-gradient(circle, rgba(100,20,160,0.22), transparent 70%)" : "radial-gradient(circle, rgba(200,151,58,0.15), transparent 70%)", pointerEvents: "none" }} />

          <div className="relative z-10 flex flex-col justify-between h-full p-12">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={islamicLogo} alt="islamic Bank" style={{ width: 64, height: 64, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} />
              <div>
                <p style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.01em", lineHeight: 1 }}>islamic Bank Limited</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, letterSpacing: "0.12em", marginTop: 3, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>IT HELPDESK SYSTEM</p>
              </div>
            </div>

            {/* Headline */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(200,151,58,0.18)", border: "1px solid rgba(200,151,58,0.38)", color: "#E8C870", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 22, fontFamily: "'Inter', sans-serif" }}>
                <ShieldCheck style={{ width: 11, height: 11 }} />
                SECURE PORTAL
              </div>
              <h2 className="login-heading" style={{ color: "#fff", fontSize: "clamp(2rem, 3.2vw, 2.7rem)", lineHeight: 1.18, fontWeight: 800, marginBottom: 14, maxWidth: 420, letterSpacing: "-0.02em" }}>
                Your IT Support,<br />
                <span style={{ color: "#C8973A" }}>Resolved Faster.</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14.5, lineHeight: 1.72, maxWidth: 370, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                A unified helpdesk platform for islamic Bank employees — submit, track, and resolve IT issues with ease.
              </p>
            </div>

            {/* Stats */}
            <div className="float-anim" style={{ display: "flex", gap: 12 }}>
              {[
                { value: "24/7", label: "Support Coverage" },
                { value: "<2h", label: "Avg Response" },
                { value: "99%", label: "Resolution Rate" },
              ].map(stat => (
                <div key={stat.label} className="stat-card" style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}>
                  <p style={{ color: "#C8973A", fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>{stat.value}</p>
                  <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 11, marginTop: 5, letterSpacing: "0.03em", fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ── */}
        <div
          className="flex items-center justify-center relative overflow-hidden"
          style={{
            flex: "1 1 45%", minHeight: "100vh",
            background: d
              ? "linear-gradient(160deg, #160228 0%, #0d011c 55%, #180330 100%)"
              : "linear-gradient(160deg, #f5eeff 0%, #ede0ff 40%, #f7f0ff 100%)",
            transition: "background 0.4s ease",
          }}
        >
          {/* Light mode decorative elements */}
          {!d && <>
            {/* Top-right strong purple orb */}
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,30,122,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
            {/* Bottom-left gold orb */}
            <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,151,58,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
            {/* Center subtle purple glow */}
            <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%) translateY(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,30,122,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
            {/* Decorative top stripe */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #C8973A 30%, #5B1E7A 70%, transparent)", opacity: 0.7, pointerEvents: "none" }} />
          </>}

          {/* Dark mode center glow */}
          {d && <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,12,115,0.28) 0%, transparent 65%)", pointerEvents: "none" }} />}
          
          <div className="noise" />

          <div className="lg:hidden absolute top-8 left-0 right-0 flex justify-center z-20">
            <img src={islamicLogo} alt="islamic Bank" style={{ width: 56, height: 56, objectFit: "contain" }} />
          </div>

          <div className="relative z-10 w-full px-8 py-16" style={{ maxWidth: 420 }}>

            <div className="a1" style={{ marginBottom: 36 }}>
              <h1 className="login-heading" style={{ color: d ? "#fff" : "#1a0530", fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, marginBottom: 8, letterSpacing: "-0.02em" }}>
                Welcome Back
              </h1>
              <p style={{ color: d ? "rgba(255,255,255,0.35)" : "#8060a0", fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                Sign in to access the IT Helpdesk portal
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="a2">
                <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.45)" : "#4a1870" }}>Email Address</label>
                <div className="field-wrap">
                  <input type="email" className={`field-input ${d ? "dark-input" : "light-input"}`} placeholder="you@islamicbank.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Mail className="field-icon-left" style={{ color: email ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                </div>
              </div>

              <div className="a3">
                <label className="field-label" style={{ color: d ? "rgba(255,255,255,0.45)" : "#4a1870" }}>Password</label>
                <div className="field-wrap">
                  <input type={showPassword ? "text" : "password"} className={`field-input ${d ? "dark-input" : "light-input"}`} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <Lock className="field-icon-left" style={{ color: password ? "rgba(200,151,58,0.85)" : d ? "rgba(255,255,255,0.25)" : "#b09cc5" }} />
                  <div className="field-icon-right" onClick={() => setShowPassword(s => !s)} style={{ color: d ? "rgba(255,255,255,0.25)" : "#b09cc5" }}>
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </div>
                </div>
              </div>

              <div className="a4" style={{ marginTop: 4 }}>
                <button type="submit" className="sign-btn" disabled={loading}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? <><Loader2 className="spin" style={{ width: 17, height: 17 }} /> Signing in…</> : <><span>Sign In</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
                  </span>
                </button>
              </div>
            </form>

            <div className="a5" style={{ margin: "28px 0 20px" }}>
              <div className="divider-line" style={{ background: d ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" : "linear-gradient(90deg, transparent, rgba(91,30,122,0.25), transparent)" }} />
            </div>

            <div className="a5" style={{ textAlign: "center" }}>
              <p style={{ color: d ? "rgba(255,255,255,0.32)" : "#8060a0", fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "#C8973A", fontWeight: 600, textDecoration: "none" }}>Create Account</Link>
              </p>
            </div>

            <div className="a6" style={{
              marginTop: 24, display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 11,
              background: d ? "rgba(255,255,255,0.025)" : "rgba(91,30,122,0.07)",
              border: d ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(91,30,122,0.2)",
              boxShadow: d ? "none" : "0 2px 8px rgba(60,10,90,0.06)",
            }}>
              <ShieldCheck style={{ width: 14, height: 14, color: "rgba(200,151,58,0.85)", flexShrink: 0 }} />
              <p style={{ color: d ? "rgba(255,255,255,0.24)" : "#8060a0", fontSize: 11, lineHeight: 1.55, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                Secured with end-to-end encryption. Your credentials are never stored in plaintext.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;