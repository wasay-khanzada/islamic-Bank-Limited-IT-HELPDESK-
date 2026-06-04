import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Send, Clock, AlertCircle, CheckCircle2,
  FileText, Download, Loader2, MessageSquare,
  Building2, Tag, Paperclip, CalendarDays,
  ShieldAlert, User, Activity, UserCheck, RefreshCcw,
  PlusCircle, X, MessageCircle,
} from "lucide-react";
import { ticketApi, Ticket } from "@/api/ticketApi";
import { adminApi } from "@/api/adminApi";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── helpers ──────────────────────────────────────────── */
const norm = (v?: string) => v?.toLowerCase().replace(/_/g, "-") || "";

const extractId   = (val: any): string => { if (!val) return ""; if (typeof val === "object") return String(val.id ?? ""); return String(val); };
const extractName = (val: any): string => { if (val === null || val === undefined) return ""; if (typeof val === "object") return String(val.name ?? val.label ?? val.id ?? ""); return String(val); };
const safeStr     = (val: any): string => { if (val === null || val === undefined) return ""; if (typeof val === "object") return extractName(val); return String(val); };

/* ─── Dark token map ───────────────────────────────────── */
const useDT = (isDark: boolean) => ({
  bg:             isDark ? "#0f0720"                              : "#f9f7ff",
  surface:        isDark ? "#1a0d30"                              : "#ffffff",
  surfaceAlt:     isDark ? "#160a2a"                              : "rgba(93,12,116,0.03)",
  border:         isDark ? "rgba(139,92,192,0.18)"                : "rgba(93,12,116,0.09)",
  borderFaint:    isDark ? "rgba(139,92,192,0.08)"                : "rgba(93,12,116,0.07)",
  borderPanel:    isDark ? "rgba(139,92,192,0.12)"                : "rgba(93,12,116,0.07)",
  text:           isDark ? "#e8d5f8"                              : "#3d1052",
  textMuted:      isDark ? "#a78cc0"                              : "#9B59B6",
  textFaint:      isDark ? "#6b4e8a"                              : "#9B59B6",
  shadow:         isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(93,12,116,0.05)",
  panelHeaderBg:  isDark ? "rgba(139,92,192,0.06)"               : "rgba(93,12,116,0.03)",
  panelIconColor: isDark ? "#c4b5fd"                              : "#701D88",
  panelTitleColor:isDark ? "#c4b5fd"                              : "#701D88",
  monoBg:         isDark ? "rgba(139,92,192,0.15)"                : "rgba(93,12,116,0.08)",
  monoText:       isDark ? "#c4b5fd"                              : "#701D88",
  backBtnBorder:  isDark ? "rgba(139,92,192,0.25)"                : "rgba(93,12,116,0.15)",
  backBtnColor:   isDark ? "#c4b5fd"                              : "#5D0C74",
  backBtnHoverBg: isDark ? "rgba(139,92,192,0.12)"                : "rgba(93,12,116,0.06)",
  propRowBorder:  isDark ? "rgba(139,92,192,0.08)"                : "rgba(93,12,116,0.05)",
  propIconBg:     isDark ? "rgba(139,92,192,0.12)"                : "rgba(93,12,116,0.06)",
  propIconColor:  isDark ? "#c4b5fd"                              : "#701D88",
  propLabelColor: isDark ? "#a78cc0"                              : "#9B59B6",
  timelineLineBg: isDark ? "rgba(139,92,192,0.15)"                : "rgba(93,12,116,0.12)",
  inputBg:        isDark ? "#160a2a"                              : "#faf8fc",
  inputBorder:    isDark ? "rgba(139,92,192,0.25)"                : "rgba(93,12,116,0.15)",
  updateSaveBg:   isDark ? "#7c3aed"                              : "#5D0C74",
  updateSaveHov:  isDark ? "#6d28d9"                              : "#701D88",
  attachImgBg:    isDark ? "rgba(139,92,192,0.05)"                : "rgba(93,12,116,0.02)",
  attachImgBorder:isDark ? "rgba(139,92,192,0.15)"                : "rgba(93,12,116,0.1)",
  attachFileBg:   isDark ? "rgba(139,92,192,0.06)"                : "rgba(93,12,116,0.03)",
  attachFileBorder:isDark ? "rgba(139,92,192,0.14)"               : "rgba(93,12,116,0.1)",
  attachFileIconBg:isDark ? "rgba(139,92,192,0.12)"               : "rgba(93,12,116,0.08)",
  downloadBtnBg:  isDark ? "#7c3aed"                              : "#5D0C74",
  downloadBtnHov: isDark ? "#6d28d9"                              : "#701D88",
  commentBubbleBg:isDark ? "#160a2a"                              : "#fff",
  commentBubbleBorder: isDark ? "rgba(139,92,192,0.15)"          : "rgba(93,12,116,0.12) ",
  commentPreviewBg: isDark ? "rgba(139,92,192,0.06)"             : "rgba(93,12,116,0.03)",
  commentPreviewBorder: isDark ? "rgba(139,92,192,0.12)"         : "rgba(93,12,116,0.07)",
  chatBg:         isDark ? "#120826"                              : "#faf8fc",
  chatHeaderBg:   "linear-gradient(135deg,#4a0c64,#5D0C74,#843698)",
  chatInputBg:    isDark ? "#1a0d30"                              : "#fff",
  chatInputBorder:isDark ? "rgba(139,92,192,0.2)"                 : "rgba(93,12,116,0.08)",
  emptyBg:        isDark ? "rgba(139,92,192,0.08)"                : "rgba(93,12,116,0.06)",
  selectBorder:   isDark ? "rgba(139,92,192,0.25)"                : "rgba(93,12,116,0.15)",
  selectBg:       isDark ? "#160a2a"                              : "#ffffff",
  assignedAvatarFrom: isDark ? "#6d28d9"                         : "#5D0C74",
  assignedAvatarTo:   isDark ? "#9333ea"                         : "#843698",
});

