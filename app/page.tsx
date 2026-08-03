"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CloudUpload,
  Database,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  MapPin,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Save,
  Settings2,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { generateQuote, type BodyType, type ConditionCode, type GeneratedQuote, type QuoteCondition, type ServiceCode } from "../lib/quote-engine";

type QuoteStatus = "Review needed" | "Ready to send" | "More photos" | "Booked";
type QuoteType = "firm" | "bounded" | "evidence" | "review";

type Inspection = {
  id: string;
  customer: string;
  initials: string;
  vehicle: string;
  year: string;
  service: string;
  received: string;
  status: QuoteStatus;
  quote: number;
  quoteType: QuoteType;
  confidence: number;
  location: string;
  initialsTone: string;
  conditions: string[];
  photos: number;
};

const inspections: Inspection[] = [
  {
    id: "quo_01K2ABC",
    customer: "Maya Chen",
    initials: "MC",
    vehicle: "Honda CR-V Touring",
    year: "2021",
    service: "Interior deep clean",
    received: "12 min ago",
    status: "Review needed",
    quote: 305.1,
    quoteType: "review",
    confidence: 89,
    location: "Toronto, ON",
    initialsTone: "lavender",
    conditions: ["Pet hair", "Winter salt"],
    photos: 8,
  },
  {
    id: "quo_01K2A94",
    customer: "Aaron Lopez",
    initials: "AL",
    vehicle: "Ford Bronco Sport",
    year: "2023",
    service: "Exterior decontamination",
    received: "28 min ago",
    status: "Ready to send",
    quote: 189.0,
    quoteType: "firm",
    confidence: 94,
    location: "Etobicoke, ON",
    initialsTone: "peach",
    conditions: ["Road film", "Brake dust"],
    photos: 7,
  },
  {
    id: "quo_01K2A8C",
    customer: "Priya Nair",
    initials: "PN",
    vehicle: "Tesla Model Y",
    year: "2022",
    service: "Combined detail",
    received: "44 min ago",
    status: "More photos",
    quote: 0,
    quoteType: "evidence",
    confidence: 62,
    location: "Mississauga, ON",
    initialsTone: "mint",
    conditions: ["Rear seats missing"],
    photos: 5,
  },
  {
    id: "quo_01K29XQ",
    customer: "Noah Williams",
    initials: "NW",
    vehicle: "Mazda CX-5 GT",
    year: "2020",
    service: "Interior deep clean",
    received: "1 hr ago",
    status: "Booked",
    quote: 274.5,
    quoteType: "firm",
    confidence: 92,
    location: "North York, ON",
    initialsTone: "blue",
    conditions: ["Fabric staining"],
    photos: 9,
  },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Inspections", icon: ClipboardCheck, count: 6 },
  { label: "Pricing rules", icon: Tag },
  { label: "Customers", icon: UsersRound },
];

const photoSteps = [
  { label: "Front exterior", short: "Front", done: true },
  { label: "Driver side", short: "Side", done: true },
  { label: "Rear seats", short: "Seats", done: true },
  { label: "Front footwells", short: "Footwells", done: false },
  { label: "Cargo area", short: "Cargo", done: false },
];

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

