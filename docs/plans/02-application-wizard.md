# Plan 02 — Ansökningsformulär (Steg 0–9)

Bygg om wizard‑flödet från det gamla 4‑stegs (om/rapportör/användare/avvikelse) till 10‑stegs återansökningsformulär för Ekonomiskt bistånd.

## Beroenden

- Plan 01 färdig (CareManagement‑backend kan ta emot errand + parameters)
- Citizen‑integration (befintlig `citizen.controller.ts` finns kvar, kan utökas)
- JsonSchema‑integration (befintlig `schema.controller.ts` — laddar formulärscheman)

## Wizard‑struktur

Befintlig kod: `frontend/src/components/wizard/wizard-steps.ts` definierar steg‑array. Komplett byte krävs.

### Steg 0 — Ny eller återansökan
- Vägval: två knappar
- "Ja, hämta mina uppgifter" → trigga prefyllning från Citizen + tidigare ärenden
- "Nej, första ansökan" → starta blankt
- **UI**: `<RadioButton.Group>` (samma pattern som `about-errand`)
- **Lagring**: parameter `applicationType=NEW|RETURNING`

### Steg 1 — Identitet och vistelse
Förifyllt från Citizen, sökanden bekräftar.

| Fält | Källa | Editerbart |
|---|---|---|
| Namn | Citizen | Nej |
| Personnummer | Citizen | Nej |
| Folkbokföringsadress | Citizen | Nej |
| Medborgarskap | Citizen | Nej |
| Uppehållstillstånd/uppehållsrätt | Citizen | Nej |
| Stämmer folkbokföring = vistelse? | Sökande | Ja/Nej |
| Vistelseadress (om Nej) | Sökande | Adress‑autocomplete |
| Uppehållstillstånd‑intyg | Sökande | Filuppladdning, villkorsstyrt |

**Implementation**:
- Bygg ny komponent `identity-confirmation.component.tsx`
- Använd existerande `ReadOnlyField`‑pattern (kolla `errand-sections/`)
- Adresssökning behövs ny endpoint i backend (kanske via Citizen API)
- Filuppladdning → CareManagement attachments endpoint (se plan 01 + attachments)

### Steg 2 — Hushållssituation
**Stort scope — ~50h enligt MVP‑arkitekturen**. Backend `citizen.controller.ts` saknar idag relations‑hämtning.

| Fält | Källa | Komment |
|---|---|---|
| Hushållsmedlemmar (kort) | Citizen relations | Förkryssade som default |
| "Stämmer listan?" | Sökande | Bekräftelse |
| Saknade hushållsmedlemmar | Sökande | Ja/Nej + fritext |
| Växelvis boende per barn | Sökande | Villkorsstyrt om barn finns |
| Äktenskapsliknande förh. | Sökande | Ja/Nej |

**Ny backend‑route**: `GET /citizen/household/:personNumber` → returnerar partner + barn + andra folkbokförda. **Läggs som plan‑post under `01-caremanagement-backend` eller egen plan om >½ dag**.

**Avmarkering av folkbokförd partner** → flagga ärendet automatiskt (parameter `householdAnomaly=PARTNER_UNCHECKED`). Handläggaren ser detta i översikten.

**Personnummer för andra än barn/make/maka ska maskeras** i UI.

### Steg 3 — Boende

| Fält | Typ |
|---|---|
| Boendeform | Radio: Hyreslägenhet/Bostadsrätt/Villa/Andrahand/Inneboende/Annat |
| Månadshyra | Number (kr) — realtidsvalidering mot DMN (se plan 03) |
| Antal rum | Dropdown 1‑rok…6‑rok |
| Hyresavi | File upload |
| Garage/p‑plats i hyran | Ja/Nej |
| Hushållsel kr/mån | Number + faktura upload |
| Hemförsäkring kr/mån | Number + faktura upload |

### Steg 4 — Sysselsättning

