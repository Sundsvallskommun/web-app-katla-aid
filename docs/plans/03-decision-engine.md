# Plan 03 — Decision engine (DMN/BPMN + Decisions audit trail)

CareManagement kopplar varje errand till en BPMN‑process (Operaton). Processen kan utvärdera DMN‑beslut och spara dem i `errand.decisions[]`. Denna plan beskriver första MVP‑användningen: **hyreskostnadsbedömning vid återansökan**.

## Konceptöversikt

```
Sökande skickar in   ──►  Backend POST /errands  ──►  CM startar BPMN‑process
                                                           │
                                                           ▼
                                              DMN‑tabell utvärderar hyra
                                                           │
                                                           ▼
                                       Decision lagras med decisionType=RECOMMENDATION
                                                           │
Handläggare öppnar ärende ──►  Ser rekommendation + varningar  ──►  APPROVE/REJECT
                                                           │
                                                           ▼
                                       Decision lagras med decisionType=PAYMENT
                                                           │
                                       (BPMN process‑message återupptar processen)
```

## Datamodell — `Decision`

```ts
interface Decision {
  id?: string;
  decisionType?: string;  // 'RECOMMENDATION' (DMN) eller 'PAYMENT' (handläggare)
  value?: string;         // 'APPROVED'/'REJECTED' eller belopp som sträng
  description?: string;   // motivering / varningstext
  createdBy?: string;     // userId eller systemId (t.ex. 'operaton')
  created?: string;       // server‑timestamp
}
```

Decisions ackumuleras — hela listan är audit trail.

## Hyresregelverket (för DMN‑tabellen)

### Maxbelopp per hushåll (DMN decision table)

| Sökandes ålder ≥ | Sökandes ålder ≤ | Antal barn ≥ | Antal barn ≤ | Maxbelopp | Diff mot föregående |
|---|---|---|---|---|---|
| 0 | 28 | 0 | 0 | 5800 | 500 |
| 29 | 999 | 0 | 0 | 6800 | 500 |
| 0 | 999 | 1 | 2 | 7900 | 500 |
| 0 | 999 | 3 | 4 | 9900 | 500 |
| 0 | 999 | 5 | 6 | 11000 | 500 |
| 0 | 999 | 7 | 999 | 14200 | 500 |

### Beslutslogik (6‑rad output‑matris)

| # | Ansökt ≤ gränsvärde | Förra månadens godkända | Ansökt ≤ förra + 500 | Godkänt belopp | Varning |
|---|---|---|---|---|---|
| 1 | Ja | – | – | (noll/null) | VARNING: Ingen historik |
| 2 | Ja | Finns | Ja | Ansökt hyra | – |
| 3 | Ja | Finns | Nej | Förra månadens belopp | VARNING: Stor ökning (>500 kr) |
| 4 | Nej | – | – | (noll/null) | VARNING: Ingen historik + över gräns |
| 5 | Nej | Finns | Ja | Förra månadens belopp | VARNING: Ansökt hyra över gräns |
| 6 | Nej | Finns | Nej | Förra månadens belopp | VARNING: Stor ökning + över gräns |

## Implementation

### 1. DMN‑tabellen — var?

DMN ska ligga i **Operaton** (BPMN/DMN‑motor), **inte** i backend‑koden. Backend skickar bara variabler in i processen. Operaton kör DMN, skriver `Decision` till CM via dess API.

**Beslut**: Vem ansvarar för att deploya DMN‑filen mot Operaton i ECONOMICAID‑namespace? Inte denna repo — koordinera med plattformsteamet.

### 2. Backend — endpoints att exponera

| Frontend behov | Ny route | CM endpoint |
|---|---|---|
| Lista decisions för ett ärende | `GET /caremanagement/errand/:id/decisions` | `GET /{m}/{ns}/errands/{errandId}/decisions` |
| Skapa human decision (handläggare APPROVE/REJECT) | `POST /caremanagement/errand/:id/decisions` | `POST /{m}/{ns}/errands/{errandId}/decisions` |
| Trigga BPMN message (t.ex. "godkänd, fortsätt") | `POST /caremanagement/errand/:id/process-messages` | `POST /{m}/{ns}/errands/{errandId}/process-messages` |

### 3. Frontend — visa rekommendation

I ärendevyn (`frontend/src/components/errand-pages/created-errand.component.tsx`):
- Lista alla decisions kronologiskt
- Filtrera senaste `decisionType=RECOMMENDATION` → visa som "Förslag från system" med varningstext från `description`
- Filtrera senaste `decisionType=PAYMENT` → visa som "Beslut" med belopp + handläggare
- Knappar för handläggare: APPROVE / REJECT → POST ny decision + skicka BPMN‑message

### 4. Errand‑parametrar som DMN behöver

DMN‑tabellen läser från process‑variabler. Backend måste sätta dessa när errand skapas (eller via parameters):

```
applicantAge: int             ← från personnummer i Steg 1
householdChildren: int        ← från Steg 2 (filtrera på relation=child)
rentalCost: int (öre el. kr)  ← från Steg 3
previousApprovedRent: int     ← lookup på senaste APPROVED PAYMENT‑decision från sökandens förra ärende
```

Sista raden — `previousApprovedRent` — kräver att backend söker på `GET /errands?stakeholderExternalId=...&status=COMPLETED` och plockar ut värdet. Behöver utredas.

## Filer att skapa/ändra

| Fil | Åtgärd |
|---|---|
| `backend/src/controllers/caremanagement.controller.ts` | Lägg till decisions + process‑messages routes (efter att grundroutes är klara, plan 01) |
| `backend/src/responses/caremanagement.response.ts` | `DecisionDTO`, `ProcessMessageRequestDTO` |
| `frontend/src/components/decisions/decision-trail.component.tsx` | Ny — visar audit trail |
| `frontend/src/components/decisions/decision-action-bar.component.tsx` | Ny — APPROVE/REJECT knappar för handläggare |
| `frontend/src/services/errand-service/errand-service.ts` | `getDecisions`, `createDecision`, `sendProcessMessage` |

## Öppna frågor

- [ ] Är DMN‑filen specificerad och deployad mot ECONOMICAID‑namespace i Operaton, eller är det vårt arbete?
- [ ] Hur slår vi upp **previousApprovedRent**? Krävs en `findLatestErrand`‑mekanism — finns det `stakeholderExternalId`‑filter på CM `GET /errands`?
- [ ] Skickar handläggarens APPROVE direkt en BPMN‑message med `messageName="payment-approved"` eller bara en Decision och processen pollar?
- [ ] Vilka **decisionTypes** ska vi standardisera på? Förslag: `RECOMMENDATION`, `PAYMENT`, `WARNING` (kan ligga som separat, inte bara i description).
