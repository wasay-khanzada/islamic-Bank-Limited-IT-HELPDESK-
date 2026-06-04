import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  Ticket, Clock, CheckCircle2, Users, TrendingUp,
  BarChart3, Loader2, PlusCircle, Eye,
  AlertCircle, ArrowUpRight, Activity, Shield,
  Target, Zap, Timer,
} from "lucide-react";
import { ticketApi, Ticket as TicketType } from "@/api/ticketApi";
import { adminApi } from "@/api/adminApi";
import { userApi, PendingUser } from "@/api/userApi";
import { toast } from "sonner";

/* ── Dark-mode token hook ─────────────────────────────── */
const useDarkTokens = (isDark: boolean) => ({
  bg:           isDark ? "#0f0720"       : "#ffffff",
  bgSubtle:     isDark ? "#160a2a"       : "#faf7ff",
  surface:      isDark ? "#1a0d30"       : "#ffffff",
  surfaceHover: isDark ? "#22103c"       : "rgba(243,233,251,0.45)",
  border:       isDark ? "rgba(139,92,192,0.18)" : "rgba(90,14,122,0.09)",
  borderStrong: isDark ? "rgba(139,92,192,0.30)" : "rgba(90,14,122,0.18)",
  text:         isDark ? "#e8d5f8"       : "#1a0630",
  textMuted:    isDark ? "#a78cc0"       : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"       : "#C3A8D8",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(90,14,122,0.06), 0 4px 16px rgba(90,14,122,0.04)",
  shadowLg:     isDark
    ? "0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)"
    : "0 2px 12px rgba(90,14,122,0.08), 0 1px 3px rgba(90,14,122,0.05)",
  inputBg:      isDark ? "#160a2a"       : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)" : "hsl(280 20% 88%)",
  skeleton:     isDark ? "#1a0d30"       : "#f3eefb",
  headerGrad:   isDark
    ? "linear-gradient(135deg,rgba(243,233,251,0.05) 0%,rgba(255,255,255,0) 70%)"
    : "linear-gradient(135deg,rgba(243,233,251,0.7) 0%,rgba(255,255,255,0) 70%)",
  tableHead:    isDark ? "rgba(139,92,192,0.08)" : "rgba(242,242,242,0.6)",
});

/* ── Color Palette ─────────────────────────────────────── */
const C = {
  darkPurple:  "#5A0E7A",
  purple:      "#7B2CBF",
  green:       "#029F62",
  lightPurple: "#A06CD5",
  lavender:    "#CDB4DB",
  lightGray:   "#F2F2F2",
};

const norm = (v?: string) => v?.toLowerCase().replace(/_/g, "-") || "";

/* ── Waving Hand ───────────────────────────────────────── */
const WavingHand = () => (
  <span className="inline-block" style={{ animation: "wave 2.5s ease-in-out infinite", transformOrigin: "70% 70%", display: "inline-block" }}>
    👋
    <style>{`@keyframes wave{0%{transform:rotate(0deg)}10%{transform:rotate(-10deg)}20%{transform:rotate(12deg)}30%{transform:rotate(-10deg)}40%{transform:rotate(9deg)}50%{transform:rotate(0deg)}100%{transform:rotate(0deg)}}`}</style>
  </span>
);

/* ── Status / Priority Pills ───────────────────────────── */
const statusCfg: Record<string, { label: string; dot: string; bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string }> = {
  open:          { label:"Open",        dot:"#8b5cf6", bg:"rgba(90,14,122,0.10)",   text:"#5A0E7A",  border:"rgba(90,14,122,0.22)",   darkBg:"rgba(139,92,192,0.18)", darkText:"#c4b5fd", darkBorder:"rgba(139,92,192,0.35)" },
  "in-progress": { label:"In Progress", dot:"#a78bfa", bg:"rgba(123,44,191,0.10)",  text:"#7B2CBF",  border:"rgba(123,44,191,0.22)",  darkBg:"rgba(167,139,250,0.15)", darkText:"#c4b5fd", darkBorder:"rgba(167,139,250,0.30)" },
  resolved:      { label:"Resolved",    dot:"#c4b5fd", bg:"rgba(160,108,213,0.10)", text:"#A06CD5",  border:"rgba(160,108,213,0.22)", darkBg:"rgba(196,181,253,0.12)", darkText:"#ddd6fe", darkBorder:"rgba(196,181,253,0.25)" },
  closed:        { label:"Closed",      dot:"#9CA3AF", bg:"rgba(205,180,219,0.18)", text:"#6B7280",  border:"rgba(205,180,219,0.40)", darkBg:"rgba(107,114,128,0.15)", darkText:"#9ca3af", darkBorder:"rgba(107,114,128,0.30)" },
};
const priorityCfg: Record<string, { label: string; bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string }> = {
  critical: { label:"Critical", bg:"#5A0E7A",             text:"#fff",        border:"#5A0E7A",             darkBg:"rgba(139,92,192,0.25)", darkText:"#e9d5ff", darkBorder:"rgba(139,92,192,0.45)" },
  urgent:   { label:"Urgent",   bg:"#5A0E7A",             text:"#fff",        border:"#5A0E7A",             darkBg:"rgba(139,92,192,0.25)", darkText:"#e9d5ff", darkBorder:"rgba(139,92,192,0.45)" },
  high:     { label:"High",     bg:"#7B2CBF",             text:"#fff",        border:"#7B2CBF",             darkBg:"rgba(123,44,191,0.25)", darkText:"#d8b4fe", darkBorder:"rgba(123,44,191,0.45)" },
  medium:   { label:"Medium",   bg:"rgba(160,108,213,0.18)", text:"#A06CD5", border:"rgba(160,108,213,0.35)", darkBg:"rgba(160,108,213,0.18)", darkText:"#c4b5fd", darkBorder:"rgba(160,108,213,0.35)" },
  low:      { label:"Low",      bg:"rgba(205,180,219,0.22)", text:"#8B5CF6", border:"rgba(205,180,219,0.45)", darkBg:"rgba(139,92,192,0.12)", darkText:"#a78bfa", darkBorder:"rgba(139,92,192,0.25)" },
};