| Fält | Typ |
|---|---|
| Sysselsättning | Radio: Arbetssökande/Anställd/Sjukskriven/Föräldraledig/Studerar/Annat |
| Registrerad hos AF | Ja/Nej (obligatoriskt vid arbetssökande) |
| AF‑intyg | File upload (villkorsstyrt) |
| Studerar | Ja/Nej |
| Lärosäte/skolform | Text (villkorsstyrt) |
| Sjukskriven | Ja/Nej |
| Läkarintyg | File upload (villkorsstyrt) |

### Steg 5 — Inkomster
SSBTEK‑hämtning sker server‑side vid inskick. UI visar infotext + fält för **kompletteringar** som inte finns i myndighetsdatan.

| Fält | Typ |
|---|---|
| Lön | Number + lönespec upload |
| Swish/kontant | Number + infotext om deklarationsplikt |
| Underhållsbidrag mottaget | Number per barn |
| Övriga inkomster | Number + fritext |
| Banktillgångar | Number + kontoutdrag (3 mån) upload |
| Äger fordon | Ja/Nej |
| Äger fastighet | Ja/Nej |
| Övriga tillgångar | Fritext |

### Steg 6 — Övriga utgifter
Multi‑select checkboxes, varje val öppnar relevanta fält:

- Fackföreningsavgift, A‑kassa, Arbetsresor, Läkarvård/medicin, Tandvård, Barnomsorg, Umgängesresor, Skulder, Glasögon, Hemutrustning, Internet (max 250 kr/mån), Övrigt

### Steg 7 — Situation och bakgrund

| Fält | Typ |
|---|---|
| Varför söker du nu? | Textarea max 500 tecken |
| Förändrats sedan senast? | Ja/Nej + fritext (visas vid återansökan) |
| Våld/hot i hemmet | Ja/Nej, diskret formulering |
| Kontakt innan beslut | Ja/Nej |

### Steg 8 — Bankkonto

| Fält | Typ |
|---|---|
| Clearingnummer | 4 siffror, validera |
| Kontonummer | Validera mot Bankgirot |
| Kontoinnehavare = sökande | Ja/Nej |

### Steg 9 — GDPR + signering

- Samtycke SSBTEK (kryssruta + länk till fulltext)
- Samtycke registrering (kryssruta)
- Sanningsförsäkran (kryssruta)
- BankID‑signatur (extern integration)

## Generella principer

- **Villkorsstyrt** — fält visas bara när relevanta. Återanvänd `useFormValidation`‑pattern.
- **Filuppladdning** alltid **frivillig** vid inskick. Handläggare kan begära komplettering.
- **Inga obligatoriska fält** för det SSBTEK kan hämta automatiskt.
- **Förhandsbedömning** visas innan inskick (DMN‑rekommendation, se plan 03).

## Filer som behöver ändras/skapas

| Fil | Åtgärd |
|---|---|
| `frontend/src/components/wizard/wizard-steps.ts` | Nya steg‑array |
| `frontend/src/components/wizard/wizard-step-content.component.tsx` | Switch på nya step‑id:n |
| `frontend/src/components/wizard/wizard-step-validator.ts` | Validering per steg |
| `frontend/src/components/errand-sections/` | Ta bort gamla `about-errand`, `reporter`, `user`, `economic-aid-information` — ersätt med 10 nya komponenter |
| `frontend/locales/sv/errand-information.json` | Komplett omskrivning |
| `frontend/src/interfaces/errand-form.ts` | Nytt FormDTO med alla nya fält |
| `frontend/src/hooks/use-prepare-errand.ts` | Ny mappning till CM `Errand` (parameters‑grupperat per steg) |

## Beslut att ta

- [ ] Ska varje steg lagras som **separat** parameter‑grupp (`parameterGroup="step3-housing"` osv.) eller som ett enda JSON‑blob? Rekommendation: separat — bättre för rapportering och regelutvärdering.
- [ ] Hur hanteras delvis ifyllda **utkast**? CareManagement har `status` på errand. Använda `DRAFT` status?
- [ ] BankID‑integration — finns redan i `web-app-katla-sm` eller ska vi använda extern tjänst (t.ex. samma som SAML)?