/* ─── Status config ─ */
const statusCfg: Record<string, {
  label: string; dot: string;
  bg: string; text: string; border: string;
  dBg: string; dText: string; dBorder: string; dDot: string;
  icon: React.ElementType;
}> = {
  open:          { label:"Open",        dot:"#843698", bg:"rgba(132,54,152,0.08)",  text:"#701D88", border:"rgba(132,54,152,0.28)", dBg:"rgba(139,92,192,0.18)", dText:"#c4b5fd", dBorder:"rgba(139,92,192,0.40)", dDot:"#a78bfa", icon:AlertCircle  },
  "in-progress": { label:"In Progress", dot:"#9662A4", bg:"rgba(150,98,164,0.08)",  text:"#843698", border:"rgba(150,98,164,0.28)", dBg:"rgba(167,139,250,0.15)", dText:"#c4b5fd", dBorder:"rgba(167,139,250,0.35)", dDot:"#c4b5fd", icon:Clock        },
  resolved:      { label:"Resolved",    dot:"#5D0C74", bg:"rgba(93,12,116,0.08)",   text:"#5D0C74", border:"rgba(93,12,116,0.22)",  dBg:"rgba(196,181,253,0.12)", dText:"#ddd6fe", dBorder:"rgba(196,181,253,0.28)", dDot:"#ddd6fe", icon:CheckCircle2 },
  closed:        { label:"Closed",      dot:"#9662A4", bg:"rgba(150,98,164,0.07)",  text:"#9662A4", border:"rgba(150,98,164,0.22)", dBg:"rgba(107,114,128,0.15)", dText:"#9ca3af", dBorder:"rgba(107,114,128,0.30)", dDot:"#9ca3af", icon:CheckCircle2 },
};

/* ─── Priority config ─ */
const priorityCfg: Record<string, {
  label: string;
  bg: string; text: string; border: string; stripe: string;
  dBg: string; dText: string; dBorder: string; dStripe: string;
}> = {
  urgent: { label:"Urgent", bg:"#5D0C74",               text:"#fff",    border:"#5D0C74",               stripe:"#5D0C74", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)", dStripe:"#7c3aed" },
  high:   { label:"High",   bg:"#843698",               text:"#fff",    border:"#843698",               stripe:"#843698", dBg:"rgba(123,44,191,0.25)", dText:"#d8b4fe", dBorder:"rgba(123,44,191,0.45)", dStripe:"#9333ea" },
  medium: { label:"Medium", bg:"rgba(150,98,164,0.12)", text:"#701D88", border:"rgba(150,98,164,0.35)", stripe:"#9662A4", dBg:"rgba(160,108,213,0.18)", dText:"#c4b5fd", dBorder:"rgba(160,108,213,0.35)", dStripe:"#a855f7" },
  low:    { label:"Low",    bg:"rgba(150,98,164,0.08)", text:"#9662A4", border:"rgba(150,98,164,0.25)", stripe:"#C4A8D8", dBg:"rgba(139,92,192,0.12)", dText:"#a78bfa", dBorder:"rgba(139,92,192,0.25)", dStripe:"#6d28d9" },
};

