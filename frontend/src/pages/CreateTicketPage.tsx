import { useState, useEffect } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle, X, FileText, Loader2, ArrowLeft, Upload, Tag, Building2, Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ticketApi } from "@/api/ticketApi";
import { categoryApi } from "@/api/categoryApi";
import { departmentApi } from "@/api/departmentApi";
import { assetApi } from "@/api/assetApi";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high" | "urgent";

interface FormState {
  subject:      string;
  description:  string;
  categoryId:   string;
  departmentId: string;
  assetId:      string;
  priority:     Priority;
  attachment:   File | null;
}

/* ── Dark token map ───────────────────────────────────── */
const useDT = (isDark: boolean) => ({
  pageBg:       isDark ? "#0f0720"                              : "#f9f7ff",
  surface:      isDark ? "#1a0d30"                              : "#ffffff",
  surfaceAlt:   isDark ? "#160a2a"                              : "rgba(243,233,251,0.45)",
  border:       isDark ? "rgba(139,92,192,0.18)"                : "rgba(91,30,122,0.10)",
  borderStrong: isDark ? "rgba(139,92,192,0.30)"                : "rgba(91,30,122,0.18)",
  text:         isDark ? "#e8d5f8"                              : "#3d1052",
  textMuted:    isDark ? "#a78cc0"                              : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"                              : "#B89CC8",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(91,30,122,0.06), 0 8px 32px rgba(91,30,122,0.07)",
  inputBg:      isDark ? "#160a2a"                              : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)"                : "hsl(280 20% 88%)",
  inputFocusBorder: isDark ? "rgba(139,92,192,0.6)"            : "rgba(91,30,122,0.45)",
  inputFocusShadow: isDark ? "0 0 0 3px rgba(139,92,192,0.15)" : "0 0 0 3px rgba(91,30,122,0.09)",
  inputFocusBg: isDark ? "#1a0d30"                              : "#fff",
  inputColor:   isDark ? "#e8d5f8"                              : "#3d1052",
  labelColor:   isDark ? "#c4b5fd"                              : "#3d1052",
  divider:      isDark ? "rgba(139,92,192,0.08)"                : "rgba(91,30,122,0.08)",
  dividerText:  isDark ? "#a78cc0"                              : "#9B59B6",
  headerBg:     isDark ? "rgba(139,92,192,0.08)"                : "rgba(243,233,251,0.45)",
  footerBg:     isDark ? "rgba(139,92,192,0.05)"                : "rgba(243,233,251,0.20)",
  headerBorder: isDark ? "rgba(139,92,192,0.12)"                : "rgba(91,30,122,0.07)",
  iconBg:       isDark ? "rgba(139,92,192,0.15)"                : "rgba(91,30,122,0.1)",
  iconColor:    isDark ? "#c4b5fd"                              : "#5B1E7A",
  backBtn:      isDark ? "rgba(139,92,192,0.15)"                : "rgba(91,30,122,0.06)",
  backBtnBorder:isDark ? "rgba(139,92,192,0.25)"                : "rgba(91,30,122,0.15)",
  cancelBorder: isDark ? "rgba(139,92,192,0.25)"                : "rgba(91,30,122,0.20)",
  cancelColor:  isDark ? "#c4b5fd"                              : "#5B1E7A",
  cancelHover:  isDark ? "rgba(139,92,192,0.10)"                : "rgba(91,30,122,0.06)",
  dropBorder:   isDark ? "rgba(139,92,192,0.28)"                : "rgba(91,30,122,0.18)",
  dropBg:       isDark ? "rgba(139,92,192,0.06)"                : "rgba(243,233,251,0.25)",
  dropBorderHov:isDark ? "#a78bfa"                              : "#5B1E7A",
  dropBgHov:    isDark ? "rgba(139,92,192,0.12)"                : "rgba(91,30,122,0.04)",
  fileCardBg:   isDark ? "rgba(139,92,192,0.08)"                : "rgba(91,30,122,0.05)",
  fileCardBorder:isDark ? "rgba(139,92,192,0.20)"               : "rgba(91,30,122,0.14)",
  fileIconBg:   isDark ? "rgba(139,92,192,0.18)"                : "rgba(91,30,122,0.1)",
  priOptUnselBg:   isDark ? "rgba(139,92,192,0.06)"            : "rgba(91,30,122,0.04)",
  priOptUnselText: isDark ? "#a78cc0"                           : "#9B59B6",
  priOptUnselBorder: isDark ? "rgba(139,92,192,0.20)"          : "rgba(91,30,122,0.12)",
  selectTriggerBg:  isDark ? "#1a0d30"                         : "#ffffff",
});