function StatusPill({ status }: { status: QuoteStatus }) {
  const className = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill ${className}`}>{status}</span>;
}

function Confidence({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className={`confidence ${compact ? "compact" : ""}`}>
      <span className="confidence-dot" />
      <span>{value}% confidence</span>
    </div>
  );
}

function VehicleSketch({ variant = "interior", compact = false }: { variant?: "interior" | "exterior" | "rear"; compact?: boolean }) {
  return (
    <div className={`vehicle-sketch ${variant} ${compact ? "compact" : ""}`} aria-label="Vehicle inspection photo preview">
      <div className="sketch-topline"><span>LIVE CAPTURE</span><span className="sketch-dot" /></div>
      <div className="sketch-road" />
      <div className="sketch-glow" />
      <div className="sketch-car">
        <div className="car-roof" />
        <div className="car-window window-left" />
        <div className="car-window window-right" />
        <div className="car-seat seat-left" />
        <div className="car-seat seat-right" />
        <div className="car-dash" />
        <div className="car-wheel wheel-left" />
        <div className="car-wheel wheel-right" />
      </div>
      <div className="sketch-label">
        <span>{variant === "interior" ? "Rear seats" : variant === "rear" ? "Rear exterior" : "Front exterior"}</span>
        <span className="sketch-check"><Check size={12} strokeWidth={3} /></span>
      </div>
      {!compact && <div className="sketch-corners"><i /><i /><i /><i /></div>}
    </div>
  );
}

function MiniBar({ label, value, color = "green" }: { label: string; value: number; color?: string }) {
  return (
    <div className="mini-bar-row">
      <div className="mini-bar-heading"><span>{label}</span><strong>{value}%</strong></div>
      <div className="mini-bar"><span className={color} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

type UploadedInspectionImage = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  qualityScore: number;
  brightness: number;
  usable: boolean;
  warnings: string[];
};

const conditionChoices: Array<{ code: ConditionCode; label: string; short: string }> = [
  { code: "pet_hair", label: "Pet hair", short: "Hair" },
  { code: "winter_salt", label: "Winter salt", short: "Salt" },
  { code: "stain_spill", label: "Stains / spills", short: "Stains" },
  { code: "road_film", label: "Road film", short: "Road film" },
  { code: "brake_dust", label: "Brake dust", short: "Brake dust" },
  { code: "water_spots", label: "Water spots", short: "Water spots" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function analyzeImageFile(file: File): Promise<UploadedInspectionImage> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 120;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const warnings: string[] = [];
      let brightness = 0.5;
      let sharpness = 0.7;
      if (context) {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let brightnessTotal = 0;
        let edgeTotal = 0;
        let edgeSamples = 0;
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            const index = (y * canvas.width + x) * 4;
            const value = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 765;
            brightnessTotal += value;
            if (x + 2 < canvas.width) {
              const nextIndex = (y * canvas.width + x + 2) * 4;
              const next = (pixels[nextIndex] + pixels[nextIndex + 1] + pixels[nextIndex + 2]) / 765;
              edgeTotal += Math.abs(value - next);
              edgeSamples += 1;
            }
          }
        }
        brightness = brightnessTotal / ((canvas.width / 2) * (canvas.height / 2));
        const edgeEnergy = edgeSamples ? edgeTotal / edgeSamples : 0;
        sharpness = clamp(edgeEnergy * 8, 0.1, 1);
      }
      if (brightness < 0.16) warnings.push("Very dark");
      if (brightness > 0.9) warnings.push("Overexposed");
      if (sharpness < 0.28) warnings.push("May be blurry");
      if (image.width < 900 || image.height < 600) warnings.push("Low resolution");
      const exposureScore = 1 - Math.min(1, Math.abs(brightness - 0.52) * 1.8);
      const qualityScore = clamp(sharpness * 0.62 + exposureScore * 0.38, 0, 1);
      resolve({ id: `${file.name}-${file.lastModified}`, name: file.name, url, width: image.width, height: image.height, qualityScore, brightness, usable: qualityScore >= 0.42 && image.width >= 640 && image.height >= 480, warnings });
    };
    image.onerror = () => resolve({ id: `${file.name}-${file.lastModified}`, name: file.name, url, width: 0, height: 0, qualityScore: 0.15, brightness: 0.5, usable: false, warnings: ["Preview unavailable"] });
    image.src = url;
  });
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState(inspections[0].id);
  const [search, setSearch] = useState("");
  const [showCapture, setShowCapture] = useState(false);
  const [captureStep, setCaptureStep] = useState(0);
  const [showCustomerPreview, setShowCustomerPreview] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("Estimate");
  const [uploadName, setUploadName] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedInspectionImage[]>([]);
  const [isAnalyzingUploads, setIsAnalyzingUploads] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(null);
  const [quoteService, setQuoteService] = useState<ServiceCode>("interior_deep_clean");
  const [quoteBodyType, setQuoteBodyType] = useState<BodyType>("compact_suv");
  const [quoteMobileService, setQuoteMobileService] = useState(true);
  const [quotePostalCode, setQuotePostalCode] = useState("M5V 2T6");
  const [quoteConditions, setQuoteConditions] = useState<QuoteCondition[]>([
    { code: "pet_hair", severity: 3, coverage: "moderate" },
    { code: "winter_salt", severity: 2, coverage: "small" },
  ]);
  const [labourMinutes, setLabourMinutes] = useState(210);
  const [overrideNote, setOverrideNote] = useState("Quote adjusted to reflect visible rear-seat pet hair and winter salt. No hidden conditions assumed.");
  const [toast, setToast] = useState("");

  const selected = inspections.find((item) => item.id === selectedId) ?? inspections[0];
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return inspections;
    return inspections.filter((item) =>
      [item.customer, item.vehicle, item.service, item.status].some((value) => value.toLowerCase().includes(term)),
    );
  }, [search]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const beginCapture = () => {
    setCaptureStep(0);
    setUploadName("");
    setGeneratedQuote(null);
    setUploadedImages([]);
    setShowCapture(true);
  };

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    setIsAnalyzingUploads(true);
    setGeneratedQuote(null);
    const analyzed = await Promise.all(files.slice(0, 12).map(analyzeImageFile));
    setUploadedImages(analyzed);
    setUploadName(`${analyzed.length} photo${analyzed.length === 1 ? "" : "s"} selected`);
    setIsAnalyzingUploads(false);
  };

  const toggleCondition = (code: ConditionCode) => {
    setQuoteConditions((current) => current.some((condition) => condition.code === code)
      ? current.filter((condition) => condition.code !== code)
      : [...current, { code, severity: 2, coverage: "moderate" }]);
  };

  const updateCondition = (code: ConditionCode, patch: Partial<QuoteCondition>) => {
    setQuoteConditions((current) => current.map((condition) => condition.code === code ? { ...condition, ...patch } : condition));
  };

  const generateUploadedQuote = () => {
    const usableImages = uploadedImages.filter((image) => image.usable);
    const averageQuality = uploadedImages.length ? uploadedImages.reduce((total, image) => total + image.qualityScore, 0) / uploadedImages.length : 0;
    setGeneratedQuote(generateQuote({ service: quoteService, bodyType: quoteBodyType, mobileService: quoteMobileService, postalCode: quotePostalCode, imageCount: uploadedImages.length, usableImageCount: usableImages.length, qualityScore: averageQuality, conditions: quoteConditions }));
    setCaptureStep(2);
  };

  const navigate = (label: string) => {
    setActiveNav(label);
    if (label === "Pricing rules") setShowPricing(true);
    if (label === "Customers") setShowCustomers(true);
    if (label === "Calendar") setShowCalendar(true);
    if (label === "Settings") setShowSettings(true);
  };

  const adjustedQuote = Math.max(0, (selected.quote || 0) + (labourMinutes - 210) * 0.65);
  const usableUploadedCount = uploadedImages.filter((image) => image.usable).length;
  const uploadQualityPercent = uploadedImages.length ? Math.round((uploadedImages.reduce((total, image) => total + image.qualityScore, 0) / uploadedImages.length) * 100) : 0;
  const serviceLabelsForDisplay: Record<ServiceCode, string> = {
    interior_deep_clean: "Interior deep clean",
    exterior_decontamination: "Exterior decontamination",
    combined_detail: "Combined detail",
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><span /></div>
          <div><strong>clearcoat</strong><small>quote studio</small></div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">ND</div>
          <div className="workspace-copy"><strong>Northline Detail Co.</strong><span>Toronto, Canada</span></div>
          <ChevronDown size={15} />
        </div>

        <p className="nav-label">Workspace</p>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => navigate(label)}>
              <Icon size={17} strokeWidth={activeNav === label ? 2.3 : 1.8} />
              <span>{label}</span>
              {count && <em>{count}</em>}
            </button>
          ))}
        </nav>
        <p className="nav-label nav-label-spaced">Manage</p>
        <nav className="main-nav">
          <button className={`nav-item ${activeNav === "Calendar" ? "active" : ""}`} onClick={() => navigate("Calendar")}><CalendarDays size={17} /><span>Calendar</span></button>
          <button className={`nav-item ${activeNav === "Settings" ? "active" : ""}`} onClick={() => navigate("Settings")}><Settings2 size={17} /><span>Settings</span></button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-help">
          <div className="help-icon"><CircleHelp size={17} /></div>
          <div><strong>Need a hand?</strong><span>Read the capture guide</span></div>
          <ChevronRight size={15} />
        </div>
        <div className="profile-row">
          <div className="profile-avatar">JD</div>
          <div><strong>Jordan Davis</strong><span>Estimator</span></div>
          <MoreHorizontal size={17} />
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark"><span /></div><strong>clearcoat</strong></div>
          <div className="crumbs"><span>Workspace</span><ChevronRight size={13} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <div className="date-chip"><CalendarDays size={14} /> Aug 01, 2026 <ChevronDown size={13} /></div>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
            <button className="avatar-button">JD</button>
            <button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
          </div>
        </header>

        <div className="page-container">
          <div className="page-heading">
            <div>
              <p className="eyebrow"><span className="live-pulse" /> Thursday, August 1 · 9:41 AM</p>
              <h1>Good morning, Jordan <span>✦</span></h1>
              <p className="heading-subtitle">Here’s what needs your attention today.</p>
            </div>
            <div className="heading-actions">
              <button className="secondary-button" onClick={() => notify("Capture protocol exported as a PDF")}> <FileText size={16} /> Export report</button>
              <button className="primary-button" onClick={beginCapture}><Plus size={17} /> New inspection</button>
            </div>
          </div>

          <section className="stat-grid" aria-label="Inspection overview">
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon lime"><ClipboardCheck size={17} /></span><span className="trend positive"><ArrowUpRight size={13} /> 12.4%</span></div>
              <p>Inspections today</p><strong>28</strong><small>vs 25 last Thursday</small>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon blue"><Zap size={17} /></span><span className="trend positive"><ArrowUpRight size={13} /> 8.2%</span></div>
              <p>Auto-quoted</p><strong>71<span>%</span></strong><small>of complete captures</small>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon amber"><Clock3 size={17} /></span><span className="trend neutral">steady</span></div>
              <p>Avg. review time</p><strong>4<span className="unit">m</span> 12<span className="unit">s</span></strong><small>2m faster than target</small>
            </div>
            <div className="stat-card emphasis">
              <div className="stat-top"><span className="stat-icon coral"><Gauge size={17} /></span><span className="trend warning"><ArrowDownRight size={13} /> 3.1%</span></div>
              <p>Needs your review</p><strong>6</strong><small>2 high-value cases</small>
            </div>
          </section>

          <section className="focus-banner">
            <div className="focus-copy"><div className="focus-icon"><Sparkles size={18} /></div><div><strong>Quote engine is learning from your edits</strong><span>42 approved overrides this week · estimated labour accuracy is up 6.8%</span></div></div>
            <button onClick={() => notify("Model learning report opened")}>View learning report <ChevronRight size={15} /></button>
          </section>

          <div className="content-grid">
            <section className="queue-card panel-card">
              <div className="panel-header queue-header">
                <div><h2>Inspection queue</h2><p>Recent photo submissions and quote status</p></div>
                <div className="panel-tools"><button className="filter-button"><ListFilter size={15} /> Filter <ChevronDown size={13} /></button><button className="more-button"><MoreHorizontal size={18} /></button></div>
              </div>
              <div className="queue-controls"><div className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inspections" /></div><div className="queue-sort">Newest first <ChevronDown size={14} /></div></div>
              <div className="queue-table-wrap">
                <table className="queue-table">
                  <thead><tr><th>Customer</th><th>Vehicle & service</th><th>Submitted</th><th>Quote</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className={selectedId === item.id ? "selected" : ""} onClick={() => { setSelectedId(item.id); setActiveDetailTab("Estimate"); }}>
                        <td><div className="customer-cell"><div className={`customer-avatar ${item.initialsTone}`}>{item.initials}</div><div><strong>{item.customer}</strong><span>{item.location}</span></div></div></td>
                        <td><div className="vehicle-cell"><strong>{item.year} {item.vehicle}</strong><span>{item.service}</span></div></td>
                        <td><span className="submitted-time">{item.received}</span></td>
                        <td><strong className={item.quote === 0 ? "muted-quote" : ""}>{item.quote === 0 ? "—" : money.format(item.quote)}</strong></td>
                        <td><StatusPill status={item.status} /></td>
                        <td><button className="row-arrow" aria-label={`Open ${item.customer}`}><ChevronRight size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><Search size={21} /><strong>No inspections found</strong><span>Try a different name, vehicle, or status.</span></div>}
              </div>
              <div className="table-footer"><span>Showing {filtered.length} of 28 inspections</span><button onClick={() => notify("All inspections loaded")}>View all inspections <ArrowUpRight size={14} /></button></div>
            </section>

            <aside className="health-card panel-card">
              <div className="panel-header"><div><h2>Quote health</h2><p>Last 7 days</p></div><button className="more-button"><MoreHorizontal size={18} /></button></div>
              <div className="health-score"><div className="score-ring"><div className="score-inner"><strong>89</strong><span>overall</span></div></div><div className="health-summary"><strong>Looking good</strong><span>Above your 85% target</span><small><ArrowUpRight size={12} /> 4.6% this week</small></div></div>
              <div className="health-bars"><MiniBar label="Capture quality" value={94} /><MiniBar label="Vision confidence" value={87} color="blue" /><MiniBar label="Pricing confidence" value={90} color="amber" /></div>
              <div className="health-note"><ShieldCheck size={16} /><div><strong>Safety routing is active</strong><span>Low-confidence and hazardous cases are held for review.</span></div></div>
              <button className="text-button" onClick={() => notify("Quality details opened")}>See quality details <ChevronRight size={15} /></button>
            </aside>
          </div>

          <section className="detail-section">
            <div className="detail-heading"><div><p className="eyebrow">Selected inspection</p><h2>{selected.customer} <span className="quote-id">{selected.id}</span></h2></div><div className="detail-actions"><button className="secondary-button small" onClick={() => setShowCustomerPreview(true)}><UserRound size={15} /> Customer preview</button><button className="primary-button small" onClick={() => setShowReview(true)}><CheckCircle2 size={15} /> Approve & notify</button></div></div>
            <div className="detail-card panel-card">
              <div className="detail-tabs">{["Estimate", "Evidence", "Audit trail"].map((tab) => <button key={tab} className={activeDetailTab === tab ? "active" : ""} onClick={() => setActiveDetailTab(tab)}>{tab}{tab === "Evidence" && <span>8</span>}</button>)}</div>
              {activeDetailTab === "Estimate" && <div className="estimate-grid">
                <div className="evidence-column">
                  <div className="evidence-heading"><div><h3>What’s visible in the photos</h3><p>AI findings are evidence, not hidden-condition guarantees.</p></div><Confidence value={selected.confidence} /></div>
                  <div className="photo-grid"><div className="photo-large"><VehicleSketch variant="interior" /><div className="overlay-tag pet"><span /> Pet hair · high <small>0.88</small></div></div><div className="photo-small"><VehicleSketch variant="rear" compact /><div className="overlay-tag salt"><span /> Salt · moderate</div></div><div className="photo-small"><VehicleSketch variant="exterior" compact /><div className="overlay-tag road"><span /> Road film</div></div></div>
                  <div className="finding-row"><div className="finding-icon hair">⌁</div><div><strong>Heavy rear-seat pet hair</strong><span>2 seating surfaces · coverage band: moderate</span></div><span className="finding-confidence">88%</span></div>
                  <div className="finding-row"><div className="finding-icon salt-icon">✳</div><div><strong>Winter salt extraction</strong><span>Front footwells · coverage band: 10–30%</span></div><span className="finding-confidence">81%</span></div>
                  <button className="outline-wide" onClick={() => setActiveDetailTab("Evidence")}><ImageIcon size={15} /> Review all 8 photos <ChevronRight size={15} /></button>
                </div>
                <div className="quote-column">
                  <div className="quote-head"><div><span className="quote-label">Recommended quote</span><h3>{money.format(selected.quote || 0)}</h3><span className="quote-sub">CAD · valid for 7 days</span></div><div className="quote-type">{selected.quoteType === "review" ? <><span className="status-dot amber-dot" /> Review needed</> : <><span className="status-dot green-dot" /> Firm quote</>}</div></div>
                  {selected.quote > 0 ? <>
                    <div className="line-items"><div><span>Interior deep-clean package</span><strong>{money.format(190)}</strong></div><div><span>Heavy pet-hair treatment</span><strong>{money.format(65)}</strong></div><div><span>Mobile service travel</span><strong>{money.format(15)}</strong></div><div className="line-divider" /><div><span>HST <small>13%</small></span><strong>{money.format(35.1)}</strong></div><div className="total-line"><span>Total</span><strong>{money.format(305.1)}</strong></div></div>
                    <div className="duration"><Clock3 size={15} /><span>Estimated duration</span><strong>3–4¼ hrs</strong></div>
                    <div className="assumptions"><div className="assumption-title"><ShieldCheck size={15} /> Assumptions & exclusions <ChevronRight size={14} /></div><p>No biohazard or severe odour is visible. Loose personal items will be removed before service.</p></div>
                    <div className="quote-footer"><button className="secondary-button full" onClick={() => setShowReview(true)}>Edit estimate</button><button className="primary-button full" onClick={() => setShowReview(true)}>Approve quote <ArrowUpRight size={15} /></button></div>
                  </> : <div className="more-evidence-state"><div className="more-evidence-icon"><Camera size={22} /></div><strong>Two more views needed</strong><p>The rear seats are not visible enough to price the combined detail with confidence.</p><button className="primary-button full" onClick={beginCapture}>Request photos <Camera size={15} /></button></div>}
                </div>
              </div>}
              {activeDetailTab === "Evidence" && <div className="evidence-tab"><div className="evidence-tab-header"><div><h3>Capture evidence</h3><p>8 of 8 required views received · all originals retained for 30 days</p></div><button className="secondary-button small" onClick={() => notify("Photo set downloaded")}> <CloudUpload size={15} /> Download set</button></div><div className="evidence-gallery">{photoSteps.map((step, index) => <div className="gallery-item" key={step.label}><VehicleSketch variant={index === 2 ? "interior" : index === 4 ? "rear" : "exterior"} compact /><div><strong>{step.label}</strong><span><Check size={12} /> usable · 0.{index + 81}</span></div></div>)}</div><div className="evidence-callout"><ShieldCheck size={17} /><div><strong>Privacy checks passed</strong><span>Location metadata removed · no face or licence-plate redaction required in this review.</span></div></div></div>}
              {activeDetailTab === "Audit trail" && <div className="audit-tab"><div className="audit-summary"><div><span>Quote version</span><strong>v4</strong></div><div><span>Pricing rules</span><strong>ontario-retail-42</strong></div><div><span>Model trace</span><strong>3 models</strong></div><div><span>Last updated</span><strong>12 min ago</strong></div></div><div className="timeline"><div className="timeline-item"><span className="timeline-marker green" /><div><strong>Automated quote generated</strong><span>Model confidence 89% · C$289.00 original recommendation</span></div><time>9:29 AM</time></div><div className="timeline-item"><span className="timeline-marker amber" /><div><strong>Review flag raised</strong><span>High-value pet-hair treatment exceeds auto-approve threshold</span></div><time>9:29 AM</time></div><div className="timeline-item"><span className="timeline-marker blue" /><div><strong>Inspection received</strong><span>8 accepted images · capture protocol 3.1</span></div><time>9:28 AM</time></div></div></div>}
            </div>
          </section>
        </div>
      </section>

      {showCapture && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCapture(false); }}><div className="capture-modal">
        <div className="modal-top"><div><span className="modal-kicker">Real photo quote</span><h2>{captureStep < 2 ? "Guided vehicle capture" : "Quote ready to review"}</h2></div><button className="close-button" onClick={() => setShowCapture(false)}><X size={18} /></button></div>
        {captureStep < 2 ? <>
          <div className="capture-progress"><span className="active" /><span className={captureStep >= 1 ? "active" : ""} /><span className={captureStep >= 2 ? "active" : ""} /></div>
          {captureStep === 0 && <div className="capture-intro">
            <div className="service-picker"><span>Service requested</span><select value={quoteService} onChange={(event) => setQuoteService(event.target.value as ServiceCode)}><option value="interior_deep_clean">Interior deep clean</option><option value="exterior_decontamination">Exterior decontamination</option><option value="combined_detail">Combined detail</option></select></div>
            <div className="capture-meta-grid"><label>Vehicle class <div className="modal-input"><CarFront size={15} /><select value={quoteBodyType} onChange={(event) => setQuoteBodyType(event.target.value as BodyType)}><option value="sedan">Sedan</option><option value="compact_suv">Compact SUV</option><option value="full_size_suv">Full-size SUV</option><option value="truck">Truck</option></select></div></label><label>Postal code <div className="modal-input"><MapPin size={15} /><input value={quotePostalCode} onChange={(event) => setQuotePostalCode(event.target.value.toUpperCase())} placeholder="M5V 2T6" /></div></label></div>
            <label className="upload-dropzone"><input type="file" accept="image/jpeg,image/png,image/webp,image/heic" capture="environment" multiple onChange={(event) => void handleUpload(Array.from(event.currentTarget.files ?? []))} /><span className="upload-icon"><CloudUpload size={17} /></span><span><strong>{isAnalyzingUploads ? "Analyzing photos…" : uploadName || "Upload vehicle photos"}</strong><small>{uploadedImages.length ? `${usableUploadedCount} of ${uploadedImages.length} usable · ${uploadQualityPercent}% average quality` : "JPEG, PNG, WebP or HEIC · up to 20 MB each"}</small></span><ChevronRight size={15} /></label>
            {uploadedImages.length > 0 && <div className="upload-thumbnails">{uploadedImages.slice(0, 5).map((image) => <div className={`upload-thumb ${image.usable ? "usable" : "needs-review"}`} key={image.id}><img src={image.url} alt={image.name} /><span>{image.usable ? "Usable" : "Review"}</span></div>)}{uploadedImages.length > 5 && <div className="upload-more">+{uploadedImages.length - 5}</div>}</div>}
            <div className="consent-card"><div className="consent-check"><Check size={14} /></div><div><strong>Quote-processing consent recorded</strong><span>Photos are used to prepare this quote and normally deleted 30 days after service.</span></div><ChevronRight size={15} /></div>
            <label className="mobile-toggle"><input type="checkbox" checked={quoteMobileService} onChange={(event) => setQuoteMobileService(event.target.checked)} /><span className="toggle-track"><span /></span><span><strong>Mobile service</strong><small>Add travel based on the service postal code</small></span></label>
            <button className="primary-button full" disabled={isAnalyzingUploads || uploadedImages.length === 0} onClick={() => setCaptureStep(1)}>{uploadedImages.length ? "Review photo evidence" : "Upload photos to continue"} <ArrowUpRight size={16} /></button>
          </div>}
          {captureStep === 1 && <div className="quote-analysis-flow">
            <div className="analysis-header"><div><div className="success-badge"><Check size={14} /> Photos analyzed locally</div><h3>Review visible conditions</h3><p>Quality checks help decide whether this quote can be accepted automatically.</p></div><div className="analysis-score"><strong>{uploadQualityPercent}%</strong><span>photo quality</span></div></div>
            <div className="analysis-gallery">{uploadedImages.map((image) => <div className={`analysis-gallery-item ${image.usable ? "usable" : "needs-review"}`} key={image.id}><img src={image.url} alt={image.name} /><div><strong>{image.usable ? "Usable evidence" : "Needs another view"}</strong><span>{image.width && image.height ? `${image.width} × ${image.height}` : "Could not read image"}</span><small>{image.warnings.join(" · ") || "Lighting and sharpness look good"}</small></div></div>)}</div>
            <div className="condition-panel"><div className="condition-panel-heading"><div><strong>What can you see?</strong><span>Select every visible condition; these add transparent line items.</span></div><CircleHelp size={16} /></div><div className="condition-chips">{conditionChoices.map((choice) => { const condition = quoteConditions.find((item) => item.code === choice.code); return <button key={choice.code} className={condition ? "selected" : ""} onClick={() => toggleCondition(choice.code)}>{choice.short}{condition && <Check size={13} />}</button>; })}</div>{quoteConditions.length > 0 && <div className="condition-editor">{quoteConditions.map((condition) => <div className="condition-editor-row" key={condition.code}><strong>{conditionChoices.find((choice) => choice.code === condition.code)?.label}</strong><select value={condition.severity} onChange={(event) => updateCondition(condition.code, { severity: Number(event.target.value) as QuoteCondition["severity"] })}><option value={1}>Light</option><option value={2}>Moderate</option><option value={3}>Heavy</option><option value={4}>Severe</option></select><select value={condition.coverage} onChange={(event) => updateCondition(condition.code, { coverage: event.target.value as QuoteCondition["coverage"] })}><option value="spot">Spot</option><option value="small">Small area</option><option value="moderate">Moderate area</option><option value="pervasive">Pervasive</option></select><button className="icon-button" aria-label={`Remove ${condition.code}`} onClick={() => toggleCondition(condition.code)}><Trash2 size={14} /></button></div>)}</div>}</div>
            <div className="quote-analysis-actions"><button className="secondary-button" onClick={() => setCaptureStep(0)}>Replace photos</button><button className="primary-button" disabled={isAnalyzingUploads || usableUploadedCount === 0} onClick={generateUploadedQuote}>Generate quote <ArrowUpRight size={16} /></button></div>
          </div>}
        </> : <div className="capture-result">{generatedQuote ? <><div className="result-icon"><Check size={24} /></div><p className="modal-kicker">{generatedQuote.quoteType === "firm" ? "High-confidence quote" : generatedQuote.quoteType === "bounded" ? "Bounded quote" : generatedQuote.quoteType === "evidence" ? "More evidence recommended" : "Human review recommended"}</p><h3>{money.format(generatedQuote.total)}</h3><span className="result-sub">{serviceLabelsForDisplay[quoteService]} · {quoteBodyType.replaceAll("_", " ")}</span><div className="result-breakdown">{generatedQuote.lineItems.map((item) => <div key={item.code}><span>{item.label}</span><strong>{money.format(item.amount)}</strong></div>)}<div><span>HST</span><strong>{money.format(generatedQuote.tax)}</strong></div></div><div className="result-confidence"><Confidence value={Math.round(generatedQuote.confidence * 100)} /><span>{usableUploadedCount} of {uploadedImages.length} uploaded photos are usable</span></div><div className="quote-type-summary"><strong>{generatedQuote.actions.canAccept ? "Ready to send" : generatedQuote.actions.additionalEvidence ? "Hold for more photos" : "Save for estimator review"}</strong><span>{Math.round(generatedQuote.imageCoverage * 100)}% image coverage · estimated labour {(generatedQuote.labourMinutes / 60).toFixed(1)} hours</span></div><div className="result-assumptions"><strong>Quote assumptions</strong>{generatedQuote.assumptions.map((assumption) => <span key={assumption}>· {assumption}</span>)}</div><button className="primary-button full" onClick={() => { setShowCapture(false); notify(`Quote ${money.format(generatedQuote.total)} saved without payment processing`); }}>{generatedQuote.actions.canAccept ? "Save quote" : "Save quote for review"} <ArrowUpRight size={16} /></button></> : <div><h3>Generating quote…</h3><p className="result-sub">The local quote engine is preparing the breakdown.</p></div>}</div>}
        <div className="modal-footnote"><ShieldCheck size={13} /> Your quote is based on visible conditions in submitted photos.</div>
      </div></div>}

      {showCustomerPreview && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCustomerPreview(false); }}><div className="preview-modal"><div className="modal-top"><div><span className="modal-kicker">Customer quote preview</span><h2>What Maya sees</h2></div><button className="close-button" onClick={() => setShowCustomerPreview(false)}><X size={18} /></button></div><div className="phone-frame"><div className="phone-notch" /><div className="phone-content"><div className="phone-header"><ChevronDown size={16} /><span>clearcoat</span><CircleHelp size={15} /></div><p className="phone-eyebrow">YOUR DETAILING QUOTE</p><h3>C$305.10</h3><span className="phone-muted">Taxes and travel included</span><div className="phone-status"><CheckCircle2 size={15} /> High confidence · visible conditions</div><div className="phone-lines"><div><span>Interior deep clean</span><strong>C$190.00</strong></div><div><span>Pet-hair treatment</span><strong>C$65.00</strong></div><div><span>Mobile travel</span><strong>C$15.00</strong></div><div><span>HST</span><strong>C$35.10</strong></div></div><div className="phone-time"><Clock3 size={14} /> Estimated time: 3–4¼ hours</div><button className="primary-button full" onClick={() => { setShowCustomerPreview(false); notify("Customer quote link saved"); }}>Save quote link <ArrowUpRight size={15} /></button><button className="phone-link" onClick={() => { setShowCustomerPreview(false); setShowReview(true); }}>Request human review <ChevronRight size={14} /></button></div></div><div className="preview-note"><ShieldCheck size={15} /><span>Customers see scope, assumptions, and can request human review before accepting.</span></div></div></div>}

      {showReview && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowReview(false); }}><div className="review-modal"><div className="modal-top"><div><span className="modal-kicker">Estimator action</span><h2>Approve this quote?</h2></div><button className="close-button" onClick={() => setShowReview(false)}><X size={18} /></button></div><div className="review-summary"><div className="review-avatar">{selected.initials}</div><div><strong>{selected.customer}</strong><span>{selected.year} {selected.vehicle} · {selected.service}</span></div><div className="review-price">{money.format(adjustedQuote)}<span>v5 draft</span></div></div><div className="labour-editor"><div><strong>Estimated technician labour</strong><span>Adjusting this value updates the quote and records an override.</span></div><div className="stepper"><button onClick={() => setLabourMinutes((value) => Math.max(60, value - 15))}>−</button><strong>{(labourMinutes / 60).toFixed(2)} hrs</strong><button onClick={() => setLabourMinutes((value) => Math.min(600, value + 15))}>+</button></div></div><div className="override-card"><div className="override-heading"><div><strong>Override note</strong><span>Required for every review decision</span></div><Pencil size={14} /></div><textarea value={overrideNote} onChange={(event) => setOverrideNote(event.target.value)} /></div><div className="review-warning"><ShieldCheck size={16} /><span>Approving sends the customer a secure quote link. Payment processing is not part of this quote workflow.</span></div><div className="review-actions"><button className="secondary-button full" onClick={() => { setShowReview(false); notify("Quote saved as draft"); }}><Save size={14} /> Save draft</button><button className="primary-button full" onClick={() => { setShowReview(false); notify(`Quote approved at ${money.format(adjustedQuote)} and customer notified`); }}><CheckCheck size={15} /> Approve & notify</button></div></div></div>}


      {showPricing && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPricing(false); }}><div className="wide-modal"><div className="modal-top"><div><span className="modal-kicker">Admin console · Ontario retail</span><h2>Pricing rules</h2></div><button className="close-button" onClick={() => setShowPricing(false)}><X size={18} /></button></div><div className="admin-toolbar"><div className="version-chip"><CircleDollarSign size={15} /> ruleset <strong>ontario-retail-42</strong></div><button className="secondary-button small" onClick={() => notify("New pricing rule draft created")}><Plus size={14} /> Add rule</button></div><div className="rule-list"><div className="rule-header"><span>Rule / basis</span><span>Amount</span><span>Status</span><span /></div>{[{name:"Interior deep-clean · compact SUV",basis:"Package base",amount:"C$190.00",active:true},{name:"Pet hair · severity 3",basis:"Condition add-on",amount:"C$65.00",active:true},{name:"Mobile travel · zone 1",basis:"First 18 km included",amount:"C$15.00",active:true},{name:"Minimum booking charge",basis:"Guardrail",amount:"C$125.00",active:true},{name:"Winter salt extraction",basis:"Condition add-on",amount:"C$45.00",active:false}].map((rule) => <div className="rule-row" key={rule.name}><div><strong>{rule.name}</strong><span>{rule.basis}</span></div><strong>{rule.amount}</strong><span className={`rule-status ${rule.active ? "on" : "off"}`}><span /> {rule.active ? "Active" : "Draft"}</span><button className="icon-button" onClick={() => notify(`${rule.name} opened for editing`)}><Pencil size={14} /></button></div>)}</div><div className="admin-note"><Database size={16} /><div><strong>Versioned and auditable</strong><span>Every quote stores the ruleset version that produced it. Publish changes only after a test quote passes.</span></div><button className="text-button" onClick={() => notify("Pricing test suite started")}>Run test quote <ArrowUpRight size={14} /></button></div></div></div>}

      {showCustomers && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCustomers(false); }}><div className="wide-modal"><div className="modal-top"><div><span className="modal-kicker">Customer records</span><h2>Customers</h2></div><button className="close-button" onClick={() => setShowCustomers(false)}><X size={18} /></button></div><div className="customer-admin-head"><div className="search-box"><Search size={15} /><input placeholder="Search customers" /></div><button className="secondary-button small" onClick={() => notify("Customer import opened")}><Download size={14} /> Export CSV</button></div><div className="customer-list">{[{name:"Maya Chen",contact:"maya.chen@email.com",jobs:"3 jobs",last:"Today",tone:"lavender"},{name:"Aaron Lopez",contact:"aaron.lopez@email.com",jobs:"1 job",last:"Today",tone:"peach"},{name:"Priya Nair",contact:"priya.nair@email.com",jobs:"2 jobs",last:"Yesterday",tone:"mint"},{name:"Noah Williams",contact:"noah.williams@email.com",jobs:"5 jobs",last:"Jul 28",tone:"blue"}].map((customer) => <div className="customer-admin-row" key={customer.name}><div className={`customer-avatar ${customer.tone}`}>{customer.name.split(" ").map((name) => name[0]).join("")}</div><div><strong>{customer.name}</strong><span>{customer.contact}</span></div><span className="customer-jobs">{customer.jobs}</span><span className="customer-last">{customer.last}</span><button className="row-arrow" onClick={() => notify(`${customer.name}'s profile opened`)}><ChevronRight size={16} /></button></div>)}</div><div className="privacy-strip"><ShieldCheck size={16} /><span>Customer records are pseudonymous in analytics. Image access is role-restricted and automatically expires.</span></div></div></div>}

      {showCalendar && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCalendar(false); }}><div className="wide-modal calendar-modal"><div className="modal-top"><div><span className="modal-kicker">Dispatch calendar</span><h2>Upcoming appointments</h2></div><button className="close-button" onClick={() => setShowCalendar(false)}><X size={18} /></button></div><div className="calendar-summary"><div><span>Today</span><strong>8</strong><small>jobs scheduled</small></div><div><span>Open capacity</span><strong>62%</strong><small>across 3 technicians</small></div><div><span>Mobile travel</span><strong>4.8h</strong><small>buffer reserved</small></div></div><div className="appointment-list">{[{time:"10:00 AM",name:"Maya Chen",vehicle:"2021 Honda CR-V",service:"Interior deep clean",status:"Deposit paid"},{time:"11:30 AM",name:"Theo Grant",vehicle:"2019 Audi Q5",service:"Exterior decontamination",status:"Confirmed"},{time:"1:00 PM",name:"Noah Williams",vehicle:"2020 Mazda CX-5",service:"Combined detail",status:"Confirmed"}].map((appointment) => <div className="appointment-row" key={appointment.name}><div className="appointment-time"><strong>{appointment.time}</strong><span>Aug 8</span></div><div className="appointment-marker" /><div className="appointment-copy"><strong>{appointment.name}</strong><span>{appointment.vehicle} · {appointment.service}</span></div><span className="appointment-status"><Check size={12} /> {appointment.status}</span><button className="icon-button" onClick={() => notify(`${appointment.name}'s appointment opened`)}><MoreHorizontal size={16} /></button></div>)}</div><button className="secondary-button full" onClick={() => notify("Calendar sync refreshed")}><RefreshCw size={14} /> Refresh availability</button></div></div>}

      {showSettings && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSettings(false); }}><div className="wide-modal settings-modal"><div className="modal-top"><div><span className="modal-kicker">Workspace settings</span><h2>Privacy & controls</h2></div><button className="close-button" onClick={() => setShowSettings(false)}><X size={18} /></button></div><div className="settings-grid"><div className="settings-nav"><button className="active"><ShieldCheck size={15} /> Privacy & data</button><button><SlidersHorizontal size={15} /> Workspace</button><button><ExternalLink size={15} /> Integrations</button><button><KeyRound size={15} /> Team access</button></div><div className="settings-content"><div className="settings-section"><div className="settings-icon"><LockKeyhole size={16} /></div><div><strong>Photo retention</strong><span>Raw quote photos are deleted 30 days after expiry or service completion.</span></div><button className="toggle on"><span /></button></div><div className="settings-section"><div className="settings-icon"><Sparkles size={16} /></div><div><strong>Optional model improvement</strong><span>Use de-identified regions and outcomes to improve quoting models.</span></div><button className="toggle"><span /></button></div><div className="settings-section"><div className="settings-icon"><Bell size={16} /></div><div><strong>Customer notifications</strong><span>Send quote-ready, reminder, and appointment-change messages.</span></div><button className="toggle on"><span /></button></div><div className="settings-section danger"><div className="settings-icon"><Trash2 size={16} /></div><div><strong>Data rights tools</strong><span>Search, export, correct, or begin deletion for a customer record.</span></div><button className="text-button" onClick={() => notify("Data rights request started")}>Open tools <ChevronRight size={14} /></button></div><div className="settings-foot"><span>Last privacy review · Jul 30, 2026</span><button className="secondary-button small" onClick={() => notify("Settings saved")}>Save changes <Save size={14} /></button></div></div></div></div></div>}

      {toast && <div className="toast"><CheckCircle2 size={17} /><span>{toast}</span></div>}
    </main>
  );
}