/* ─── Activity meta ─ */
const activityMeta = (action: string) => {
  const a = (action || "").toLowerCase();
  if (a.includes("assign"))  return { icon:UserCheck,  bg:"rgba(93,12,116,0.10)",   color:"#5D0C74",  label:"Agent assigned"   };
  if (a.includes("status"))  return { icon:RefreshCcw, bg:"rgba(132,54,152,0.10)",  color:"#843698",  label:"Status updated"   };
  if (a.includes("attach"))  return { icon:Paperclip,  bg:"rgba(150,98,164,0.10)",  color:"#9662A4",  label:"Attachment added" };
  if (a.includes("creat"))   return { icon:PlusCircle, bg:"rgba(112,29,136,0.08)",  color:"#701D88",  label:"Ticket created"   };
  return                            { icon:Activity,   bg:"rgba(150,98,164,0.08)",  color:"#9662A4",  label:action||"Activity" };
};

/* ─── SLA badge ─ */
const SlaBadge = ({ deadline, isDark }: { deadline?: string; isDark: boolean }) => {
  if (!deadline) return <span className="text-[13px]" style={{ color: "#9B59B6" }}>N/A</span>;
  const now = new Date(); const slaDate = new Date(deadline);
  const diff = slaDate.getTime() - now.getTime();
  const breached = diff < 0; const warning = !breached && diff < 2 * 3600 * 1000;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
      style={{ color: breached ? (isDark?"#fca5a5":"#DC2626") : warning ? (isDark?"#fcd34d":"#F59E0B") : (isDark?"#86efac":"#10B981") }}>
      <ShieldAlert className="h-3.5 w-3.5" />
      {breached ? "Breached · " : ""}
      {slaDate.toLocaleString("en-PK", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
    </span>
  );
};

/* ─── Prop row ─ */
const PropRow = ({
  icon: Icon, label, children, isDark,
}: { icon: React.ElementType; label: string; children: React.ReactNode; isDark: boolean }) => {
  const T = useDT(isDark);
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom:`1px solid ${T.propRowBorder}` }}>
      <div className="h-7 w-7 rounded-[7px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: T.propIconBg }}>
        <Icon className="h-3.5 w-3.5" style={{ color: T.propIconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-0.5" style={{ color: T.propLabelColor }}>{label}</p>
        <div className="text-[13px]" style={{ color: T.text }}>{children}</div>
      </div>
    </div>
  );
};

/* ─── Attachment helpers ─ */
const getFilename = (url: string) =>
  decodeURIComponent(url.split("/").pop()?.split("?")[0] || "attachment");