const priorityOptions: {
  value: Priority; label: string;
  color: string; bg: string; border: string; shadow: string;
}[] = [
  { value:"low",    label:"Low",    color:"#7B5EA7", bg:"rgba(205,180,219,0.2)",  border:"rgba(205,180,219,0.4)",  shadow:"none" },
  { value:"medium", label:"Medium", color:"#7B2CBF", bg:"rgba(160,108,213,0.12)", border:"rgba(160,108,213,0.25)", shadow:"none" },
  { value:"high",   label:"High",   color:"#fff",    bg:"#7B2CBF",                border:"#7B2CBF",                shadow:"0 2px 8px rgba(123,44,191,0.3)" },
  { value:"urgent", label:"Urgent", color:"#fff",    bg:"#5A0E7A",                border:"#5A0E7A",                shadow:"0 2px 8px rgba(90,14,122,0.35)" },
];

/* ── Field label ──────────────────────────────────────── */
const FieldLabel = ({
  htmlFor, children, optional = false, isDark,
}: { htmlFor?: string; children: React.ReactNode; optional?: boolean; isDark: boolean }) => {
  const T = useDT(isDark);
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-[12px] font-semibold mb-2 block transition-colors duration-300"
      style={{ color: T.labelColor }}
    >
      {children}
      {optional
        ? <span className="text-[10px] font-normal ml-1" style={{ color: T.textMuted }}>(optional)</span>
        : <span className="text-[11px] ml-0.5" style={{ color: "#EF4444" }}>*</span>
      }
    </label>
  );
};

