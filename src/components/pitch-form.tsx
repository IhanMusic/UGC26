"use client";

import { useState, useRef } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/utils";
import { CompletenessScore } from "@/components/completeness-score";
import { StoryboardViewer } from "@/components/storyboard-viewer";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = { id: string; name: string };

type DeliverableRow = {
  _key: string;
  id?: string;
  type: string;
  description: string;
  minSponsorshipDZD: string;
};

type Timeline = {
  shootingDate: string;
  postProdDate: string;
  releaseDate: string;
};

type FormState = {
  title: string;
  type: string;
  coverImageUrl: string;
  visibility: string;
  synopsis: string;
  platforms: string[];
  ageRange: string;
  country: string;
  targetAudience: string;
  selectedCategoryIds: string[];
  timeline: Timeline;
  teamDescription: string;
  references: string[];
  storyboardUrls: string[];
  pitchDocumentUrl: string;
  pitchDocumentName: string;
  budgetTarget: string;
  maxSponsors: number;
  bonusSponsorSlots: number;
  deliverables: DeliverableRow[];
};

type PitchForEdit = {
  id: string;
  title: string;
  type: string;
  synopsis: string;
  visibility: string;
  platforms: string[];
  ageRange: string | null;
  country: string | null;
  targetAudience: string | null;
  timeline: unknown;
  teamDescription: string | null;
  references: string[];
  storyboardUrls: string[];
  pitchDocumentUrl: string | null;
  budgetTarget: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  coverImageUrl: string | null;
  pitchDeliverables: Array<{
    id: string;
    type: string;
    description: string;
    minSponsorshipDZD: number | null;
  }>;
  categories: Array<{ category: { id: string; name: string } }>;
};

