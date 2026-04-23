# Adwaa — Redesign Complet UI/UX

**Date:** 2026-04-23
**Projet:** Adwaa — Plateforme UGC Algérienne
**Scope:** Refonte complète Dark Mode + Light Mode — toutes les pages, tous les rôles

---

## 1. Contexte & Contraintes

- **58 pages** réparties sur 8 sections (public, auth, influenceur, créateur, entreprise, admin, shared)
- **3 rôles** : Admin, Influenceur/Créateur, Entreprise
- **3 langues** : Français (défaut), Anglais, Arabe (RTL)
- **Textes existants conservés intégralement** — aucune modification de contenu textuel
- **Skill ui-ux-pro-max** obligatoirement invoqué à chaque phase d'implémentation

---

## 2. Palette de Couleurs

### 2.1 Dark Mode (refait avec nouvelle palette)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--background` | `#01010C` | Fond global |
| `--foreground` | `#D8EEFF` | Texte principal |
| `--foreground-muted` | `#3D5A78` | Texte secondaire |
| `--primary` | `#00E5FF` | Cyan — action principale |
| `--primary-dim` | `rgba(0,229,255,0.12)` | Fond surface primaire |
| `--primary-glow` | `rgba(0,229,255,0.35)` | Halo/glow primaire |
| `--secondary` | `#FF2D78` | Rose/Magenta — remplace violet #8B5CF6 |
| `--secondary-dim` | `rgba(255,45,120,0.12)` | Fond surface secondaire |
| `--secondary-glow` | `rgba(255,45,120,0.35)` | Halo/glow secondaire |
| `--accent` | `#00FF88` | Vert — succès / live / actif |
| `--accent-dim` | `rgba(0,255,136,0.12)` | Fond surface accent |
| `--gold` | `#FFB800` | Or — finance / paiement |
| `--gold-dim` | `rgba(255,184,0,0.12)` | Fond surface or |
| `--danger` | `#FF3B5C` | Rouge — erreur / suppression |
| `--surface` | `rgba(0,229,255,0.03)` | Surface carte niveau 1 |
| `--surface-mid` | `rgba(0,229,255,0.06)` | Surface carte niveau 2 |
| `--surface-high` | `rgba(0,229,255,0.10)` | Surface carte niveau 3 |
| `--border` | `rgba(0,229,255,0.08)` | Bordure par défaut |
| `--border-hover` | `rgba(0,229,255,0.30)` | Bordure au survol |

> **Supprimé :** `--secondary: #8B5CF6` (violet) et toutes ses variantes dim/glow.
> Remplacer chaque occurrence de `#8B5CF6`, `rgba(139,92,246,*)` par les équivalents rose.

### 2.2 Light Mode — Glace Électrique (nouveau)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--background` | `linear-gradient(160deg, #EEF9FF 0%, #F0EDFF 100%)` | Fond global dégradé glace |
| `--foreground` | `#0F172A` | Texte principal (ardoise profond) |
| `--foreground-muted` | `#475569` | Texte secondaire |
| `--primary` | `#0090B8` | Cyan foncé lisible sur blanc |
| `--primary-dim` | `rgba(0,144,184,0.08)` | Fond surface primaire |
| `--secondary` | `#D91A5E` | Rose foncé lisible sur blanc |
| `--secondary-dim` | `rgba(217,26,94,0.08)` | Fond surface secondaire |
| `--accent` | `#047857` | Vert foncé — succès light |
| `--gold` | `#B45309` | Or foncé — finance light |
| `--danger` | `#DC2626` | Rouge light |
| `--surface` | `rgba(255,255,255,0.60)` | Cartes glass (backdrop-blur) |
| `--surface-mid` | `rgba(255,255,255,0.75)` | Cartes glass renforcé |
| `--surface-high` | `rgba(255,255,255,0.90)` | Cartes glass fort |
| `--border` | `rgba(0,144,184,0.15)` | Bordure light |
| `--border-hover` | `rgba(0,144,184,0.40)` | Bordure hover light |
| `--shadow` | `0 4px 24px rgba(0,144,184,0.08)` | Ombre douce |

---

## 3. Typographie

| Rôle | Police | Weights |
|------|--------|---------|
| Display (titres, hero) | Syne | 400, 600, 700, 800 |
| Corps (paragraphes, UI) | Geist Sans | 300, 400, 500, 600 |
| Mono (codes, stats) | Space Mono | 400, 700 |

**Règles :**
- Body text : min 16px sur mobile, line-height 1.5–1.75
- Lignes : max 65–75 caractères
- Titres hero : Syne 800 avec `text-wrap: balance`

