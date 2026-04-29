# Plan 04 — Rebrand finishing

Kvarvarande Katla→Ekonomiskt bistånd‑ändringar i UI och env. Mest text/branding och env‑städ — inga arkitekturella beslut.

## Sidomenyn (övre vänstra hörnet)

`frontend/src/components/sidebars/overview-sidebar.component.tsx:30` har `title={'Katla'}` på `<Logo>`‑komponenten.

| Fil | Rad | Nu | Förslag |
|---|---|---|---|
| `components/sidebars/overview-sidebar.component.tsx` | 25 | `aria-label={\`Katla - ${process.env.NEXT_PUBLIC_APP_NAME}. Gå till startsidan.\`}` | byt `Katla` → `Ekonomiskt bistånd` |
| `components/sidebars/overview-sidebar.component.tsx` | 30 | `title={'Katla'}` | `title={'Ekonomiskt bistånd'}` |
| `components/mobile/main-page-mobile-header.component.tsx` | 20 | samma `Katla` i title | byt |
| `layouts/base-errand-layout/base-errand-layout.component.tsx` | 31 | samma | byt |

`subtitle={process.env.NEXT_PUBLIC_APP_NAME}` kan stå kvar — `NEXT_PUBLIC_APP_NAME` är där för att skilja på dev/test/prod om det behövs, men just nu är värdet konstigt (se nedan).

## Env‑variabler

`frontend/.env`:

```env
NEXT_PUBLIC_APP_NAME=Katla-sm     ← fel värde, kvar från scaffold
NEXT_PUBLIC_BASE_PATH='/iaf'      ← IAF är paraply, men Ek‑bistånd vill ha eget
```

**Föreslagna nya värden**:

```env
NEXT_PUBLIC_APP_NAME=Katla-aid                # eller "Ekonomiskt bistånd" om det är meningen att vara visningsnamn
NEXT_PUBLIC_BASE_PATH='/ekonomiskt-bistand'   # alt. '/eb' eller '/aid'
```

Beslut behövs (öppen fråga från tidigare diskussion). Sister‑appen `web-app-katla-sm` använder troligen `/iaf` redan — krock om båda servas på samma domän.

## Övriga "Katla"‑referenser

Sökt — bara aria‑labels och title‑text. Inga kod‑identifierare med `Katla`.

## Kvarvarande healthcare‑specifika koncept

Ej "deviation"/"avvikelse" språk, men strukturellt healthcare:

### `MISSFORHALLANDE`‑flödet (Lex Sarah‑aktigt)

`frontend/src/components/errand-sections/about-errand.component.tsx:49-56`:
```tsx
<RadioButton data-cy="event-type-misconduct"
  checked={eventType === 'MISSFORHALLANDE'}
  ...>
  {t('errand-information:about.event_type_misconduct')}
</RadioButton>
```

Det här är ett **healthcare‑deviation‑specifikt val** som inte hör hemma i ett ekonomiskt bistånd‑formulär. Hela `about-errand`‑komponenten kommer ändå rivas i plan 02 (ny wizard‑struktur), så det löser sig naturligt där. Men om plan 02 dröjer är det rimligt att korta ner till bara `event_type_economic_aid` redan nu.

Tillhörande översättningsnycklar att rensa när det görs:
- `errand-information:about.event_type_misconduct`
- `errand-information:about.misconduct_alert_title`
- `errand-information:about.misconduct_alert_description`

### `getTypeDisplayName`

`frontend/src/utils/errand-helpers.ts`:
```ts
return hasAdverseIncident ? 'Missförhållande' : 'Ekonomiskt bistånd';
```

Letar efter label `ADVERSE_INCIDENT` (Lex Sarah). Ingen sådan label kommer finnas i ECONOMICAID‑namespace. Funktionen kan förenklas till bara `'Ekonomiskt bistånd'` direkt — eller bytas ut helt mot `errand.category`/`errand.type` från CM‑modellen (se plan 01).

### `eventConcerns`‑radioknappar

`event_concerns_individual / group / other` — också healthcare‑deviation‑logik (vem berör avvikelsen?). Försvinner i plan 02.

## CLAUDE.md uppdateringar

`CLAUDE.md` rad 7: `sister-app to web-app-katla-sm (scaffolded from the same codebase)` — fakta‑korrekt, behåll.

Rad 56: `**Cypress selectors**: use data-cy attributes` — borttagen. Cypress är ersatt av Playwright (se git log). Uppdatera till Playwright.

```bash
yarn cypress           # ← finns inte längre
yarn cypress:headless  # ← finns inte längre
yarn test:coverage     # ← funkar fortfarande?
```

Verifiera mot `frontend/package.json`.

## Verifiering

- Manuellt: starta `yarn dev` i frontend, kontrollera att övre vänstra rutan säger "Ekonomiskt bistånd"
- `grep -r "Katla" frontend/src` ska ge tomt (förutom event. domain‑neutralt om något)
- `grep -r "katla-sm" frontend backend` — bara CLAUDE.md ska ha ref kvar (sister‑app)