interface PitchFormProps {
  mode: "create" | "edit";
  categories: Category[];
  initialPitch?: PitchForEdit;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PITCH_TYPES = [
  { value: "MINI_FILM", label: "Mini-film" },
  { value: "SERIE", label: "Série" },
  { value: "SHOOTING", label: "Shooting" },
  { value: "PODCAST", label: "Podcast" },
  { value: "REPORTAGE", label: "Reportage" },
  { value: "CLIP_MUSICAL", label: "Clip musical" },
  { value: "DOCUMENTAIRE", label: "Documentaire" },
  { value: "AUTRE", label: "Autre" },
];

const CONTENT_PLATFORMS = ["YouTube", "Instagram", "TikTok", "Facebook", "TV/Web"];

const AGE_RANGES = [
  { value: "13-17 ans", label: "13-17 ans" },
  { value: "18-25 ans", label: "18-25 ans" },
  { value: "25-35 ans", label: "25-35 ans" },
  { value: "35-50 ans", label: "35-50 ans" },
  { value: "50+ ans", label: "50+ ans" },
  { value: "Tous âges", label: "Tous âges" },
];

const COUNTRIES = [
  { value: "Algérie", label: "Algérie" },
  { value: "Maroc", label: "Maroc" },
  { value: "Tunisie", label: "Tunisie" },
  { value: "Diaspora", label: "Diaspora" },
  { value: "International", label: "International" },
];

const DELIVERABLE_TYPES = [
  { value: "MENTION", label: "Mention" },
  { value: "LOGO_PLACEMENT", label: "Placement logo" },
  { value: "PRODUCT_INTEGRATION", label: "Intégration produit" },
  { value: "EXCLUSIVE_RIGHTS", label: "Droits exclusifs" },
  { value: "CUSTOM", label: "Personnalisé" },
];

const STEPS = [
  { number: 1, label: "Identité" },
  { number: 2, label: "Concept" },
  { number: 3, label: "Production" },
  { number: 4, label: "Budget" },
  { number: 5, label: "Finalisation" },
];

// ─── Client-side completeness (mirrors server logic) ──────────────────────────

function computeClientScore(
  form: FormState,
  deliverableCount: number
): { score: number; missing: string[] } {
  const missing: string[] = [];
  let score = 0;

  if (form.synopsis && form.synopsis.length > 20) score += 10;
  else missing.push("Synopsis (10 pts)");

  if (form.coverImageUrl) score += 5;
  else missing.push("Image de couverture (5 pts)");

  if (form.platforms.length > 0) score += 5;
  else missing.push("Plateformes de diffusion (5 pts)");

  if (form.targetAudience && form.targetAudience.length > 5) score += 5;
  else missing.push("Description de l'audience cible (5 pts)");

  if (
    form.timeline.shootingDate &&
    form.timeline.postProdDate &&
    form.timeline.releaseDate
  )
    score += 10;
  else missing.push("Calendrier complet (tournage + post-prod + publication) (10 pts)");

  if (form.teamDescription && form.teamDescription.length > 10) score += 15;
  else missing.push("Description de l'équipe (15 pts)");

  if (form.storyboardUrls.length > 0) score += 25;
  else missing.push("Storyboard (25 pts)");

  if (form.pitchDocumentUrl) score += 15;
  else missing.push("Dossier PDF de présentation (15 pts)");

  if (deliverableCount >= 1) score += 10;
  else missing.push("Au moins 1 livrable sponsor (10 pts)");

  return { score, missing };
}

// ─── Helper: upload a file ─────────────────────────────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload échoué");
  const data = await res.json();
  return data.url as string;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((step, idx) => {
        const done = step.number < currentStep;
        const active = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-mono flex-shrink-0"
                style={{
                  background: done
                    ? "var(--accent-dim)"
                    : active
                    ? "var(--primary-dim)"
                    : "var(--surface-mid)",
                  border: `1px solid ${
                    done
                      ? "rgba(0,255,136,0.4)"
                      : active
                      ? "var(--border-hover)"
                      : "var(--border)"
                  }`,
                  color: done
                    ? "var(--accent)"
                    : active
                    ? "var(--primary)"
                    : "var(--foreground-muted)",
                }}
              >
                {done ? "✓" : step.number}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: active ? "var(--foreground)" : "var(--foreground-muted)" }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="h-px w-6 flex-shrink-0"
                style={{
                  background: done ? "var(--accent)" : "var(--border)",
                  opacity: done ? 0.5 : 0.3,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
        {label}
        {required && (
          <span style={{ color: "var(--danger)" }} className="ml-0.5">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Summary row (Step 5) ─────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div
      className="flex gap-3"
      style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}
    >
      <span
        className="w-36 flex-shrink-0 text-xs font-semibold uppercase tracking-wider pt-0.5"
        style={{ color: "var(--foreground-muted)" }}
      >
        {label}
      </span>
      <span
        className={cn("text-sm flex-1", multiline ? "whitespace-pre-wrap" : "truncate")}
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PitchForm({ mode, categories, initialPitch }: PitchFormProps) {
  const router = useRouter();

  const tl = (initialPitch?.timeline ?? {}) as Partial<Timeline>;

  const [form, setForm] = useState<FormState>({
    title: initialPitch?.title ?? "",
    type: initialPitch?.type ?? "",
    coverImageUrl: initialPitch?.coverImageUrl ?? "",
    visibility: initialPitch?.visibility ?? "PUBLIC",
    synopsis: initialPitch?.synopsis ?? "",
    platforms: initialPitch?.platforms ?? [],
    ageRange: initialPitch?.ageRange ?? "",
    country: initialPitch?.country ?? "",
    targetAudience: initialPitch?.targetAudience ?? "",
    selectedCategoryIds: initialPitch?.categories.map((c) => c.category.id) ?? [],
    timeline: {
      shootingDate: tl.shootingDate ?? "",
      postProdDate: tl.postProdDate ?? "",
      releaseDate: tl.releaseDate ?? "",
    },
    teamDescription: initialPitch?.teamDescription ?? "",
    references: initialPitch?.references?.length ? initialPitch.references : [""],
    storyboardUrls: initialPitch?.storyboardUrls ?? [],
    pitchDocumentUrl: initialPitch?.pitchDocumentUrl ?? "",
    pitchDocumentName: initialPitch?.pitchDocumentUrl
      ? initialPitch.pitchDocumentUrl.split("/").pop() ?? ""
      : "",
    budgetTarget: initialPitch?.budgetTarget?.toString() ?? "",
    maxSponsors: initialPitch?.maxSponsors ?? 4,
    bonusSponsorSlots: initialPitch?.bonusSponsorSlots ?? 2,
    deliverables:
      initialPitch?.pitchDeliverables.map((d) => ({
        _key: d.id,
        id: d.id,
        type: d.type,
        description: d.description,
        minSponsorshipDZD: d.minSponsorshipDZD?.toString() ?? "",
      })) ?? [],
  });

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [storyboardUploading, setStoryboardUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const storyboardInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function canGoNext(): boolean {
    if (step === 1) {
      return (
        form.title.trim().length > 0 &&
        form.type !== "" &&
        form.budgetTarget !== "" &&
        Number(form.budgetTarget) > 0
      );
    }
    return true;
  }

  // ─── Submit logic ────────────────────────────────────────────────────────────

  async function handleSave(andSubmit: boolean) {
    setError(null);
    setSaving(true);
    try {
      let pitchId = initialPitch?.id ?? null;

      if (mode === "create") {
        const res = await fetch("/api/pitches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            type: form.type,
            budgetTarget: Number(form.budgetTarget),
            visibility: form.visibility,
            synopsis: form.synopsis,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Erreur lors de la création");
        }
        const data = await res.json();
        pitchId = data.pitch.id;
      }

      if (!pitchId) throw new Error("ID du projet manquant");

      const patchBody: Record<string, unknown> = {
        synopsis: form.synopsis,
        platforms: form.platforms,
        ageRange: form.ageRange || null,
        country: form.country || null,
        targetAudience: form.targetAudience || null,
        categoryIds: form.selectedCategoryIds,
        timeline: {
          shootingDate: form.timeline.shootingDate || null,
          postProdDate: form.timeline.postProdDate || null,
          releaseDate: form.timeline.releaseDate || null,
        },
        teamDescription: form.teamDescription || null,
        references: form.references.filter((r) => r.trim() !== ""),
        storyboardUrls: form.storyboardUrls,
        pitchDocumentUrl: form.pitchDocumentUrl || null,
        coverImageUrl: form.coverImageUrl || null,
        visibility: form.visibility,
        maxSponsors: form.maxSponsors,
        bonusSponsorSlots: form.bonusSponsorSlots,
        budgetTarget: Number(form.budgetTarget),
        type: form.type,
        title: form.title,
      };

      const patchRes = await fetch(`/api/pitches/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      });
      if (!patchRes.ok) {
        const d = await patchRes.json();
        throw new Error(d.error ?? "Erreur lors de la mise à jour");
      }

      const deliverablesToCreate =
        mode === "create"
          ? form.deliverables
          : form.deliverables.filter((d) => !d.id);

      for (const d of deliverablesToCreate) {
        if (!d.type || !d.description.trim()) continue;
        await fetch(`/api/pitches/${pitchId}/deliverables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: d.type,
            description: d.description,
            minSponsorshipDZD: d.minSponsorshipDZD ? Number(d.minSponsorshipDZD) : undefined,
          }),
        });
      }

      if (andSubmit) {
        const subRes = await fetch(`/api/pitches/${pitchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit" }),
        });
        if (!subRes.ok) {
          const d = await subRes.json();
          throw new Error(d.error ?? "Erreur lors de la soumission");
        }
      }

      router.push(`/creator/pitches/${pitchId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  // ─── File uploads ─────────────────────────────────────────────────────────────

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadFile(file);
      patch({ coverImageUrl: url });
    } catch {
      setError("Erreur upload image de couverture");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleStoryboardUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setStoryboardUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      patch({ storyboardUrls: [...form.storyboardUrls, ...urls] });
    } catch {
      setError("Erreur upload storyboard");
    } finally {
      setStoryboardUploading(false);
    }
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const url = await uploadFile(file);
      patch({ pitchDocumentUrl: url, pitchDocumentName: file.name });
    } catch {
      setError("Erreur upload document");
    } finally {
      setDocUploading(false);
    }
  }

  // ─── Deliverable helpers ──────────────────────────────────────────────────────

  function addDeliverable() {
    patch({
      deliverables: [
        ...form.deliverables,
        { _key: crypto.randomUUID(), type: "MENTION", description: "", minSponsorshipDZD: "" },
      ],
    });
  }

  function removeDeliverable(key: string) {
    patch({ deliverables: form.deliverables.filter((d) => d._key !== key) });
  }

  function updateDeliverable(key: string, partial: Partial<DeliverableRow>) {
    patch({
      deliverables: form.deliverables.map((d) =>
        d._key === key ? { ...d, ...partial } : d
      ),
    });
  }

  const { score, missing } = computeClientScore(
    form,
    form.deliverables.filter((d) => d.description.trim()).length
  );

  const inputStyle = "input-cyber";
  const textareaStyle = "input-cyber resize-none";
  const selectStyle = "input-cyber";

  function sectionHeader(title: string, subtitle?: string) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-bold font-display gradient-text">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
            {subtitle}
          </p>
        )}
        <div className="section-line mt-3" />
      </div>
    );
  }