export const StatusPill = ({ status, isDark }: { status: string; isDark?: boolean }) => {
  const s = statusCfg[norm(status)] || statusCfg.open;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: isDark ? s.darkBg : s.bg, color: isDark ? s.darkText : s.text, border: `1px solid ${isDark ? s.darkBorder : s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />{s.label}
    </span>
  );
};
export const PriorityPill = ({ priority, isDark }: { priority: string; isDark?: boolean }) => {
  const p = priorityCfg[norm(priority)] || priorityCfg.medium;
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: isDark ? p.darkBg : p.bg, color: isDark ? p.darkText : p.text, border: `1px solid ${isDark ? p.darkBorder : p.border}` }}>
      {p.label}
    </span>
  );
};

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOURS = ["00","02","04","06","08","10","12","14","16","18","20","22"];

/* ── KPI Stat Card ─────────────────────────────────────── */
interface StatCardProps {
  title: string; value: string|number; icon: React.ElementType;
  accent: string; sub?: string; trend?: string; trendUp?: boolean; delay?: number; isDark?: boolean;
}
const StatCard = ({ title, value, icon:Icon, accent, sub, trend, trendUp=true, delay=0, isDark=false }: StatCardProps) => {
  const T = useDarkTokens(isDark);
  return (
    <div style={{ animationDelay:`${delay}ms` }}>
      <div className="relative overflow-hidden rounded-[14px] cursor-default transition-colors duration-300"
        style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadow, borderTop:`3px solid ${accent}` }}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: T.textMuted }}>{title}</p>
              <p className="text-[2.1rem] font-extrabold mt-1 leading-none tracking-tight" style={{ color: T.text }}>{value}</p>
              {sub && <p className="text-[12px] mt-1.5" style={{ color: T.textMuted }}>{sub}</p>}
              {trend && (
                <p className="text-[12px] mt-1.5 flex items-center gap-1 font-semibold" style={{ color:trendUp?"#10B981":"#EF4444" }}>
                  <TrendingUp className="h-3.5 w-3.5" style={{ transform:trendUp?"":"rotate(180deg) scaleX(-1)" }}/>{trend}
                </p>
              )}
            </div>
            <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ background:`${accent}22` }}>
              <Icon className="h-5 w-5" style={{ color:accent }}/>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg, ${accent}40, transparent)` }}/>
      </div>
    </div>
  );
};

/* ── Line Chart ────────────────────────────────────────── */
const bezierPath = (pts: [number, number][]): string => {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cpx = (x0 + x1) / 2;
    d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
  }
  return d;
};