/* ── Section divider ──────────────────────────────────── */
const SectionDivider = ({
  title, icon: Icon, isDark,
}: { title: string; icon?: React.ElementType; isDark: boolean }) => {
  const T = useDT(isDark);
  return (
    <div className="flex items-center gap-3 my-1">
      <span className="h-px flex-1" style={{ background: T.divider }} />
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" style={{ color: T.dividerText }} />}
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: T.dividerText }}>
          {title}
        </span>
      </div>
      <span className="h-px flex-1" style={{ background: T.divider }} />
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────── */
const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [loading,     setLoading]     = useState(false);
  const [categories,  setCategories]  = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [assets,      setAssets]      = useState<any[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [dragOver,    setDragOver]    = useState(false);

  const [form, setForm] = useState<FormState>({
    subject:"", description:"", categoryId:"", departmentId:"",
    assetId:"", priority:"medium", attachment:null,
  });

  useEffect(() => {
    const load = async () => {
      setLoadingMeta(true);
      await Promise.allSettled([fetchCategories(), fetchDepartments(), fetchAssets()]);
      setLoadingMeta(false);
    };
    load();
  }, []);

  const fetchCategories = async () => {
    try { const res = await categoryApi.getCategories(); setCategories(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []); } catch {}
  };
  const fetchDepartments = async () => {
    try { const res = await departmentApi.getDepartments(); setDepartments(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []); } catch {}
  };
  const fetchAssets = async () => {
    try { const res = await assetApi.getMyAssets(); setAssets(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim())     { toast.error("Subject is required"); return; }
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    if (!form.categoryId)         { toast.error("Please select a category"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("subject",     form.subject.trim());
      fd.append("description", form.description.trim());
      fd.append("categoryId",  String(Number(form.categoryId)));
      fd.append("priority",    form.priority);
      if (form.departmentId) fd.append("department_id", form.departmentId);
      if (form.assetId)      fd.append("assetId",       form.assetId);
      if (form.attachment)   fd.append("attachment",    form.attachment);
      await ticketApi.createTicket(fd);
      navigate("/my-tickets");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5 MB."); return; }
    set("attachment", file);
  };

  const set = (field: keyof FormState, value: any) =>
    setForm(p => ({ ...p, [field]: value }));

  const inputStyle = {
    background: T.inputBg,
    border: `1.5px solid ${T.inputBorder}`,
    color: T.inputColor,
    fontFamily: "inherit",
  };

  return (
    <div className="w-full flex flex-col items-center transition-colors duration-300">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ct-input, .ct-textarea { transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .ct-input:focus, .ct-textarea:focus { outline: none; }
        .ct-back-btn { transition: all 0.15s ease; }
        .ct-cancel-btn { transition: all 0.15s ease; }
        .ct-submit-btn { transition: all 0.15s ease; }
        .ct-submit-btn:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(91,30,122,0.4) !important; transform: translateY(-1px); }
        .ct-submit-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .ct-priority-opt { transition: all 0.15s ease; cursor: pointer; }
        .ct-priority-opt:hover { transform: translateY(-1px); }
        .ct-drop-zone { transition: all 0.18s ease; }
      `}</style>

      <div className="w-full max-w-2xl space-y-5 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ct-back-btn h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{
              border: `1px solid ${T.backBtnBorder}`,
              color: T.iconColor,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.backBtn}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight transition-colors duration-300" style={{ color: T.text }}>
              Create New Ticket
            </h1>
            <p className="text-[13px] mt-0.5 transition-colors duration-300" style={{ color: T.textMuted }}>
              Submit an IT support request
            </p>
          </div>
        </div>

        {/* ── Form card ── */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl overflow-hidden transition-colors duration-300"
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              animation: "fadeUp 0.35s ease both",
            }}
          >
            {/* Card header */}
            <div
              className="px-6 py-4 transition-colors duration-300"
              style={{ borderBottom: `1px solid ${T.headerBorder}`, background: T.headerBg }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors duration-300"
                  style={{ background: T.iconBg }}
                >
                  <PlusCircle className="h-4 w-4" style={{ color: T.iconColor }} />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold transition-colors duration-300" style={{ color: T.text }}>
                    Ticket Details
                  </h2>
                  <p className="text-[11px] transition-colors duration-300" style={{ color: T.textMuted }}>
                    Provide as much detail as possible so we can resolve your issue quickly
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Subject ── */}
              <div>
                <FieldLabel htmlFor="subject" isDark={isDark}>Subject</FieldLabel>
                <input
                  id="subject"
                  className="ct-input w-full h-10 px-3.5 text-[13px] rounded-xl"
                  style={inputStyle}
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={e => set("subject", e.target.value)}
                  disabled={loading}
                  required
                  onFocus={e => {
                    e.target.style.borderColor = T.inputFocusBorder;
                    e.target.style.boxShadow = T.inputFocusShadow;
                    e.target.style.background = T.inputFocusBg;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = T.inputBorder;
                    e.target.style.boxShadow = "none";
                    e.target.style.background = T.inputBg;
                  }}
                />
              </div>

              {/* ── Classification ── */}
              <div className="space-y-4">
                <SectionDivider title="Classification" icon={Tag} isDark={isDark} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <FieldLabel isDark={isDark}>Category</FieldLabel>
                    <Select
                      value={form.categoryId}
                      onValueChange={v => set("categoryId", v)}
                      disabled={loading || loadingMeta}
                    >
                      <SelectTrigger
                        className="h-10 text-[13px] rounded-xl transition-colors duration-300"
                        style={{
                          borderColor: T.borderStrong,
                          color: form.categoryId ? T.text : T.textMuted,
                          background: T.selectTriggerBg,
                        }}
                      >
                        <SelectValue placeholder={loadingMeta ? "Loading…" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent style={{ background: T.surface, borderColor: T.border }}>
                        {categories.length === 0
                          ? <SelectItem value="__none__" disabled style={{ color: T.textMuted }}>No categories available</SelectItem>
                          : categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()} style={{ color: T.text }}>{c.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel isDark={isDark}>Priority</FieldLabel>
                    <div className="flex gap-2">
                      {priorityOptions.map(opt => {
                        const isSelected = form.priority === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            className="ct-priority-opt flex-1 h-10 rounded-xl text-[12px] font-semibold"
                            style={{
                              background: isSelected ? opt.bg : T.priOptUnselBg,
                              color:      isSelected ? opt.color : T.priOptUnselText,
                              border:     isSelected
                                ? `2px solid ${opt.border}`
                                : `1.5px solid ${T.priOptUnselBorder}`,
                              boxShadow: isSelected ? opt.shadow : "none",
                            }}
                            disabled={loading}
                            onClick={() => set("priority", opt.value)}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Assignment ── */}
              <div className="space-y-4">
                <SectionDivider title="Assignment" icon={Building2} isDark={isDark} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <FieldLabel optional isDark={isDark}>Department</FieldLabel>
                    <Select
                      value={form.departmentId}
                      onValueChange={v => set("departmentId", v === "__none__" ? "" : v)}
                      disabled={loading || loadingMeta}
                    >
                      <SelectTrigger
                        className="h-10 text-[13px] rounded-xl transition-colors duration-300"
                        style={{ borderColor: T.borderStrong, color: T.text, background: T.selectTriggerBg }}
                      >
                        <SelectValue placeholder="Auto-assign to IT" />
                      </SelectTrigger>
                      <SelectContent style={{ background: T.surface, borderColor: T.border }}>
                        <SelectItem value="__none__" style={{ color: T.text }}>Auto-assign to IT</SelectItem>
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={d.id.toString()} style={{ color: T.text }}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel optional isDark={isDark}>Related Asset</FieldLabel>
                    <Select
                      value={form.assetId}
                      onValueChange={v => set("assetId", v === "__none__" ? "" : v)}
                      disabled={loading || loadingMeta}
                    >
                      <SelectTrigger
                        className="h-10 text-[13px] rounded-xl transition-colors duration-300"
                        style={{ borderColor: T.borderStrong, color: T.text, background: T.selectTriggerBg }}
                      >
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent style={{ background: T.surface, borderColor: T.border }}>
                        <SelectItem value="__none__" style={{ color: T.text }}>None</SelectItem>
                        {assets.map((a: any) => (
                          <SelectItem key={a.id} value={a.id.toString()} style={{ color: T.text }}>
                            {a.name}{a.type ? ` (${a.type})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ── Description ── */}
              <div>
                <FieldLabel htmlFor="description" isDark={isDark}>Description</FieldLabel>
                <textarea
                  id="description"
                  className="ct-textarea w-full px-3.5 py-3 text-[13px] rounded-xl resize-none disabled:opacity-50"
                  style={inputStyle}
                  placeholder="Describe your issue in detail — include steps to reproduce, error messages, and any relevant context."
                  rows={5}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  disabled={loading}
                  onFocus={e => {
                    e.target.style.borderColor = T.inputFocusBorder;
                    e.target.style.boxShadow = T.inputFocusShadow;
                    e.target.style.background = T.inputFocusBg;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = T.inputBorder;
                    e.target.style.boxShadow = "none";
                    e.target.style.background = T.inputBg;
                  }}
                />
              </div>

              {/* ── Attachment ── */}
              <div>
                <FieldLabel optional isDark={isDark}>Attachment</FieldLabel>
                <p className="text-[11px] -mt-1 mb-3 transition-colors duration-300" style={{ color: T.textFaint }}>
                  PNG, JPG or PDF · Max 5 MB
                </p>

                {!form.attachment ? (
                  <div
                    className="ct-drop-zone relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer"
                    style={{
                      borderColor: dragOver ? T.dropBorderHov : T.dropBorder,
                      background:  dragOver ? T.dropBgHov    : T.dropBg,
                    }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={e => handleFile(e.target.files?.[0])}
                      accept=".png,.jpg,.jpeg,.pdf"
                      disabled={loading}
                    />
                    <div
                      className="h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-colors duration-300"
                      style={{ background: T.iconBg }}
                    >
                      <Upload className="h-5 w-5" style={{ color: T.iconColor }} />
                    </div>
                    <p className="text-[13px] font-semibold transition-colors duration-300" style={{ color: T.iconColor }}>
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[11px] mt-1 transition-colors duration-300" style={{ color: T.textMuted }}>
                      PNG, JPG, JPEG, PDF up to 5 MB
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-colors duration-300"
                    style={{ background: T.fileCardBg, border: `1px solid ${T.fileCardBorder}` }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                      style={{ background: T.fileIconBg }}
                    >
                      <FileText className="h-4 w-4" style={{ color: T.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate transition-colors duration-300" style={{ color: T.text }}>
                        {form.attachment.name}
                      </p>
                      <p className="text-[11px] transition-colors duration-300" style={{ color: T.textMuted }}>
                        {(form.attachment.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="h-7 w-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                      style={{ color: T.textMuted }}
                      onClick={() => set("attachment", null)}
                      disabled={loading}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div
              className="flex justify-end gap-3 px-6 py-4 transition-colors duration-300"
              style={{
                borderTop: `1px solid ${T.headerBorder}`,
                background: T.footerBg,
              }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="ct-cancel-btn h-10 px-5 rounded-xl text-[13px] font-medium disabled:opacity-50 transition-colors duration-300"
                style={{ border: `1px solid ${T.cancelBorder}`, color: T.cancelColor }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.cancelHover}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ct-submit-btn h-10 px-6 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 disabled:opacity-60 min-w-[150px] justify-center"
                style={{
                  background: "linear-gradient(135deg, #5B1E7A, #7B3A9E)",
                  boxShadow: "0 2px 8px rgba(91,30,122,0.3)",
                }}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  : <><PlusCircle className="h-4 w-4" /> Submit Ticket</>
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;