  // ─── Step 1 ───────────────────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <div className="space-y-5">
        {sectionHeader("Identité du projet", "Les informations essentielles de votre projet créatif.")}

        <Field label="Titre du projet" required>
          <input
            type="text"
            className={inputStyle}
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Ex: La Casbah Secrète"
            disabled={saving}
          />
        </Field>

        <Field label="Type de contenu" required>
          <select
            className={selectStyle}
            value={form.type}
            onChange={(e) => patch({ type: e.target.value })}
            disabled={saving}
          >
            <option value="">Sélectionner un type…</option>
            {PITCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Budget objectif (DZD)"
          required
          hint="Montant total que vous souhaitez lever auprès des sponsors."
        >
          <input
            type="number"
            className={inputStyle}
            value={form.budgetTarget}
            onChange={(e) => patch({ budgetTarget: e.target.value })}
            placeholder="Ex: 500000"
            min={1}
            disabled={saving}
          />
        </Field>

        <Field label="Image de couverture" hint="Format JPEG, PNG ou WebP. Max 5 Mo.">
          <div className="space-y-2">
            {form.coverImageUrl && (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImageUrl}
                  alt="Couverture"
                  className="rounded-xl object-cover"
                  style={{
                    width: "100%",
                    maxWidth: "320px",
                    height: "180px",
                    border: "1px solid var(--border-hover)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => patch({ coverImageUrl: "" })}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "var(--danger)", color: "white" }}
                >
                  ×
                </button>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading || saving}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                borderColor: "var(--border-hover)",
                color: "var(--primary)",
                background: "var(--primary-dim)",
              }}
            >
              {coverUploading ? (
                <>
                  <SpinnerIcon /> Envoi…
                </>
              ) : (
                <>
                  <UploadIcon />
                  {form.coverImageUrl ? "Changer l'image" : "Téléverser une image"}
                </>
              )}
            </button>
          </div>
        </Field>

        <Field label="Visibilité">
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "PUBLIC", label: "Marketplace marques", icon: "🌐" },
              { value: "PRIVATE", label: "Lien secret uniquement", icon: "🔒" },
            ].map((opt) => {
              const selected = form.visibility === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => patch({ visibility: opt.value })}
                  disabled={saving}
                  className="flex flex-1 min-w-[140px] items-center gap-2.5 rounded-xl p-3 text-sm font-medium transition-all"
                  style={{
                    background: selected ? "var(--primary-dim)" : "var(--surface)",
                    border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                    color: selected ? "var(--primary)" : "var(--foreground-muted)",
                    boxShadow: selected ? "0 0 12px var(--primary-glow)" : undefined,
                  }}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    );
  }

  // ─── Step 2 ───────────────────────────────────────────────────────────────────

  function renderStep2() {
    return (
      <div className="space-y-5">
        {sectionHeader("Concept & Audience", "Décrivez votre concept et votre public cible.")}

        <Field
          label="Synopsis"
          required
          hint="Au moins 20 caractères pour contribuer au score de complétude."
        >
          <textarea
            className={textareaStyle}
            rows={5}
            value={form.synopsis}
            onChange={(e) => patch({ synopsis: e.target.value })}
            placeholder="Décrivez votre projet en quelques lignes…"
            disabled={saving}
          />
        </Field>

        <Field label="Plateformes de diffusion">
          <div className="flex flex-wrap gap-2">
            {CONTENT_PLATFORMS.map((platform) => {
              const selected = form.platforms.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    if (selected) {
                      patch({ platforms: form.platforms.filter((p) => p !== platform) });
                    } else {
                      patch({ platforms: [...form.platforms, platform] });
                    }
                  }}
                  disabled={saving}
                  className="rounded-full px-3 py-1.5 text-sm font-medium transition-all"
                  style={{
                    background: selected ? "var(--primary-dim)" : "var(--surface)",
                    border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                    color: selected ? "var(--primary)" : "var(--foreground-muted)",
                    boxShadow: selected ? "0 0 8px var(--primary-glow)" : undefined,
                  }}
                >
                  {platform}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tranche d'âge cible">
            <select
              className={selectStyle}
              value={form.ageRange}
              onChange={(e) => patch({ ageRange: e.target.value })}
              disabled={saving}
            >
              <option value="">Choisir…</option>
              {AGE_RANGES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Pays/région">
            <select
              className={selectStyle}
              value={form.country}
              onChange={(e) => patch({ country: e.target.value })}
              disabled={saving}
            >
              <option value="">Choisir…</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description de l'audience cible" hint="Soyez précis pour attirer les bons sponsors.">
          <input
            type="text"
            className={inputStyle}
            value={form.targetAudience}
            onChange={(e) => patch({ targetAudience: e.target.value })}
            placeholder="Ex: Jeunes entrepreneurs algériens 18-30 ans"
            disabled={saving}
          />
        </Field>

        {categories.length > 0 && (
          <Field label="Catégories">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = form.selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        patch({
                          selectedCategoryIds: form.selectedCategoryIds.filter(
                            (id) => id !== cat.id
                          ),
                        });
                      } else {
                        patch({
                          selectedCategoryIds: [...form.selectedCategoryIds, cat.id],
                        });
                      }
                    }}
                    disabled={saving}
                    className="rounded-full px-3 py-1.5 text-sm font-medium transition-all"
                    style={{
                      background: selected ? "var(--secondary-dim)" : "var(--surface)",
                      border: `1px solid ${selected ? "var(--secondary)" : "var(--border)"}`,
                      color: selected ? "var(--secondary)" : "var(--foreground-muted)",
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      </div>
    );
  }

  // ─── Step 3 ───────────────────────────────────────────────────────────────────

  function renderStep3() {
    return (
      <div className="space-y-5">
        {sectionHeader("Production", "Calendrier, équipe et documents de production.")}

        <div>
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Calendrier de production
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date de tournage">
              <input
                type="date"
                className={inputStyle}
                value={form.timeline.shootingDate}
                onChange={(e) =>
                  patch({ timeline: { ...form.timeline, shootingDate: e.target.value } })
                }
                disabled={saving}
              />
            </Field>
            <Field label="Post-production">
              <input
                type="date"
                className={inputStyle}
                value={form.timeline.postProdDate}
                onChange={(e) =>
                  patch({ timeline: { ...form.timeline, postProdDate: e.target.value } })
                }
                disabled={saving}
              />
            </Field>
            <Field label="Date de publication">
              <input
                type="date"
                className={inputStyle}
                value={form.timeline.releaseDate}
                onChange={(e) =>
                  patch({ timeline: { ...form.timeline, releaseDate: e.target.value } })
                }
                disabled={saving}
              />
            </Field>
          </div>
        </div>

        <Field
          label="Description de l'équipe"
          hint="Qui est derrière ce projet ? Réalisateur, équipe technique, talents…"
        >
          <textarea
            className={textareaStyle}
            rows={4}
            value={form.teamDescription}
            onChange={(e) => patch({ teamDescription: e.target.value })}
            placeholder="Ex: Équipe de 5 personnes spécialisées en production audiovisuelle…"
            disabled={saving}
          />
        </Field>

        <Field label="Références & inspirations" hint="URLs vers des projets similaires ou inspirations.">
          <div className="space-y-2">
            {form.references.map((ref, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  className={cn(inputStyle, "flex-1")}
                  value={ref}
                  onChange={(e) => {
                    const next = [...form.references];
                    next[idx] = e.target.value;
                    patch({ references: next });
                  }}
                  placeholder="https://…"
                  disabled={saving}
                />
                {form.references.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      patch({ references: form.references.filter((_, i) => i !== idx) });
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                    style={{
                      background: "rgba(255,59,92,0.1)",
                      border: "1px solid rgba(255,59,92,0.3)",
                      color: "var(--danger)",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch({ references: [...form.references, ""] })}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground-muted)",
                background: "var(--surface)",
              }}
            >
              + Ajouter une référence
            </button>
          </div>
        </Field>

        <Field
          label="Storyboard"
          hint="Images ou PDFs. Plusieurs fichiers acceptés. Max 5 Mo par image, 20 Mo par PDF."
        >
          <div className="space-y-3">
            {form.storyboardUrls.length > 0 && (
              <StoryboardViewer urls={form.storyboardUrls} />
            )}
            <div className="flex gap-2 flex-wrap">
              <input
                ref={storyboardInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={handleStoryboardUpload}
              />
              <button
                type="button"
                onClick={() => storyboardInputRef.current?.click()}
                disabled={storyboardUploading || saving}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  borderColor: "var(--border-hover)",
                  color: "var(--primary)",
                  background: "var(--primary-dim)",
                }}
              >
                {storyboardUploading ? (
                  <>
                    <SpinnerIcon /> Envoi…
                  </>
                ) : (
                  <>
                    <UploadIcon /> Ajouter des fichiers
                  </>
                )}
              </button>
              {form.storyboardUrls.length > 0 && (
                <button
                  type="button"
                  onClick={() => patch({ storyboardUrls: [] })}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{
                    borderColor: "rgba(255,59,92,0.3)",
                    color: "var(--danger)",
                    background: "rgba(255,59,92,0.08)",
                  }}
                >
                  Tout supprimer
                </button>
              )}
            </div>
          </div>
        </Field>

        <Field label="Dossier de présentation PDF" hint="Un seul PDF. Max 20 Mo.">
          <div className="space-y-2">
            {form.pitchDocumentUrl && (
              <div
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "var(--danger)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="flex-1 truncate text-sm" style={{ color: "var(--foreground)" }}>
                  {form.pitchDocumentName || form.pitchDocumentUrl.split("/").pop()}
                </span>
                <button
                  type="button"
                  onClick={() => patch({ pitchDocumentUrl: "", pitchDocumentName: "" })}
                  className="text-xs transition-colors"
                  style={{ color: "var(--danger)" }}
                >
                  Supprimer
                </button>
              </div>
            )}
            <input
              ref={docInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleDocUpload}
            />
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              disabled={docUploading || saving}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                borderColor: "var(--border-hover)",
                color: "var(--primary)",
                background: "var(--primary-dim)",
              }}
            >
              {docUploading ? (
                <>
                  <SpinnerIcon /> Envoi…
                </>
              ) : (
                <>
                  <UploadIcon />
                  {form.pitchDocumentUrl ? "Remplacer le PDF" : "Téléverser un PDF"}
                </>
              )}
            </button>
          </div>
        </Field>
      </div>
    );
  }

  // ─── Step 4 ───────────────────────────────────────────────────────────────────

  function renderStep4() {
    return (
      <div className="space-y-5">
        {sectionHeader("Sponsors & Budget", "Définissez votre modèle de sponsoring.")}

        <Field label="Budget objectif (DZD)" required>
          <input
            type="number"
            className={inputStyle}
            value={form.budgetTarget}
            onChange={(e) => patch({ budgetTarget: e.target.value })}
            placeholder="Ex: 500000"
            min={1}
            disabled={saving}
          />
        </Field>

        <Field
          label={`Nombre max. de sponsors : ${form.maxSponsors}`}
          hint="Nombre de slots sponsors principaux."
        >
          <input
            type="range"
            min={1}
            max={6}
            value={form.maxSponsors}
            onChange={(e) => patch({ maxSponsors: Number(e.target.value) })}
            disabled={saving}
            className="w-full accent-[color:var(--primary)]"
          />
          <div
            className="flex justify-between text-[10px]"
            style={{ color: "var(--foreground-muted)" }}
          >
            {[1, 2, 3, 4, 5, 6].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </Field>

        <Field
          label={`Slots bonus : ${form.bonusSponsorSlots}`}
          hint="Slots supplémentaires disponibles après que les slots principaux sont remplis."
        >
          <input
            type="range"
            min={0}
            max={3}
            value={form.bonusSponsorSlots}
            onChange={(e) => patch({ bonusSponsorSlots: Number(e.target.value) })}
            disabled={saving}
            className="w-full accent-[color:var(--secondary)]"
          />
          <div
            className="flex justify-between text-[10px]"
            style={{ color: "var(--foreground-muted)" }}
          >
            {[0, 1, 2, 3].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </Field>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Livrables sponsors
            </p>
            <button
              type="button"
              onClick={addDeliverable}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all"
              style={{
                borderColor: "var(--border-hover)",
                color: "var(--primary)",
                background: "var(--primary-dim)",
              }}
            >
              + Ajouter un livrable
            </button>
          </div>

          {form.deliverables.length === 0 && (
            <div
              className="rounded-xl py-8 text-center text-sm"
              style={{
                background: "var(--surface)",
                border: "1px dashed var(--border-hover)",
                color: "var(--foreground-muted)",
              }}
            >
              Aucun livrable — cliquez sur &quot;+ Ajouter un livrable&quot;
            </div>
          )}

          <div className="space-y-3">
            {form.deliverables.map((d) => (
              <div
                key={d._key}
                className="rounded-xl p-4 space-y-3"
                style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <select
                    className={cn(selectStyle, "flex-1")}
                    value={d.type}
                    onChange={(e) => updateDeliverable(d._key, { type: e.target.value })}
                    disabled={saving}
                  >
                    {DELIVERABLE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDeliverable(d._key)}
                    disabled={saving}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{
                      background: "rgba(255,59,92,0.1)",
                      border: "1px solid rgba(255,59,92,0.3)",
                      color: "var(--danger)",
                    }}
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  className={inputStyle}
                  value={d.description}
                  onChange={(e) => updateDeliverable(d._key, { description: e.target.value })}
                  placeholder="Description du livrable…"
                  disabled={saving}
                />
                <input
                  type="number"
                  className={inputStyle}
                  value={d.minSponsorshipDZD}
                  onChange={(e) =>
                    updateDeliverable(d._key, { minSponsorshipDZD: e.target.value })
                  }
                  placeholder="Sponsoring minimum (DZD) — optionnel"
                  min={0}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 5 ───────────────────────────────────────────────────────────────────

  function renderStep5() {
    const typeLabel = PITCH_TYPES.find((t) => t.value === form.type)?.label ?? form.type;
    const visLabel =
      form.visibility === "PRIVATE" ? "Lien secret uniquement" : "Marketplace marques";

    return (
      <div className="space-y-5">
        {sectionHeader("Finalisation", "Vérifiez votre dossier et soumettez-le.")}

        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
        >
          <h3
            className="mb-4 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Score de complétude
          </h3>
          <CompletenessScore score={score} missing={missing} />
        </div>

        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Récapitulatif
          </h3>
          <SummaryRow label="Titre" value={form.title || "—"} />
          <SummaryRow label="Type" value={typeLabel || "—"} />
          <SummaryRow
            label="Budget objectif"
            value={
              form.budgetTarget
                ? `${Number(form.budgetTarget).toLocaleString("fr-DZ")} DZD`
                : "—"
            }
          />
          <SummaryRow label="Visibilité" value={visLabel} />
          {form.synopsis && <SummaryRow label="Synopsis" value={form.synopsis} multiline />}
          {form.platforms.length > 0 && (
            <SummaryRow label="Plateformes" value={form.platforms.join(", ")} />
          )}
          {form.ageRange && <SummaryRow label="Tranche d'âge" value={form.ageRange} />}
          {form.country && <SummaryRow label="Pays" value={form.country} />}
          {form.targetAudience && (
            <SummaryRow label="Audience cible" value={form.targetAudience} />
          )}
          {(form.timeline.shootingDate ||
            form.timeline.postProdDate ||
            form.timeline.releaseDate) && (
            <SummaryRow
              label="Calendrier"
              value={[
                form.timeline.shootingDate &&
                  `Tournage: ${form.timeline.shootingDate}`,
                form.timeline.postProdDate &&
                  `Post-prod: ${form.timeline.postProdDate}`,
                form.timeline.releaseDate &&
                  `Publication: ${form.timeline.releaseDate}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          )}
          {form.teamDescription && (
            <SummaryRow label="Équipe" value={form.teamDescription} multiline />
          )}
          <SummaryRow
            label="Sponsors max."
            value={`${form.maxSponsors} + ${form.bonusSponsorSlots} bonus`}
          />
          <SummaryRow
            label="Storyboard"
            value={
              form.storyboardUrls.length > 0
                ? `${form.storyboardUrls.length} fichier(s)`
                : "Aucun"
            }
          />
          <SummaryRow
            label="Dossier PDF"
            value={form.pitchDocumentName || (form.pitchDocumentUrl ? "Oui" : "Aucun")}
          />
          <SummaryRow
            label="Livrables"
            value={
              form.deliverables.length > 0
                ? `${form.deliverables.length} livrable(s)`
                : "Aucun"
            }
          />
          {form.selectedCategoryIds.length > 0 && (
            <SummaryRow
              label="Catégories"
              value={form.selectedCategoryIds
                .map((id) => categories.find((c) => c.id === id)?.name ?? id)
                .join(", ")}
            />
          )}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/creator/pitches"
        className="inline-flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: "var(--foreground-muted)" }}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Mes Projets
      </Link>

      <StepIndicator currentStep={step} />

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(255,59,92,0.1)",
            border: "1px solid rgba(255,59,92,0.3)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || saving}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-40"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground-muted)",
            background: "var(--surface)",
          }}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>

        <div className="text-xs font-mono" style={{ color: "var(--foreground-muted)" }}>
          {step} / {STEPS.length}
        </div>

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
            disabled={!canGoNext() || saving}
            className="btn-neon inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
          >
            Suivant
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                borderColor: "var(--border-hover)",
                color: "var(--primary)",
                background: "var(--primary-dim)",
              }}
            >
              {saving ? (
                <>
                  <SpinnerIcon /> Sauvegarde…
                </>
              ) : (
                "Sauvegarder en brouillon"
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="btn-neon inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <SpinnerIcon /> Envoi…
                </>
              ) : (
                "Soumettre pour validation"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