const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(getFilename(url));
const isPdf   = (url: string) => /\.pdf$/i.test(getFilename(url));
const resolveUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/uploads/${url}`;
  return `${base}${path}`;
};

/* ─── Attachment panel ─ */
const AttachmentPanel = ({ url, isDark }: { url: string; isDark: boolean }) => {
  const T = useDT(isDark);
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = resolveUrl(url);
  const filename    = getFilename(url);

  if (isImage(url) && !imgError) return (
    <div
      className="rounded-[12px] overflow-hidden flex items-center justify-center transition-colors duration-300"
      style={{ border:`1px solid ${T.attachImgBorder}`, background:T.attachImgBg, height:280, width:"100%" }}
    >
      <img
        src={resolvedUrl}
        alt={filename}
        onError={() => setImgError(true)}
        style={{ maxHeight:"100%", maxWidth:"100%", objectFit:"contain", display:"block" }}
      />
    </div>
  );

  const fileIconBg = isPdf(url)
    ? { bg: isDark?"rgba(239,68,68,0.12)":"rgba(239,68,68,0.08)", color:"#DC2626" }
    : { bg: T.attachFileIconBg, color: T.propIconColor };

  return (
    <div className="flex items-center gap-3 p-4 rounded-[10px] transition-colors duration-300"
      style={{ background:T.attachFileBg, border:`1px solid ${T.attachFileBorder}` }}>
      <div className="h-10 w-10 rounded-[9px] flex items-center justify-center shrink-0" style={{ background:fileIconBg.bg }}>
        <FileText className="h-5 w-5" style={{ color:fileIconBg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color:T.text }}>{filename}</p>
        <p className="text-[11px]" style={{ color:T.textMuted }}>
          {isPdf(url) ? "PDF Document" : imgError ? "Image (broken link)" : "File attachment"}
        </p>
      </div>
      <a href={resolvedUrl} target="_blank" rel="noreferrer" download>
        <button
          className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[12px] font-semibold text-white transition-all"
          style={{ background:T.downloadBtnBg, boxShadow:"0 1px 4px rgba(93,12,116,0.25)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.downloadBtnHov}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = T.downloadBtnBg}
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
      </a>
    </div>
  );
};

/* ─── Chat popup ─ */
interface ChatPopupProps {
  comments: any[];
  ticketId: number;
  me: any;
  onNewComment: () => void;
  isDark: boolean;
}
const ChatPopup = ({ comments, ticketId, me, onNewComment, isDark }: ChatPopupProps) => {
  const T = useDT(isDark);
  const [open, setOpen]       = useState(false);
  const [text, setText]       = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [open, comments]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await ticketApi.addComment(ticketId, text);
      setText(""); toast.success("Comment sent"); onNewComment();
    } catch { toast.error("Failed to send"); }
    finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isMineCheck = (c: any): boolean => {
    if (!me) return false;
    const authorId   = extractId(c.author) || extractId(c.user);
    const authorName = (extractName(c.author) || extractName(c.user) || "").toLowerCase().trim();
    const myIdStr    = String(me.id ?? "");
    const myName     = (me.name || me.username || me.email || "").toLowerCase().trim();
    if (myIdStr && authorId && String(authorId) === myIdStr) return true;
    if (myName && authorName && authorName === myName) return true;
    return false;
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-[9px] text-[13px] font-semibold text-white transition-all"
        style={{ background:"linear-gradient(135deg,#5D0C74,#843698)", boxShadow:"0 2px 8px rgba(93,12,116,0.25)" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(93,12,116,0.35)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(93,12,116,0.25)"}
      >
        <MessageCircle className="h-4 w-4" />
        Comments
        {comments.length > 0 && (
          <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background:"rgba(255,255,255,0.2)" }}>
            {comments.length}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
  className="flex flex-col p-0 gap-0 overflow-hidden [&>button:first-of-type]:hidden"
  style={{
    maxWidth:460, width:"100%", height:560, borderRadius:18,
    boxShadow:"0 12px 48px rgba(93,12,116,0.28)",
    border:`1px solid ${T.border}`,
    background: T.surface,
  }}
>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: T.chatHeaderBg }}>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-white/80" />
              <span className="text-[13px] font-semibold text-white">Comments</span>
              {comments.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background:"rgba(255,255,255,0.2)", color:"#fff" }}>
                  {comments.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all"
              style={{ background:"rgba(255,255,255,0.1)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef}
            className="flex-1 overflow-y-auto py-4 px-4 space-y-4"
            style={{ minHeight:0, background:T.chatBg }}>
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <div className="h-14 w-14 rounded-full flex items-center justify-center"
                  style={{ background:T.emptyBg }}>
                  <MessageSquare className="h-6 w-6 opacity-30" style={{ color: isDark?"#c4b5fd":"#5D0C74" }} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium" style={{ color:isDark?"#c4b5fd":"#701D88" }}>No comments yet</p>
                  <p className="text-[12px] mt-0.5" style={{ color:T.textMuted }}>Be the first to start the conversation</p>
                </div>
              </div>
            ) : (
              comments.map((c: any, idx: number) => {
                const authorName = extractName(c.author) || extractName(c.user) || "User";
                const body       = safeStr(c.message ?? c.body ?? c.content ?? "");
                const isMine     = isMineCheck(c);
                const initials   = authorName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

                return (
                  <div key={idx} className={cn("flex items-end gap-2.5", isMine ? "flex-row-reverse" : "flex-row")}>
                    <div
                      className="h-[30px] w-[30px] rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                      style={{ background: isMine
                        ? "linear-gradient(135deg,#843698,#9662A4)"
                        : "linear-gradient(135deg,#5D0C74,#843698)" }}>
                      {initials}
                    </div>
                    <div className={cn("flex flex-col max-w-[72%]", isMine ? "items-end" : "items-start")}>
                      <span className="text-[11px] font-medium mb-1"
                        style={{ color:T.textMuted, paddingLeft:isMine?0:2, paddingRight:isMine?2:0 }}>
                        {isMine ? `${authorName} (You)` : authorName}
                      </span>
                      <div
                        className="px-3.5 py-2.5 text-[13px] leading-relaxed break-words"
                        style={isMine ? {
                          background:"linear-gradient(135deg,#5D0C74,#843698)",
                          color:"#fff",
                          borderRadius:"16px",
                          borderBottomRightRadius:4,
                        } : {
                          background:T.commentBubbleBg,
                          color:T.text,
                          border:`0.5px solid ${T.commentBubbleBorder}`,
                          borderRadius:"16px",
                          borderBottomLeftRadius:4,
                        }}>
                        {body}
                      </div>
                      <span className="text-[10px] mt-1"
                        style={{ color:T.textFaint, paddingLeft:isMine?0:2, paddingRight:isMine?2:0 }}>
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString("en-PK",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})
                          : ""}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-3 flex items-end gap-2 transition-colors duration-300"
            style={{ background:T.chatInputBg, borderTop:`0.5px solid ${T.chatInputBorder}` }}>
            <Textarea
              placeholder="Write a comment… (Enter to send)"
              value={text}
              rows={2}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              className="resize-none flex-1 text-[13px]"
              style={{
                borderRadius:12,
                border:`1.5px solid ${T.inputBorder}`,
                padding:"10px 14px",
                background:T.inputBg,
                color:T.text,
                outline:"none",
              }}
            />
            <button
              disabled={sending || !text.trim()}
              onClick={handleSend}
              className="shrink-0 flex items-center justify-center text-white transition-all disabled:opacity-40"
              style={{
                width:38, height:38,
                borderRadius:10,
                background:"linear-gradient(135deg,#5D0C74,#843698)",
                border:"none",
              }}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ─── Panel card wrapper ─ */
const PanelCard = ({
  title, icon: Icon, children, isDark,
}: { title: string; icon?: React.ElementType; children: React.ReactNode; isDark: boolean }) => {
  const T = useDT(isDark);
  return (
    <div className="rounded-[14px] overflow-hidden transition-colors duration-300"
      style={{ background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadow }}>
      <div className="px-5 py-3.5 flex items-center gap-2 transition-colors duration-300"
        style={{ borderBottom:`1px solid ${T.borderPanel}`, background:T.panelHeaderBg }}>
        {Icon && <Icon className="h-3.5 w-3.5" style={{ color:T.panelIconColor }} />}
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color:T.panelTitleColor }}>{title}</h3>
      </div>
      {children}
    </div>
  );
};

/* ─── Main ─────────────────────────────────────────────── */
const TicketDetailPage = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { user: me } = useAuth();
  const { isDark }   = useTheme();
  const T            = useDT(isDark);

  const [ticket, setTicket]             = useState<Ticket | null>(null);
  const [auditLogs, setAuditLogs]       = useState<any[]>([]);
  const [agents, setAgents]             = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [localStatus, setLocalStatus]   = useState("");
  const [localAgent, setLocalAgent]     = useState("");

  const isAdmin   = me?.role === "admin" || me?.role === "super_admin";
  const isAgent   = me?.role === "agent";
  const canEdit   = isAdmin || isAgent;
  const canAssign = isAdmin;

  useEffect(() => { if (!id) return; loadAll(); }, [id]);

  const loadAll = async () => {
    await Promise.allSettled([fetchTicket(), fetchAuditLog()]);
    if (isAdmin) fetchAgents();
  };

  const fetchTicket = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ticketApi.getTicketById(Number(id));
      if (!data) throw new Error("empty");
      setTicket(data);
      setLocalStatus(norm(safeStr(data.status)));
      setLocalAgent(extractId(data.assigned_to) || extractId(data.assignedAgent?.id ? data.assignedAgent : null));
    } catch { toast.error("Failed to load ticket details"); }
    finally { setLoading(false); }
  };

  const fetchAuditLog = async () => {
    if (!id) return;
    try { const raw = await ticketApi.getAuditLog(Number(id)); setAuditLogs(Array.isArray(raw) ? raw : (raw as any)?.data ?? []); } catch {}
  };

  const fetchAgents = async () => {
    try { const data = await adminApi.getAgents(); setAgents(Array.isArray(data) ? data : (data as any)?.data ?? []); } catch {}
  };

  const handleUpdateStatus = async () => {
    if (!id || !localStatus) return;
    setSavingStatus(true);
    try { await ticketApi.updateStatus(Number(id), localStatus); toast.success("Status updated"); await Promise.allSettled([fetchTicket(), fetchAuditLog()]); }
    catch { toast.error("Failed to update status"); }
    finally { setSavingStatus(false); }
  };

  const handleAssign = async () => {
    if (!id || !localAgent) return;
    setSavingAssign(true);
    try { await ticketApi.assignTicket(Number(id), Number(localAgent)); toast.success("Agent assigned"); await Promise.allSettled([fetchTicket(), fetchAuditLog()]); }
    catch { toast.error("Failed to assign agent"); }
    finally { setSavingAssign(false); }
  };

  const buildTimeline = () => {
    const events: any[] = [];
    if (ticket) {
      events.push({ action:"ticket_created", message:`Ticket submitted by ${extractName(ticket.creator)||"user"}`, createdAt:ticket.createdAt, actor:extractName(ticket.creator) });
    }
    (auditLogs||[]).forEach((l: any) => {
      if ((l.action||"").toLowerCase().includes("comment")) return;
      events.push({ action:safeStr(l.action??l.type??""), message:safeStr(l.description??l.message??l.details??l.action??""), createdAt:l.createdAt||l.timestamp, actor:extractName(l.user)||safeStr(l.performedBy)||"System" });
    });
    if (ticket?.attachment) {
      events.push({ action:"attachment_added", message:`Attachment: ${getFilename(safeStr(ticket.attachment))}`, createdAt:ticket.createdAt, actor:extractName(ticket.creator) });
    }
    return events.sort((a,b) => new Date(a.createdAt||0).getTime() - new Date(b.createdAt||0).getTime());
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-3">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: isDark?"#c4b5fd":"#701D88" }} />
      <p className="text-[13px]" style={{ color:T.textMuted }}>Loading ticket…</p>
    </div>
  );

  if (!ticket) return (
    <div className="flex flex-col items-center justify-center py-28 gap-3">
      <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background:T.emptyBg }}>
        <AlertCircle className="h-7 w-7 opacity-40" style={{ color: isDark?"#c4b5fd":"#5D0C74" }} />
      </div>
      <p className="font-semibold" style={{ color:T.text }}>Ticket not found</p>
      <button onClick={()=>navigate(-1)} className="text-[13px] font-medium px-4 py-2 rounded-[8px] transition-all"
        style={{ border:`1px solid ${T.backBtnBorder}`, color:T.backBtnColor }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.backBtnHoverBg}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}>
        Go back
      </button>
    </div>
  );

  const status     = norm(safeStr(ticket.status));
  const priority   = norm(safeStr(ticket.priority));
  const sc         = statusCfg[status]     || statusCfg.open;
  const pc         = priorityCfg[priority] || priorityCfg.medium;
  const StatusIcon = sc.icon;
  const timeline   = buildTimeline();

  const categoryName   = extractName(ticket.category) || null;
  const departmentName = extractName(ticket.department) || null;
  const assignedName   = extractName(ticket.assignedAgent) || extractName(ticket.assigned_to) || null;
  const creatorName    = extractName(ticket.creator) || "Unknown";
  const subjectStr     = safeStr(ticket.subject);
  const descriptionStr = safeStr(ticket.description) || "No description provided.";
  const assetName      = extractName(ticket.asset?.name ?? ticket.asset) || null;
  const assetType      = typeof ticket.asset === "object" ? safeStr(ticket.asset?.type) : null;
  const comments       = Array.isArray(ticket.comments) ? ticket.comments : [];

  const sBg     = isDark ? sc.dBg     : sc.bg;
  const sText   = isDark ? sc.dText   : sc.text;
  const sBorder = isDark ? sc.dBorder : sc.border;
  const sDot    = isDark ? sc.dDot    : sc.dot;
  const pBg     = isDark ? pc.dBg     : pc.bg;
  const pText   = isDark ? pc.dText   : pc.text;
  const pBorder = isDark ? pc.dBorder : pc.border;
  const pStripe = isDark ? pc.dStripe : pc.stripe;

  return (
    <div className="space-y-5 w-full animate-fade-in transition-colors duration-300">

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 transition-all"
          style={{ border:`1px solid ${T.backBtnBorder}`, color:T.backBtnColor }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.backBtnHoverBg}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="h-5 w-1 rounded-full shrink-0" style={{ background:pStripe }} />
            <h1 className="text-[18px] font-bold truncate transition-colors duration-300" style={{ color:T.text }}>{subjectStr}</h1>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded transition-colors duration-300"
              style={{ background:T.monoBg, color:T.monoText }}>
              #{ticket.id}
            </span>
          </div>
          <p className="text-[12px] mt-0.5 transition-colors duration-300" style={{ color:T.textMuted }}>
            Opened by{" "}
            <span className="font-semibold" style={{ color:isDark?"#c4b5fd":"#5D0C74" }}>{creatorName}</span>
            {" · "}
            {new Date(ticket.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full shrink-0 transition-colors duration-300"
          style={{ background:sBg, color:sText, border:`1px solid ${sBorder}` }}>
          <StatusIcon className="h-3.5 w-3.5" /> {sc.label}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT col */}
        <div className="lg:col-span-2 space-y-4">

          {/* Description */}
          <PanelCard title="Description" icon={FileText} isDark={isDark}>
            <div className="px-5 py-4">
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap transition-colors duration-300" style={{ color:T.text }}>
                {descriptionStr}
              </p>
            </div>
          </PanelCard>

          {/* Attachment */}
          {ticket.attachment && (
            <PanelCard title="Attachment" icon={Paperclip} isDark={isDark}>
              <div className="p-4">
                <AttachmentPanel url={safeStr(ticket.attachment)} isDark={isDark} />
              </div>
            </PanelCard>
          )}

          {/* Comments */}
          <PanelCard title="Comments" icon={MessageSquare} isDark={isDark}>
            <div className="p-4 space-y-4">
              {comments.length > 0 && (
                <div className="space-y-2.5">
                  {comments.slice(-2).map((c: any, idx: number) => {
                    const authorName = extractName(c.author)||extractName(c.user)||"User";
                    const body       = safeStr(c.message??c.body??c.content??"");
                    const initials   = authorName.split(" ").map((w:string)=>w[0]).join("").toUpperCase().slice(0,2);
                    return (
                      <div key={idx} className="flex gap-2.5 items-start p-3 rounded-[10px] transition-colors duration-300"
                        style={{ background:T.commentPreviewBg, border:`1px solid ${T.commentPreviewBorder}` }}>
                        <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background:"linear-gradient(135deg,#5D0C74,#843698)" }}>
                          {initials||"U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] font-semibold" style={{ color:isDark?"#c4b5fd":"#5D0C74" }}>{authorName}</span>
                          <p className="text-[12px] truncate mt-0.5" style={{ color:T.textMuted }}>{body}</p>
                        </div>
                      </div>
                    );
                  })}
                  {comments.length > 2 && (
                    <p className="text-[11px] pl-2" style={{ color:T.textMuted }}>
                      +{comments.length-2} more comment{comments.length-2>1?"s":""}
                    </p>
                  )}
                </div>
              )}
              <ChatPopup comments={comments} ticketId={ticket.id} me={me} onNewComment={loadAll} isDark={isDark} />
            </div>
          </PanelCard>

          {/* Activity Log */}
          <PanelCard title={`Activity Log · ${timeline.length}`} icon={Activity} isDark={isDark}>
            <div className="px-5 py-4">
              {timeline.length === 0 ? (
                <p className="text-[13px] text-center py-8 transition-colors duration-300" style={{ color:T.textMuted }}>
                  No activity recorded yet
                </p>
              ) : (
                <div className="relative pl-1">
                  <div className="absolute left-[15px] top-4 bottom-4 w-px transition-colors duration-300"
                    style={{ background:T.timelineLineBg }} />
                  <div className="space-y-5">
                    {timeline.map((event, idx) => {
                      const meta = activityMeta(safeStr(event.action));
                      const Icon = meta.icon;
                      const metaBgFinal = isDark
                        ? meta.bg.replace("rgba(", "rgba(").replace(",0.", ",0.18")
                        : meta.bg;
                      return (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-2 transition-colors duration-300"
                            style={{ background:metaBgFinal, ringColor:T.surface }}>
                            <Icon className="h-3.5 w-3.5" style={{ color:meta.color }} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                                style={{ color:T.textMuted }}>{meta.label}</span>
                              <span className="text-[10px] shrink-0" style={{ color:T.textMuted }}>
                                {event.createdAt ? new Date(event.createdAt).toLocaleString("en-PK",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}
                              </span>
                            </div>
                            {event.actor && (
                              <p className="text-[11px]" style={{ color:T.textMuted }}>
                                by <span className="font-medium" style={{ color:isDark?"#c4b5fd":"#5D0C74" }}>{safeStr(event.actor)}</span>
                              </p>
                            )}
                            <p className="text-[13px] mt-0.5 transition-colors duration-300" style={{ color:T.text }}>{safeStr(event.message)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </PanelCard>
        </div>

        {/* RIGHT col */}
        <div className="space-y-4">

          {/* Properties */}
          <PanelCard title="Properties" isDark={isDark}>
            <div className="px-5 py-1">
              <PropRow icon={AlertCircle} label="Status" isDark={isDark}>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-0.5 rounded-full transition-colors duration-300"
                  style={{ background:sBg, color:sText, border:`1px solid ${sBorder}` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background:sDot }} />{sc.label}
                </span>
              </PropRow>
              <PropRow icon={ShieldAlert} label="Priority" isDark={isDark}>
                <span className="inline-flex items-center text-[12px] font-semibold px-2.5 py-0.5 rounded-full transition-colors duration-300"
                  style={{ background:pBg, color:pText, border:`1px solid ${pBorder}` }}>
                  {pc.label}
                </span>
              </PropRow>
              <PropRow icon={CalendarDays} label="SLA Deadline" isDark={isDark}>
                <SlaBadge deadline={ticket.slaDeadline} isDark={isDark} />
              </PropRow>
              <PropRow icon={Tag} label="Category" isDark={isDark}>
                {categoryName ? <span>{categoryName}</span> : <span style={{ color:T.textMuted }}>—</span>}
              </PropRow>
              <PropRow icon={Building2} label="Department" isDark={isDark}>
                {departmentName ? <span>{departmentName}</span> : <span style={{ color:T.textMuted }}>—</span>}
              </PropRow>
              <PropRow icon={User} label="Assigned To" isDark={isDark}>
                {assignedName ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full text-[10px] font-bold inline-flex items-center justify-center text-white"
                      style={{ background:`linear-gradient(135deg,${T.assignedAvatarFrom},${T.assignedAvatarTo})` }}>
                      {assignedName.charAt(0)}
                    </span>
                    {assignedName}
                  </span>
                ) : (
                  <span className="text-[12px] font-medium" style={{ color:isDark?"#a78bfa":"#9662A4" }}>Unassigned</span>
                )}
              </PropRow>
              <PropRow icon={CalendarDays} label="Created" isDark={isDark}>
                {new Date(ticket.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}
              </PropRow>
              {assetName && (
                <PropRow icon={Tag} label="Asset" isDark={isDark}>
                  {assetName}{assetType && <span style={{ color:T.textMuted }}> ({assetType})</span>}
                </PropRow>
              )}
            </div>
          </PanelCard>

          {/* Update panel */}
          {canEdit && (
            <PanelCard title="Update Ticket" isDark={isDark}>
              <div className="px-5 py-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300" style={{ color:T.textMuted }}>Status</p>
                  <div className="flex gap-2">
                    <Select value={localStatus} onValueChange={setLocalStatus}>
                      <SelectTrigger
                        className="flex-1 h-9 text-[13px] transition-colors duration-300"
                        style={{ borderColor:T.selectBorder, background:T.selectBg, color:T.text }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background:T.surface, borderColor:T.border }}>
                        {["open","in-progress","resolved","closed"].map(v=>(
                          <SelectItem key={v} value={v} style={{ color:T.text }}>
                            {v.charAt(0).toUpperCase()+v.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      className="h-9 px-3.5 rounded-[9px] text-[13px] font-semibold text-white shrink-0 flex items-center transition-all disabled:opacity-50"
                      style={{ background:T.updateSaveBg }}
                      onClick={handleUpdateStatus}
                      disabled={savingStatus || localStatus === norm(safeStr(ticket.status))}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.updateSaveHov}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=T.updateSaveBg}
                    >
                      {savingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                    </button>
                  </div>
                </div>

                {canAssign && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300" style={{ color:T.textMuted }}>Assign Agent</p>
                    <div className="flex gap-2">
                      <Select value={localAgent} onValueChange={setLocalAgent}>
                        <SelectTrigger
                          className="flex-1 h-9 text-[13px] transition-colors duration-300"
                          style={{ borderColor:T.selectBorder, background:T.selectBg, color:T.text }}
                        >
                          <SelectValue placeholder="Select agent…" />
                        </SelectTrigger>
                        <SelectContent style={{ background:T.surface, borderColor:T.border }}>
                          {agents.length === 0
                            ? <SelectItem value="__none__" disabled style={{ color:T.textMuted }}>No agents found</SelectItem>
                            : agents.map(a=>(
                              <SelectItem key={a.id} value={String(a.id)} style={{ color:T.text }}>{safeStr(a.name)}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <button
                        className="h-9 px-3.5 rounded-[9px] text-[13px] font-semibold text-white shrink-0 flex items-center transition-all disabled:opacity-50"
                        style={{ background:T.updateSaveBg }}
                        onClick={handleAssign}
                        disabled={savingAssign || !localAgent}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.updateSaveHov}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=T.updateSaveBg}
                      >
                        {savingAssign ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Assign"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </PanelCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;