---

## 4. Navigation

### 4.1 Règles globales
- **Zéro emoji** dans les navs — remplacés par icônes SVG Lucide
- **Messages** : retiré de la sidebar → icône chat (Lucide `MessageSquare`) dans le header à côté de la cloche
- **Notifications** : déjà dans le header via `notification-bell` — retiré de la sidebar
- Labels de section en `text-xs font-bold uppercase tracking-widest text-foreground-muted`

### 4.2 Sidebar Influenceur (9 items)

```
Dashboard
─── MON ESPACE ──────────────
Profil
Catégories
Infos Paiement
─── ACTIVITÉ ────────────────
Mes Campagnes
Mes Projets (Pitchs)
Favoris
─── EXPLORER ────────────────
Parcourir Campagnes
Parcourir Influenceurs
```

### 4.3 Sidebar Entreprise (10 items)

```
Dashboard
─── MON ENTREPRISE ──────────
Profil
─── CAMPAGNES ───────────────
Demander une Campagne
Mes Campagnes
Terminées
─── CRÉATEURS & PROJETS ─────
Projets Créateurs
Mes Sponsorisations
Parcourir Influenceurs
─── FINANCE ─────────────────
Dépenses
```

### 4.4 Sidebar Admin (12 items)

```
Dashboard
─── UTILISATEURS ────────────
Influenceurs
Entreprises
Catégories
─── VALIDATION ──────────────
Demandes Campagnes
Pré-validation
File Pitchs
─── OPÉRATIONS ──────────────
Campagnes
Transactions
Litiges
─── SYSTÈME ─────────────────
Paramètres
```

### 4.5 Header (App Shell)
- Logo + badge rôle
- `MessageSquare` icon → `/messages` (nouveau)
- `Bell` icon → notifications (existant)
- `ThemeToggle`
- `LanguageSwitcher`
- Titre de page courante

---

## 5. Composants

### 5.1 Boutons

| Variant | Dark | Light |
|---------|------|-------|
| Primary | `bg-primary text-background` + glow cyan | `bg-primary text-white` |
| Secondary | `bg-secondary-dim border-secondary text-secondary` | idem light |
| Ghost | `border-border hover:border-border-hover` | idem light |
| Danger | `bg-danger/10 border-danger text-danger` | idem |

- Tous les boutons : `cursor-pointer`, `transition-all duration-200`, `focus-visible:ring-2`
- Taille min touch : 44×44px

### 5.2 Inputs / Formulaires

- `.input-cyber` revisité : fond `var(--surface)`, bordure `var(--border)`, focus `var(--primary)`
- Label au-dessus avec `for` attribute
- Erreurs : `role="alert"` + texte rouge sous le champ
- Light mode : fond `rgba(255,255,255,0.8)` + `backdrop-blur-sm`

### 5.3 Cartes

- Dark : `bg-surface border-border` + `hover:border-border-hover hover:shadow-[0_0_20px_var(--shadow-color-hover)]`
- Light : `bg-surface backdrop-blur-md border-border shadow` + hover shadow renforcé

### 5.4 Badges / Tags

| Type | Couleur |
|------|---------|
| Actif / Live | Accent vert |
| En attente | Or |
| Refusé / Erreur | Danger |
| Nouveau / Action | Rose (secondary) |
| Info | Cyan (primary) |

### 5.5 Cookie Banner

- Position : fixed bottom, pleine largeur
- Dark : `bg-surface-high border-t border-border backdrop-blur`
- Light : `bg-white/90 border-t border-border shadow-lg backdrop-blur`
- Bouton Accept : variant Primary
- Texte i18n `cookies.banner` + `cookies.accept`

### 5.6 Language Switcher

- Dropdown avec les 3 langues (fr 🇫🇷, en 🇬🇧, ar 🇩🇿)
- Drapeau + code langue
- Dark/Light cohérent avec la palette

---

## 6. Effets Visuels

### Dark Mode
- `.bg-grid` : grille de points cyan conservée
- `.bg-mesh` : mesh radial **mis à jour** — remplacer les orbs violet par orbs rose (`rgba(255,45,120,*)`)
- `.orb-purple` → renommé `.orb-pink` avec couleur `#FF2D78`
- Glows, text-shadow : tous les `#8B5CF6` → `#FF2D78`
- Animations conservées (`fade-in-up`, `glow-pulse`, `text-shimmer`, etc.)