interface LineChartProps { data: number[][]; labels: string[]; series: { label: string; color: string }[]; title: string; subtitle?: string; isDark?: boolean; }
const LineChart = ({ data, labels, series, title, subtitle, isDark=false }: LineChartProps) => {
  const T = useDarkTokens(isDark);
  const W=540, H=205, PL=44, PR=20, PT=16, PB=42;
  const cW=W-PL-PR, cH=H-PT-PB;
  const allVals = data.flat();
  const maxV = Math.max(...allVals, 1);
  const xp = (i: number): number => PL + (i / Math.max(labels.length-1,1)) * cW;
  const yp = (v: number): number => PT + cH - (v / maxV) * cH;
  const gridCount = 4;
  const step = Math.ceil(maxV / gridCount / 5) * 5 || 1;
  const gridVals = Array.from({ length:gridCount+1 }, (_,i) => i*step);

  return (
    <div className="rounded-[16px] overflow-hidden transition-colors duration-300"
      style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadowLg }}>
      <div className="px-5 pt-5 pb-2" style={{ background: T.headerGrad }}>
        <h3 className="text-[14px] font-bold" style={{ color: T.text }}>{title}</h3>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
      </div>
      <div className="px-1 pb-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height:190 }}>
          <defs>
            {series.map((s,si) => (
              <linearGradient key={si} id={`lg-d-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={s.color} stopOpacity={isDark?"0.28":"0.20"}/>
                <stop offset="70%"  stopColor={s.color} stopOpacity="0.04"/>
                <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
              </linearGradient>
            ))}
          </defs>
          {gridVals.map((v,i) => (
            <g key={i}>
              <line x1={PL} y1={yp(v)} x2={W-PR} y2={yp(v)} stroke={isDark?"rgba(139,92,192,0.12)":"rgba(160,108,213,0.09)"} strokeWidth="1" strokeDasharray="4 5"/>
              <text x={PL-9} y={yp(v)+4} fontSize="8.5" fill={T.textFaint} textAnchor="end" fontWeight="500">{v}</text>
            </g>
          ))}
          {labels.map((l,i) => (
            <text key={i} x={xp(i)} y={PT+cH+18} fontSize="9.5" fill={T.textFaint} textAnchor="middle" fontWeight="500">{l}</text>
          ))}
          {data.map((d,si) => {
            const pts: [number,number][] = d.map((v,i) => [xp(i), yp(v)]);
            const linePd = bezierPath(pts);
            const baseY = PT + cH;
            const areaPd = pts.length > 0 ? `${linePd} L${xp(pts.length-1)},${baseY} L${xp(0)},${baseY} Z` : "";
            return (
              <g key={si}>
                <path d={areaPd} fill={`url(#lg-d-${si})`}/>
                <path d={linePd} fill="none" stroke={series[si]?.color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            );
          })}
          {data.map((d,si) => d.map((v,i) => (
            <g key={`${si}-${i}`}>
              <circle cx={xp(i)} cy={yp(v)} r="7.5" fill={series[si]?.color} opacity="0.12"/>
              <circle cx={xp(i)} cy={yp(v)} r="4.5" fill={isDark ? "#1a0d30" : "white"} stroke={series[si]?.color} strokeWidth="2.3"/>
              <circle cx={xp(i)} cy={yp(v)} r="1.8" fill={series[si]?.color}/>
            </g>
          )))}
        </svg>
      </div>
      <div className="flex items-center justify-center gap-7 py-3.5 border-t" style={{ borderColor: T.border }}>
        {series.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <svg width="24" height="10" viewBox="0 0 24 10">
              <line x1="0" y1="5" x2="24" y2="5" stroke={s.color} strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="5" r="3.2" fill={isDark ? "#1a0d30" : "white"} stroke={s.color} strokeWidth="2.1"/>
            </svg>
            <span className="text-[11px] font-medium" style={{ color: T.textMuted }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Donut Chart ───────────────────────────────────────── */
interface DonutSegment { label: string; value: number; color: string; }
const DonutChart = ({ segments, title, subtitle, centerLabel, isDark=false }: {
  segments: DonutSegment[]; title: string; subtitle?: string; centerLabel?: string; isDark?: boolean;
}) => {
  const T = useDarkTokens(isDark);
  const [hovered, setHovered] = useState<number|null>(null);
  const total = segments.reduce((s,d) => s+d.value, 0) || 1;
  const R=58, cx=90, cy=90, sw=20;
  const circ = 2*Math.PI*R;
  let off = 0;
  const arcs = segments.map((seg,idx) => {
    const dash = (seg.value/total)*circ;
    const arc  = { ...seg, dash, gap:circ-dash, offset:off, idx };
    off += dash;
    return arc;
  });
  const pct = (v: number) => total > 0 ? `${Math.round((v/total)*100)}%` : "0%";

  return (
    <div className="rounded-[16px] overflow-hidden transition-colors duration-300"
      style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadowLg }}>
      <div className="px-5 pt-5 pb-2" style={{ background: T.headerGrad }}>
        <h3 className="text-[14px] font-bold" style={{ color: T.text }}>{title}</h3>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-center gap-4 mt-2">
          <div className="shrink-0" style={{ width:180, height:180 }}>
            <svg viewBox="0 0 180 180" width="180" height="180">
              <circle cx={cx} cy={cy} r={R} fill="none" stroke={isDark?"rgba(139,92,192,0.15)":"#F0EBF7"} strokeWidth={sw+3}/>
              {arcs.map((arc,i) => {
                const isHov = hovered===i;
                return (
                  <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={arc.color}
                    strokeWidth={isHov ? sw+6 : sw}
                    strokeDasharray={`${arc.dash} ${arc.gap}`}
                    strokeDashoffset={-arc.offset}
                    style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px`, transition:"stroke-width 0.18s ease, opacity 0.18s", opacity: hovered!==null && !isHov ? 0.3 : 1, cursor:"pointer" }}
                    onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              {hovered !== null ? (
                <g>
                  <text x={cx} y={cy-10} textAnchor="middle" fontSize="21" fontWeight="800" fill={arcs[hovered]?.color}>{pct(arcs[hovered]?.value??0)}</text>
                  <text x={cx} y={cy+8}  textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontWeight="600">{arcs[hovered]?.label}</text>
                  <text x={cx} y={cy+23} textAnchor="middle" fontSize="12" fontWeight="700" fill={T.text}>{arcs[hovered]?.value}</text>
                </g>
              ) : (
                <g>
                  <text x={cx} y={cy-5} textAnchor="middle" fontSize="28" fontWeight="800" fill={T.text}>{total}</text>
                  <text x={cx} y={cy+15} textAnchor="middle" fontSize="9" fill={T.textMuted} fontWeight="600" letterSpacing="0.05em">
                    {(centerLabel||"TOTAL").toUpperCase()}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {segments.map((seg,i) => {
              const isHov  = hovered===i;
              const barPct = Math.round((seg.value/total)*100);
              return (
                <div key={i} className="rounded-[9px] px-3 py-2 transition-all cursor-default"
                  style={{ background:isHov?`${seg.color}18`:isDark?"rgba(255,255,255,0.03)":"rgba(250,248,253,0.8)", border:`1px solid ${isHov?`${seg.color}30`:T.border}` }}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background:seg.color }}/>
                      <span className="text-[11px] font-medium truncate" style={{ color: isDark?"#c4b5fd":"#374151" }}>{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-semibold" style={{ color:seg.color }}>{barPct}%</span>
                      <span className="text-[12px] font-bold" style={{ color: T.text }}>{seg.value}</span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background:`${seg.color}20` }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width:`${barPct}%`, background:seg.color }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Bar Chart ─────────────────────────────────────────── */
interface BarDatum { label: string; value: number; color?: string; }
const BAR_COLORS = [C.darkPurple, C.purple, C.lightPurple, C.lavender, "#9B59B6", "#C39BD3"];

const BarChart = ({ data, title, subtitle, horizontal=false, isDark=false }: {
  data: BarDatum[]; title: string; subtitle?: string; horizontal?: boolean; isDark?: boolean;
}) => {
  const T = useDarkTokens(isDark);
  const maxV = Math.max(...data.map(d => d.value), 1);

  if (horizontal) {
    return (
      <div className="rounded-[14px] p-5 transition-colors duration-300"
        style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadow }}>
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold" style={{ color: T.text }}>{title}</h3>
          {subtitle && <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
        </div>
        <div className="space-y-3">
          {data.map((d,i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[11px] font-medium w-16 shrink-0 truncate" style={{ color: isDark?"#c4b5fd":"#374151" }}>{d.label}</span>
              <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: isDark?"rgba(139,92,192,0.12)":"#F2F2F2" }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                  style={{ width:`${Math.max((d.value/maxV)*100,d.value>0?6:0)}%`, background:d.color||BAR_COLORS[i%BAR_COLORS.length] }}>
                  <span className="text-[9px] font-bold text-white">{d.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const W=440,H=160,PL=30,PR=10,PT=12,PB=30;
  const cW=W-PL-PR, cH=H-PT-PB;
  const slot=cW/data.length, bW=Math.min(34,slot*0.55);
  const bx=(i:number)=>PL+slot*i+slot/2-bW/2;
  const bh=(v:number)=>(v/maxV)*cH, by=(v:number)=>PT+cH-bh(v);

  return (
    <div className="rounded-[14px] p-5 transition-colors duration-300"
      style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadow }}>
      <div className="mb-3">
        <h3 className="text-[14px] font-semibold" style={{ color: T.text }}>{title}</h3>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height:155 }}>
        {[0,.25,.5,.75,1].map((pct,i) => {
          const v=Math.round(maxV*pct), yy=PT+cH-pct*cH;
          return (
            <g key={i}>
              <line x1={PL} y1={yy} x2={W-PR} y2={yy} stroke={isDark?"rgba(139,92,192,0.10)":"rgba(90,14,122,0.06)"} strokeWidth="1"/>
              <text x={PL-4} y={yy+3} fontSize="8" fill={T.textFaint} textAnchor="end">{v}</text>
            </g>
          );
        })}
        {data.map((d,i) => {
          const h=bh(d.value), col=d.color||BAR_COLORS[i%BAR_COLORS.length];
          return (
            <g key={i}>
              <rect x={bx(i)} y={by(d.value)} width={bW} height={Math.max(h,0)} rx="4" fill={col} opacity="0.88"/>
              <text x={bx(i)+bW/2} y={H-5} fontSize="9" fill={T.textMuted} textAnchor="middle">{d.label}</text>
              {d.value>0&&<text x={bx(i)+bW/2} y={by(d.value)-4} fontSize="9" fill={T.text} textAnchor="middle" fontWeight="700">{d.value}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── Heatmap ───────────────────────────────────────────── */
const Heatmap = ({ data, title, subtitle, isDark=false }: { data:number[][];title:string;subtitle?:string;isDark?:boolean }) => {
  const T = useDarkTokens(isDark);
  const maxV=Math.max(...data.flat(),1), cW=28, cH=20, gap=3, leftW=56;
  const W=leftW+HOURS.length*(cW+gap), H=22+DAYS.length*(cH+gap)+4;

  const shade = (v: number) => {
    const p = v/maxV;
    if (isDark) {
      if (p<0.12) return { bg:"rgba(139,92,192,0.06)", txt:T.textFaint };
      if (p<0.32) return { bg:"rgba(139,92,192,0.18)", txt:"#c4b5fd" };
      if (p<0.58) return { bg:"rgba(139,92,192,0.38)", txt:"white" };
      if (p<0.80) return { bg:"rgba(123,44,191,0.65)", txt:"white" };
      return { bg:"#5A0E7A", txt:"white" };
    }
    if (p<0.12) return { bg:C.lightGray, txt:"#A06CD5" };
    if (p<0.32) return { bg:C.lavender, txt:"#5A0E7A" };
    if (p<0.58) return { bg:C.lightPurple, txt:"white" };
    if (p<0.80) return { bg:C.purple, txt:"white" };
    return { bg:C.darkPurple, txt:"white" };
  };

  return (
    <div className="rounded-[14px] p-5 transition-colors duration-300"
      style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadow }}>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: T.text }}>{title}</h3>
          {subtitle && <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] mr-0.5" style={{ color: T.textMuted }}>Less</span>
          {(isDark
            ? ["rgba(139,92,192,0.06)","rgba(139,92,192,0.18)","rgba(139,92,192,0.38)","rgba(123,44,191,0.65)","#5A0E7A"]
            : [C.lightGray,C.lavender,C.lightPurple,C.purple,C.darkPurple]
          ).map((c,i) => <span key={i} className="h-3 w-3 rounded-sm" style={{ background:c }}/>)}
          <span className="text-[9px] ml-0.5" style={{ color: T.textMuted }}>More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", minWidth:360, height:H }}>
          {HOURS.map((h,hi) => <text key={hi} x={leftW+hi*(cW+gap)+cW/2} y={13} fontSize="8" fill={T.textFaint} textAnchor="middle">{h}</text>)}
          {DAYS.map((day,di) => (
            <g key={di}>
              <text x={leftW-4} y={22+di*(cH+gap)+cH/2+1} fontSize="9" fill={T.textFaint} textAnchor="end" dominantBaseline="middle">{day}</text>
              {HOURS.map((_,hi) => {
                const v=data[di]?.[hi]||0, {bg,txt}=shade(v);
                return (
                  <g key={hi}>
                    <rect x={leftW+hi*(cW+gap)} y={18+di*(cH+gap)} width={cW} height={cH} rx="3" fill={bg}/>
                    {v>8&&<text x={leftW+hi*(cW+gap)+cW/2} y={18+di*(cH+gap)+cH/2+1} fontSize="7" fill={txt} textAnchor="middle" dominantBaseline="middle" fontWeight="600">{v}</text>}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const TwoCol = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

/* ── Data Builders ─────────────────────────────────────── */
const buildWeeklyTrend = (tickets:TicketType[], field:"createdAt"|"updatedAt", filterStatus?:string): number[] => {
  const now=new Date(), counts=Array(7).fill(0);
  tickets.forEach((t:any) => {
    const date=new Date(t[field]||t.created_at||t.updated_at||"");
    if(isNaN(date.getTime()))return;
    if(filterStatus&&norm(t.status)!==filterStatus)return;
    const diff=Math.floor((now.getTime()-date.getTime())/86400000);
    if(diff>=0&&diff<7){ const di=date.getDay()===0?6:date.getDay()-1; counts[di]++; }
  });
  return counts;
};
const buildHeatmap = (tickets:TicketType[]): number[][] => {
  const grid=Array.from({length:7},()=>Array(12).fill(0));
  tickets.forEach((t:any)=>{ const date=new Date(t.createdAt||t.created_at||""); if(isNaN(date.getTime()))return;
    const di=date.getDay()===0?6:date.getDay()-1; grid[di][Math.floor(date.getHours()/2)]++; });
  return grid;
};
const buildPriorityBars = (tickets:TicketType[]): BarDatum[] => {
  const c:Record<string,number>={urgent:0,high:0,medium:0,low:0};
  tickets.forEach((t:any)=>{ const p=norm(t.priority); if(p in c)c[p]++; });
  return [{label:"Urgent",value:c.urgent,color:C.darkPurple},{label:"High",value:c.high,color:C.purple},{label:"Medium",value:c.medium,color:C.lightPurple},{label:"Low",value:c.low,color:C.lavender}];
};

/* ── Chart Sections ────────────────────────────────────── */
const SuperAdminCharts = ({ stats, tickets, isDark }: { stats:any; tickets:TicketType[]; isDark:boolean }) => (
  <>
    <TwoCol>
      <LineChart data={[buildWeeklyTrend(tickets,"createdAt"),buildWeeklyTrend(tickets,"updatedAt","resolved")]} labels={DAYS}
        series={[{label:"Created",color:C.purple},{label:"Resolved",color:C.green}]}
        title="System Ticket Trends" subtitle="Tickets created vs resolved · last 7 days" isDark={isDark}/>
      <DonutChart segments={[{label:"Open",value:stats?.open||0,color:C.darkPurple},{label:"In Progress",value:stats?.inProgress||0,color:C.purple},{label:"Resolved",value:stats?.resolved||0,color:C.lightPurple}]}
        title="Tickets by Status" subtitle="Global distribution · hover to explore" centerLabel="Total" isDark={isDark}/>
    </TwoCol>
    <TwoCol>
      <BarChart data={buildPriorityBars(tickets)} title="Tickets by Priority" subtitle="Distribution across priority levels" horizontal isDark={isDark}/>
      <Heatmap data={buildHeatmap(tickets)} title="System Activity Heatmap" subtitle="Ticket creation by day and hour (last 7 days)" isDark={isDark}/>
    </TwoCol>
  </>
);
const AdminCharts = ({ stats, tickets, isDark }: { stats:any; tickets:TicketType[]; isDark:boolean }) => (
  <>
    <TwoCol>
      <LineChart data={[buildWeeklyTrend(tickets,"createdAt")]} labels={DAYS}
        series={[{label:"Tickets Created",color:C.purple}]} title="Ticket Trends" subtitle="Daily ticket creation · last 7 days" isDark={isDark}/>
      <DonutChart segments={[{label:"Open",value:stats?.open||0,color:C.darkPurple},{label:"In Progress",value:stats?.inProgress||0,color:C.purple},{label:"Resolved",value:stats?.resolved||0,color:C.lightPurple}]}
        title="Ticket Status Distribution" subtitle="Current breakdown · hover to explore" centerLabel="Total" isDark={isDark}/>
    </TwoCol>
    <TwoCol>
      <BarChart data={buildPriorityBars(tickets)} title="Tickets by Priority" subtitle="Distribution across priority levels" horizontal isDark={isDark}/>
      <Heatmap data={buildHeatmap(tickets)} title="Activity Heatmap" subtitle="Peak hours/days of ticket creation" isDark={isDark}/>
    </TwoCol>
  </>
);
const AgentCharts = ({ stats, tickets, isDark }: { stats:any; tickets:TicketType[]; isDark:boolean }) => (
  <>
    <TwoCol>
      <LineChart data={[buildWeeklyTrend(tickets,"updatedAt","resolved")]} labels={DAYS}
        series={[{label:"Tickets Resolved",color:C.purple}]} title="My Performance" subtitle="Tickets resolved per day · last 7 days" isDark={isDark}/>
      <DonutChart segments={[{label:"Open",value:stats?.assignedOpen||0,color:C.darkPurple},{label:"In Progress",value:stats?.assignedInProgress||0,color:C.purple},{label:"Resolved",value:stats?.assignedResolved||0,color:C.lightPurple}]}
        title="My Tickets by Status" subtitle="Current breakdown · hover to explore" centerLabel="Assigned" isDark={isDark}/>
    </TwoCol>
    <TwoCol>
      <BarChart data={buildPriorityBars(tickets)} title="Tickets by Priority" subtitle="Distribution of assigned tickets" horizontal isDark={isDark}/>
      <Heatmap data={buildHeatmap(tickets)} title="My Activity Heatmap" subtitle="When I resolve tickets most (last 7 days)" isDark={isDark}/>
    </TwoCol>
  </>
);
const UserCharts = ({ stats, tickets, isDark }: { stats:any; tickets:TicketType[]; isDark:boolean }) => (
  <>
    <TwoCol>
      <LineChart data={[buildWeeklyTrend(tickets,"createdAt")]} labels={DAYS}
        series={[{label:"My Tickets",color:C.purple}]} title="My Ticket Activity" subtitle="Tickets submitted over time · last 7 days" isDark={isDark}/>
      <DonutChart segments={[{label:"Open",value:stats?.myOpen||0,color:C.darkPurple},{label:"In Progress",value:stats?.myInProgress||0,color:C.purple},{label:"Resolved",value:stats?.myResolved||0,color:C.lightPurple}]}
        title="My Tickets by Status" subtitle="Current breakdown · hover to explore" centerLabel="Total" isDark={isDark}/>
    </TwoCol>
    <TwoCol>
      <BarChart data={buildPriorityBars(tickets)} title="My Tickets by Priority" subtitle="Distribution across priority levels" horizontal isDark={isDark}/>
      <Heatmap data={buildHeatmap(tickets)} title="My Ticket Activity" subtitle="When I submit tickets most (last 7 days)" isDark={isDark}/>
    </TwoCol>
  </>
);

/* ── SLA Calculator ────────────────────────────────────── */
const computeSLA = (tickets:TicketType[]): string => {
  const closed=tickets.filter((t:any)=>["resolved","closed"].includes(norm(t.status)));
  if(!closed.length)return "—";
  const within=closed.filter((t:any)=>{ const c=new Date(t.createdAt||t.created_at||""),u=new Date(t.updatedAt||t.updated_at||""); return !isNaN(c.getTime())&&!isNaN(u.getTime())&&(u.getTime()-c.getTime())/3600000<=24; });
  return `${Math.round((within.length/closed.length)*100)}%`;
};

/* ── Resolution Rate Calculators ───────────────────────── */
const computeAgentResolutionRate = (tickets: TicketType[]): string => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  // Consider tickets that were updated (i.e. worked on) this week
  const thisWeek = tickets.filter((t: any) => {
    const d = new Date(t.updatedAt || t.updated_at || t.createdAt || t.created_at || "");
    return !isNaN(d.getTime()) && d >= weekAgo;
  });
  if (!thisWeek.length) return "—";
  const resolved = thisWeek.filter((t: any) =>
    ["resolved", "closed"].includes(norm(t.status))
  ).length;
  return `${Math.round((resolved / thisWeek.length) * 100)}%`;
};

const computeUserResolutionRate = (tickets: TicketType[]): string => {
  if (!tickets.length) return "—";
  const resolved = tickets.filter((t: any) =>
    ["resolved", "closed"].includes(norm(t.status))
  ).length;
  return `${Math.round((resolved / tickets.length) * 100)}%`;
};

/* ── KPI Configs ───────────────────────────────────────── */
const getSuperAdminCards = (stats:any, userCounts:any, sla:string) => [
  { title:"Total Users", value:userCounts?userCounts.total.toLocaleString():(stats?.totalUsers?.toLocaleString()||"—"), icon:Users, accent:C.darkPurple, sub:userCounts?`${userCounts.active} active · ${userCounts.inactive} inactive`:"Admins · Agents · Users" },
  { title:"Total Tickets", value:stats?.totalTickets?.toLocaleString()||"—", icon:Ticket, accent:C.purple, sub:stats?`${stats.open??0} open · ${stats.resolved??0} resolved`:"System-wide all time" },
  { title:"Active / Inactive", value:userCounts?`${userCounts.active} / ${userCounts.inactive}`:(stats?.activeUsers!=null?`${stats.activeUsers} / ${stats.inactiveUsers??"—"}`:"—"), icon:Activity, accent:C.lightPurple, sub:userCounts?`${userCounts.admins} admin${userCounts.admins!==1?"s":""} in system`:"Active accounts" },
  { title:"System SLA", value:sla, icon:Shield, accent:"#10B981", sub:"Resolved within 24h" },
];
const getAdminCards = (stats:any, userCounts:any, sla:string) => [
  { title:"Total Tickets", value:stats?.totalTickets?.toLocaleString()||"—", icon:Ticket, accent:C.darkPurple, sub:stats?`${stats.open??0} open · ${stats.resolved??0} resolved`:"System-wide all time" },
  { title:"Total Users", value:userCounts?userCounts.total.toLocaleString():"—", icon:Users, accent:C.purple, sub:userCounts?`${userCounts.active} active · ${userCounts.inactive} inactive`:"All registered users" },
  { title:"Pending Registrations", value:stats?.pendingRegistrations!=null?stats.pendingRegistrations:"—", icon:Timer, accent:C.lightPurple, sub:"Awaiting approval" },
  { title:"SLA Compliance", value:sla!=="—"?sla:(stats?.slaCompliance!=null?`${stats.slaCompliance}%`:"—"), icon:Target, accent:"#10B981", sub:"Resolved within 24h" },
];
const getAgentCards = (stats: any, tickets: TicketType[]) => {
  const assigned = (stats?.assignedOpen || 0) + (stats?.assignedInProgress || 0);
  const resolutionRate = computeAgentResolutionRate(tickets);
  return [
    { title:"Assigned Tickets", value:assigned||"—", icon:Ticket, accent:C.darkPurple },
    { title:"Resolved", value:stats?.assignedResolved??("—" as any), icon:CheckCircle2, accent:"#10B981" },
    { title:"Pending", value:stats?.assignedOpen??("—" as any), icon:Clock, accent:C.purple },
    { title:"Resolution Rate", value:resolutionRate, icon:Target, accent:C.lightPurple, sub:"This week · resolved / active" },
  ];
};
const getUserCards = (stats: any, tickets: TicketType[]) => {
  const total = (stats?.myOpen || 0) + (stats?.myInProgress || 0) + (stats?.myResolved || 0);
  const resolutionRate = computeUserResolutionRate(tickets);
  return [
    { title:"My Total Tickets", value:total||"—", icon:Ticket, accent:C.darkPurple },
    { title:"Open Tickets", value:stats?.myOpen??("—" as any), icon:AlertCircle, accent:C.purple },
    { title:"Closed Tickets", value:stats?.myResolved??("—" as any), icon:CheckCircle2, accent:"#10B981" },
    { title:"Resolution Rate", value:resolutionRate, icon:Target, accent:C.lightPurple, sub:"% of my tickets resolved" },
  ];
};

/* ── Tickets Table ─────────────────────────────────────── */
const TicketsTable = ({ tickets, loading, isAdmin, isAgent, navigate, tableHeading, isDark }: any) => {
  const T = useDarkTokens(isDark);
  const rows = tickets.slice(0, 6);
  return (
    <div className="rounded-[16px] overflow-hidden transition-colors duration-300"
      style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadow }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-[7px] flex items-center justify-center" style={{ background: isDark?"rgba(139,92,192,0.15)":"rgba(90,14,122,0.08)" }}>
            <Ticket className="h-3.5 w-3.5" style={{ color:isDark?"#c4b5fd":"#5A0E7A" }}/>
          </div>
          <h2 className="text-[14px] font-semibold" style={{ color: T.text }}>{tableHeading}</h2>
          {!loading&&<span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: isDark?"rgba(139,92,192,0.15)":"rgba(90,14,122,0.07)", color:isDark?"#c4b5fd":C.purple }}>{rows.length}</span>}
        </div>
        <button className="flex items-center gap-1 text-[12px] font-medium hover:opacity-70 transition-opacity" style={{ color:isDark?"#c4b5fd":"#5A0E7A" }}
          onClick={()=>navigate(isAdmin?"/tickets":isAgent?"/assigned-tickets":"/my-tickets")}>
          View all <ArrowUpRight className="h-3.5 w-3.5"/>
        </button>
      </div>
      {loading?(
        <div className="flex justify-center py-16"><Loader2 className="animate-spin h-6 w-6" style={{ color:C.purple }}/></div>
      ):rows.length===0?(
        <div className="text-center py-16 space-y-3">
          <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center" style={{ background: isDark?"rgba(139,92,192,0.12)":"rgba(90,14,122,0.06)" }}>
            <Ticket className="h-6 w-6 opacity-40" style={{ color:isDark?"#c4b5fd":"#5A0E7A" }}/>
          </div>
          <p className="text-[13px]" style={{ color: T.textMuted }}>No tickets yet</p>
        </div>
      ):(
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: T.tableHead, borderBottom:`1px solid ${T.border}` }}>
                {["ID","Subject",...(isAdmin||isAgent?["Reporter"]:[]),"Priority","Status",""].map(h=>(
                  <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: T.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t:any)=>(
                <tr key={t.id} className="group transition-colors cursor-pointer" style={{ borderBottom:`1px solid ${T.border}` }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.surfaceHover}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}
                  onClick={()=>navigate(`/tickets/${t.id}`)}>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: isDark?"rgba(139,92,192,0.15)":"rgba(90,14,122,0.07)", color:isDark?"#c4b5fd":C.purple }}>
                      #{t.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <p className="text-[13px] font-medium truncate" style={{ color: T.text }}>{t.subject||t.title}</p>
                  </td>
                  {(isAdmin||isAgent)&&<td className="py-3.5 px-4 text-[13px]" style={{ color: T.textMuted }}>{t.creator?.name||t.user?.name||"—"}</td>}
                  <td className="py-3.5 px-4"><PriorityPill priority={norm(t.priority)} isDark={isDark}/></td>
                  <td className="py-3.5 px-4"><StatusPill status={norm(t.status)} isDark={isDark}/></td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[12px] font-medium ml-auto"
                      style={{ color:isDark?"#c4b5fd":"#5A0E7A" }}
                      onClick={e=>{e.stopPropagation();navigate(`/tickets/${t.id}`);}}>
                      <Eye className="h-3.5 w-3.5"/> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────── */
const DashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const T = useDarkTokens(isDark);

  const [stats,      setStats]      = useState<any>(null);
  const [tickets,    setTickets]    = useState<TicketType[]>([]);
  const [userCounts, setUserCounts] = useState<{ total:number;active:number;inactive:number;admins:number }|null>(null);
  const [loading,    setLoading]    = useState(true);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin      = user?.role === "admin" || isSuperAdmin;
  const isAgent      = user?.role === "agent";
  const isUser       = user?.role === "user";

  useEffect(() => { fetchData(); }, [user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let ticketData: TicketType[] = [];
      const processUsers = (data: PendingUser[]) => {
        const active   = data.filter(u => u.status === "approved").length;
        const inactive = data.filter(u => u.status !== "approved").length;
        const admins   = data.filter(u => u.role === "admin" || u.role === "super_admin").length;
        setUserCounts({ total: data.length, active, inactive, admins });
      };
      if (isSuperAdmin || isAdmin) {
        const [s,t,u] = await Promise.allSettled([adminApi.getStats(), ticketApi.getAllTickets(), userApi.getAllUsers()]);
        if (s.status==="fulfilled") setStats(s.value);
        if (t.status==="fulfilled") ticketData = t.value||[];
        if (u.status==="fulfilled") processUsers(u.value.data||[]);
      } else if (isAgent) {
        const [s,t] = await Promise.allSettled([adminApi.getStats(), ticketApi.getAssignedTickets()]);
        if (s.status==="fulfilled") setStats(s.value);
        if (t.status==="fulfilled") ticketData = t.value||[];
      } else {
        const [s,t] = await Promise.allSettled([adminApi.getStats(), ticketApi.getMyTickets()]);
        if (s.status==="fulfilled") setStats(s.value);
        if (t.status==="fulfilled") ticketData = t.value||[];
      }
      setTickets(ticketData);
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  };

  const hour     = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const roleLabel: Record<string,string> = { super_admin:"Super Admin", admin:"Admin", agent:"Agent", user:"User" };
  const tableHeading = isAdmin?"All System Tickets":isAgent?"My Assigned Tickets":"My Tickets";
  const sla      = computeSLA(tickets);
  const kpiCards = isSuperAdmin
    ? getSuperAdminCards(stats,userCounts,sla)
    : isAdmin ? getAdminCards(stats,userCounts,sla)
    : isAgent ? getAgentCards(stats, tickets)
    : getUserCards(stats, tickets);

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[16px] p-6"
        style={{
          background: isDark
            ? "linear-gradient(135deg,#2a0845 0%,#3d1060 55%,#5B1E7A 100%)"
            : "linear-gradient(135deg,#4a1664 0%,#5B1E7A 55%,#7B3A9E 100%)",
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,192,0.2)"
            : "0 4px 24px rgba(91,30,122,0.25)",
        }}>
        <div className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full opacity-10" style={{ background:"radial-gradient(circle,#C8973A,transparent)" }}/>
        <div className="pointer-events-none absolute bottom-0 left-16 h-24 w-24 rounded-full opacity-10" style={{ background:"radial-gradient(circle,white,transparent)" }}/>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color:"rgba(243,233,251,0.65)" }}>
              {new Date().toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
            <h1 className="text-[1.6rem] font-bold text-white mt-0.5 tracking-tight">
              {greeting}, {user?.name?.split(" ")[0]} <WavingHand />
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-[12px]" style={{ color:"rgba(243,233,251,0.65)" }}>{roleLabel[user?.role||"user"]} · islamic Bank Limited</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isUser&&(
              <button onClick={()=>navigate("/create-ticket")}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-150 hover:scale-[1.02]"
                style={{ background:"#C8973A", color:"#fff", boxShadow:"0 2px 8px rgba(200,151,58,0.35)" }}>
                <PlusCircle className="h-4 w-4"/> New Ticket
              </button>
            )}
            {(isAdmin||isAgent)&&(
              <button onClick={()=>navigate("/tickets")}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold border transition-all duration-150"
                style={{ borderColor:"rgba(255,255,255,0.25)", color:"#fff", background:"rgba(255,255,255,0.1)" }}>
                <Ticket className="h-4 w-4"/> View All Tickets
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading?(
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_,i)=><div key={i} className="h-[120px] rounded-[14px] animate-pulse" style={{ background: T.skeleton }}/>)}
        </div>
      ):(
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((c,i)=><StatCard key={c.title} {...c} delay={i*60} isDark={isDark}/>)}
        </div>
      )}

      {/* Charts */}
      {loading?(
        <>
          <TwoCol>
            <div className="h-[300px] rounded-[16px] animate-pulse" style={{ background: T.skeleton }}/>
            <div className="h-[300px] rounded-[16px] animate-pulse" style={{ background: T.skeleton }}/>
          </TwoCol>
          <TwoCol>
            <div className="h-[260px] rounded-[14px] animate-pulse" style={{ background: T.skeleton }}/>
            <div className="h-[260px] rounded-[14px] animate-pulse" style={{ background: T.skeleton }}/>
          </TwoCol>
        </>
      ):(
        <>
          {isSuperAdmin&&<SuperAdminCharts stats={stats} tickets={tickets} isDark={isDark}/>}
          {isAdmin&&!isSuperAdmin&&<AdminCharts stats={stats} tickets={tickets} isDark={isDark}/>}
          {isAgent&&<AgentCharts stats={stats} tickets={tickets} isDark={isDark}/>}
          {isUser&&<UserCharts stats={stats} tickets={tickets} isDark={isDark}/>}
        </>
      )}

      {/* Tickets Table */}
      <TicketsTable tickets={tickets} loading={loading} isAdmin={isAdmin} isAgent={isAgent} navigate={navigate} tableHeading={tableHeading} isDark={isDark}/>
    </div>
  );
};

export default DashboardPage;