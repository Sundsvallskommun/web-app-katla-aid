# Katla‑aid — Roadmap

Översikt av arbetet för att bygga MVP för **Ekonomiskt bistånd** ovanpå CareManagement‑API:et. Appen är scaffoldad från `web-app-katla-sm` (HealthcareDeviation) och håller på att rebrandas.

## Mål för MVP

Möjliggöra att en sökande kan **återansöka om ekonomiskt bistånd** digitalt, med:
- Förifyllda uppgifter från Citizen (identitet, hushåll, vistelseadress)
- Förifyllda inkomster från SSBTEK (FK, SKV, CSN, PM, AF) vid inskick
- Bostadskostnadsbedömning (DMN‑regelverk) som producerar rekommendation
- Handläggarens APPROVE/REJECT som mänskligt beslut, lagras i samma `decisions`‑lista
- BankID‑signatur, GDPR‑samtycken

## Arkitektur

```
Frontend (Next.js)  ──►  Backend (Express)  ──►  CareManagement API (WSO2)
                                              │
                                              ├──►  Citizen API (folkbokföring, hushåll)
                                              ├──►  Employee API (interna testanvändare)
                                              ├──►  Company API (organisationsträd)
                                              └──►  JsonSchema API (formulärscheman)
                                                       │
                                                       ▼
                                              Operaton (BPMN/DMN motor)
```

Frontend har **inga direktkontrakt** mot CareManagement — allt går genom backend som gör auth + DTO‑mappning.

## Sekvensering — föreslagen ordning

1. **[01 — CareManagement backend](./01-caremanagement-backend.md)** — bygg ny `CareManagementController`, ersätt SupportManagement‑anropen i frontend's `errand-service.ts`. Blockerare för allt annat.
2. **[04 — Rebrand finishing](./04-rebrand-finishing.md)** — kvarvarande Katla→Ek‑bistånd i UI, `BASE_PATH`, `APP_NAME`, sidomenyns logo. Kan göras parallellt med 01.
3. **[02 — Application wizard](./02-application-wizard.md)** — Steg 0–9 ansökningsformuläret, ersätter nuvarande wizard.
4. **[03 — Decision engine](./03-decision-engine.md)** — DMN‑integration, hyresregelverk, decisions‑audit‑trail.
5. *(efter MVP)* — Citizen hushållsintegration djup (~50h), uppehållstillstånd‑intygsupload, attachments‑flöde.

## Vad som redan är gjort

- ✅ `NAMESPACE=ECONOMICAID` i backend `.env.development.local`/`.env.production.local`
- ✅ `caremanagement` v1.0 finns i `api-config.ts`, swagger.json laddad, `data-contracts/caremanagement/data-contracts.ts` genererad
- ✅ SupportManagement‑controller, ‑responses och ‑data-contracts borttaget från backend
- ✅ `StakeholderDTO` flyttad till `responses/stakeholder.response.ts` (frikopplad)
- ✅ `addHyphenToPersonNumber` flyttad till `utils/person-number.ts`
- ✅ Frontend wizard‑steg `deviation` → `economic-aid`, komponent `DeviationInformation` → `EconomicAidInformation`
- ✅ Svenska översättningar uppdaterade (Avvikelse → Ekonomiskt bistånd, etc.)

## Vad som är trasigt just nu (medvetet)

- ❌ Frontend `errand-service.ts` anropar `/api/supportmanagement/*` — backend svarar inte längre. Behöver bytas mot CareManagement‑endpoints (se plan 01).
- ❌ Genererade typer i `frontend/src/data-contracts/backend/data-contracts.ts` refererar SM‑modeller. Behöver regenereras efter att backendens CareManagement‑controller är klar.

## Nyckelfiler

| Område | Plats |
|---|---|
| CareManagement‑typer | `backend/src/data-contracts/caremanagement/` |
| Swagger | `backend/src/data-contracts/caremanagement/swagger.json` |
| API‑config | `backend/src/config/api-config.ts` |
| Backend‑routing | `backend/src/server.ts` |
| Frontend errand‑service | `frontend/src/services/errand-service/errand-service.ts` |
| Frontend backend‑typer | `frontend/src/data-contracts/backend/data-contracts.ts` (genererad) |
| Wizard‑steg | `frontend/src/components/wizard/wizard-steps.ts` |

## Öppna frågor

- Vilken **base path** ska frontend ha? (`/iaf` är kvar — sannolikt behöver ändras till t.ex. `/ekonomiskt-bistand`, se plan 04)
- Ska `MISSFORHALLANDE`‑flödet (Lex Sarah‑aktigt) tas bort helt? Det är healthcare‑specifikt och hänger kvar från scaffolden. (Se plan 04.)
- DMN‑motorn (`operaton`) — finns process‑definitionen redan deployad mot ECONOMICAID‑namespace? (Se plan 03.)
- SSBTEK‑integration — sker den i CareManagement‑backend (server‑side) eller i en separat tjänst som frontend pollar?
