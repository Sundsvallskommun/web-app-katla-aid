# Local schemas

Lokala JSON Schema + UI Schema‑filer som backendens `SchemaController` läser från disk när env‑flaggan `USE_LOCAL_SCHEMAS=true`. Tänkt som en labb‑zon där man kan iterera på ett formulär utan att behöva publicera mot JsonSchema‑APIet i molnet.

## Struktur

```
local-schemas/
└── <schemaName>/
    ├── schema.json     # JSON Schema (RJSF, draft-07)
    └── uiSchema.json   # UI Schema (RJSF widgets/order/options) — valfri
```

`schemaName` är det som frontend efterfrågar via `loadFormSchema('<schemaName>')`. Använd kebab‑case (t.ex. `boende`, `hushall`, `inkomster`).

## Hur det fungerar

När `USE_LOCAL_SCHEMAS=true` (default i `.env.development.local`):

1. Frontend anropar `GET /api/schemas/latest/boende`
2. Backend kollar först `local-schemas/boende/schema.json` + `uiSchema.json`
3. Hittar den filen → returnerar lokalt med `schemaId="local:boende"`
4. Hittar inte → faller tillbaka till JsonSchema‑APIet som vanligt

När `USE_LOCAL_SCHEMAS=false` (produktion): inga disk‑uppslag, allt går mot APIet.

## Lägg till ett nytt schema

```bash
mkdir backend/local-schemas/mitt-nya-schema
cat > backend/local-schemas/mitt-nya-schema/schema.json
cat > backend/local-schemas/mitt-nya-schema/uiSchema.json   # valfri
```

Starta om backend (`yarn dev` plockar inte upp nya filer i runtime — controller‑instansen lever per request, men dotenv läses bara vid start). Anropa via `loadFormSchema('mitt-nya-schema')` i frontend.

## Publicera till APIet

När schemat är klart:

1. Använd JsonSchema‑APIets admin‑UI (eller curl/Postman) för att skapa schemat med samma `name` som mappen lokalt.
2. Skicka upp `schema.json` som schema body, och `uiSchema.json` som ui‑schema body.
3. När det är publicerat, sätt `USE_LOCAL_SCHEMAS=false` i din env och verifiera att samma `loadFormSchema('<name>')`‑anrop fortfarande funkar — backend faller tillbaka till APIet.
4. Du kan ta bort den lokala mappen, eller låta den ligga kvar som referens.

## Vad som funkar / inte funkar i local mode

✅ `GET /schemas/latest/<name>` — slår direkt mot disk
✅ `GET /schemas/<id>` — om `<id>` är `local:<name>` eller bara `<name>` slås mot disk
✅ Cache‑logiken i frontend — schemaId blir `local:<name>` så cache fungerar
❌ Versionshantering — inga versioner finns lokalt, du har bara "senaste"
❌ Multi‑user editering — det är en disk‑fil, ingen samtidighetshantering

## Befintliga schemas

| Namn | Beskrivning | Wizard‑steg (plan 02) |
|---|---|---|
| `uppgifter-sokande` | Namn, personnummer, adress, kontaktuppgifter, SMS‑samtycke, tolk | Steg 1 |
| `boende` | Boendeform, hyra, antal rum, hushållsel, hemförsäkring | Steg 3 |
| `sysselsattning` | Sysselsättning, AF‑registrering, studier, sjukskrivning | Steg 4 |
| `inkomster` | Lön, swish, underhållsbidrag, banktillgångar, fordon, fastighet | Steg 5 |
| `ovriga-utgifter` | Fackavgift, A‑kassa, arbetsresor, läkarvård, tandvård, glasögon m.m. | Steg 6 |
| `situation-bakgrund` | Beskrivning, förändringar, våld i hemmet, kontaktönskan | Steg 7 |
| `bankkonto` | Clearing/kontonummer, kontoinnehavare | Steg 8 |