### Light Mode
- Fond global : `background: linear-gradient(160deg, #EEF9FF 0%, #F0EDFF 100%)` sur `<html>`
- Cartes : `backdrop-filter: blur(12px)` + fond glass
- Pas de glow/neon — ombres douces `box-shadow` à la place
- `.bg-mesh` light : `radial-gradient` avec `rgba(0,144,184,0.06)` et `rgba(217,26,94,0.04)`

---

## 7. Responsive

| Breakpoint | Cible | Notes |
|------------|-------|-------|
| 375px | Mobile S | Nav hamburger, 1 colonne, touch 44px |
| 768px | Tablette | Sidebar collapsible ou bottom bar |
| 1024px | Laptop | Sidebar 260px fixe |
| 1440px | Desktop | Max-width 1536px centré |

- Sidebar : masquée sur mobile → `MobileNav` drawer
- Header : compact sur mobile, plein sur desktop
- Grilles : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 8. Accessibilité

- Contraste texte : min 4.5:1 (normal), 3:1 (large)
- `prefers-reduced-motion` : désactiver animations CSS
- Focus visible : `focus-visible:ring-2 ring-primary ring-offset-2`
- `cursor-pointer` sur tous les éléments cliquables
- Transitions hover : 150–300ms ease
- `alt=""` sur toutes les images décoratives, alt descriptif sur les images de contenu
- Erreurs formulaires : `role="alert"` ou `aria-live="polite"`
- Skip-to-content link conservé

---

## 9. Pages Concernées

### Pages Publiques
- `/[locale]` — Home (landing)
- `/[locale]/about`, `/contact`, `/faq`, `/privacy`, `/terms`
- `/[locale]/p/[secretToken]` — Pitch public

### Auth
- `/auth/login`, `/auth/register/influencer`, `/auth/register/company`
- `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`

### Browsing Public
- `/public/campaigns`, `/public/campaigns/[id]`
- `/public/influencers`, `/public/influencers/[id]`
- `/public/companies/[id]`

### Dashboard Influenceur (10 pages)
- Dashboard, Profile, Catégories, Campagnes, Campagne detail
- Pitchs (list, new, detail, edit), Favoris, Paiements

### Dashboard Entreprise (10 pages)
- Dashboard, Profile, Demande campagne, Campagnes, Campagne detail
- Applicants, Projets, Projet detail, Sponsorisations, Complétées, Dépenses

### Dashboard Admin (13 pages)
- Dashboard, Influenceurs, Influenceur detail, Entreprises, Entreprise detail
- Catégories, Campagnes, Campagne detail, Requests, Applications, Pitchs, Pitch detail
- Transactions, Litiges, Settings

### Partagées
- `/messages`, `/notifications`

---

## 10. Utilisation du Skill ui-ux-pro-max

À chaque phase d'implémentation, invoquer :

```bash
# Design system global
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<contexte page>" --design-system -p "Adwaa"

# UX spécifique
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain ux

# Stack Next.js
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --stack nextjs
```

---

## 11. Phases d'Implémentation

| Phase | Scope | Priorité |
|-------|-------|----------|
| 1 | Design tokens — `globals.css` complet (dark + light) | Critique |
| 2 | Composants de base — buttons, inputs, cards, badges, skeleton | Critique |
| 3 | Navigation — sidebar groupée, header + icône messages, mobile nav | Critique |
| 4 | Pages publiques — landing, about, FAQ, contact, cookie banner, i18n | Haute |
| 5 | Auth — login, register, forgot/reset, verify | Haute |
| 6 | Dashboard Influenceur — toutes les pages + formulaires | Haute |
| 7 | Dashboard Entreprise — toutes les pages + formulaires | Haute |
| 8 | Dashboard Admin + browse public + pages partagées | Haute |

---

## 12. Pre-Delivery Checklist (ui-ux-pro-max)

- [ ] Zéro emoji utilisé comme icône (SVG Lucide uniquement)
- [ ] `cursor-pointer` sur tous les éléments cliquables
- [ ] Hover states avec transitions smooth (150–300ms)
- [ ] Light mode : contraste texte 4.5:1 minimum
- [ ] Focus states visibles pour navigation clavier
- [ ] `prefers-reduced-motion` respecté
- [ ] Responsive validé : 375px, 768px, 1024px, 1440px
- [ ] Pas de scroll horizontal sur mobile
- [ ] Fond glace light mode visible dans les deux modes
- [ ] Toutes les cartes glass visibles en light mode (opacité suffisante)
- [ ] Violet (#8B5CF6) introuvable dans le code final
- [ ] Textes originaux préservés intégralement
