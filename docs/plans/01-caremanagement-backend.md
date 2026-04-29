# Plan 01 — CareManagement backend

Bygg `CareManagementController` som proxy mot WSO2‑exposed CareManagement API och ersätt det forna SupportManagement‑lagret.

## Förutsättningar

- ✅ Swagger laddad: `backend/src/data-contracts/caremanagement/swagger.json`
- ✅ Genererade typer: `backend/src/data-contracts/caremanagement/data-contracts.ts` (Errand, Stakeholder, Decision, Lookup, Attachment, ProcessMessageRequest, m.fl.)
- ✅ `caremanagement` v1.0 i `api-config.ts`
- ✅ `NAMESPACE=ECONOMICAID` i env

## Skillnader från SupportManagement att hantera

| SM | CareManagement | Konsekvens |
|---|---|---|
| `errandNumber` (sträng som visas i URL) | endast `id` (uuid) | Frontend's URL `/arende/[errandNumber]` behöver byta till `/arende/[id]` eller backend måste göra en lookup |
| `Priority` enum | `priority?: string` (Lookup‑driven) | Hämta från `/metadata?kind=PRIORITY`‑aktig lookup |
| `labels[]` (klassificeringsträd) | `category` + `type` (strängar, Lookup) | Mappa om — samma sak men flatare |
| `jsonParameters[]` (egna formulärsvar) | finns INTE i CM | **Stort beslut**: lagra som `parameters[]` med `parameterGroup="jsonForm"` ELLER som `attachments` (json‑fil) |
| `parameters[]` (key/values) | `parameters[]` med `id` + `parameterGroup` | Mappar nästan 1‑1 men `id` är server‑assigned, frontend skickar inte in det |
| `PageErrand` (Spring page) | `FindErrandsResponse` med `_meta` | Pagineringskontrakt mot frontend måste också uppdateras |
| Stakeholder `parameters: Parameter[]` | Stakeholder `parameters: StakeholderParameter[]` (separat typ) | Mest typskillnad |
| Inga decisions | `decisions[]` på errand | Nytt audit‑trail‑koncept (se plan 03) |
| Inga process‑id | `processDefinitionName`, `processInstanceId` | BPMN‑integration (se plan 03) |

## Endpoints att exponera mot frontend (matchar nuvarande callers)

Frontend har idag dessa anrop i `services/errand-service/errand-service.ts`:

| Frontend‑anrop | Ny backend‑route | Anropar CM |
|---|---|---|
| `GET supportmanagement/errand/${errandNumber}` | `GET /caremanagement/errand/:id` | `GET /{m}/{ns}/errands/{errandId}` |
| `GET supportmanagement/metadata` | `GET /caremanagement/metadata` | `GET /{m}/{ns}/metadata` |
| `POST supportmanagement/errand/create` | `POST /caremanagement/errand` | `POST /{m}/{ns}/errands` |
| `PATCH supportmanagement/errand/${id}` | `PATCH /caremanagement/errand/:id` | `PATCH /{m}/{ns}/errands/{errandId}` |
| `PATCH supportmanagement/errand/save` | (ta bort — ersätt med `PATCH /errand/:id`) | — |
| `GET supportmanagement/notifications` | (utgår — CM har inget notifications‑koncept) | — |
| (ny) | `GET /caremanagement/errand` (sökning) | `GET /{m}/{ns}/errands` |
| (ny) | `POST /caremanagement/errand/:id/decisions` | (se plan 03) |
| (ny) | `POST /caremanagement/errand/:id/attachments` | (multipart upload) |

## Konkreta steg

### Backend

1. **Skapa `controllers/caremanagement.controller.ts`** — ett endpoint i taget, börja med GET errand by id.
2. **Skapa `responses/caremanagement.response.ts`** — class‑validator DTOs som speglar CM‑modellen men trimmar fält som vi inte exponerar mot frontend. Exportera:
   - `ErrandDTO` (motsvarar `Errand`, men med rensning)
   - `StakeholderDTO` (✅ finns redan i `responses/stakeholder.response.ts` — kan utökas eller behållas separat)
   - `DecisionDTO`
   - `ParameterDTO`, `ExternalTagDTO`
   - `LookupDTO`, `MetadataResponseDTO`
   - `FindErrandsResponseDTO`
   - `AttachmentDTO`
3. **Bygg om mappers** — `mapErrandToErrandDTO` / `mapErrandDTOToErrand`. Den gamla `stakeholder-mapping.ts` är borttagen — bygg ny `utils/caremanagement-mapping.ts` om logik behövs.
4. **Registrera i `server.ts`** — lägg till `CareManagementController` i App‑arrayen.
5. **Bestäm hur jsonParameters lagras** — välj en av:
   - **A)** Som `parameters[]` med `parameterGroup="jsonForm"`, `key=schemaName`, `values=[stringifiedJson]`
   - **B)** Som attachment med `mimeType=application/json`, `fileName="${schemaName}.json"`
   - Rekommendation: **A** för MVP. Mindre overhead, lättare att läsa/skriva, ingen separat upload‑round‑trip.

### Frontend

6. **Regenerera `frontend/src/data-contracts/backend/data-contracts.ts`** efter att backend exponerar OpenAPI för de nya routes.
7. **Uppdatera `services/errand-service/errand-service.ts`**:
   - Byt `supportmanagement/...` → `caremanagement/...`
   - Ändra `errandNumber` → `id` om vi går den vägen
   - Ta bort `getNotifications` om CM saknar konceptet
8. **Hantera saknade fält i UI** — leta efter `errand.errandNumber`, `errand.labels`, `errand.priority` (enum) och anpassa.
9. **Routing** — `frontend/src/app/[locale]/arende/[errandNumber]/...` — byt till `[errandId]`.

## Beslut att ta innan implementation

- [ ] **JSON‑form lagring**: parameters vs attachment? (Rekommendation: parameters)
- [ ] **errandNumber vs id i URL**: använda raw uuid eller introducera ett display‑number? (Rekommendation: id för MVP)
- [ ] **Notifications**: ska vi ha det? CM har inget — använda separat tjänst eller ta bort UI‑komponenterna `NotificationsBell`/`NotificationsWrapper`?
- [ ] **Pagination‑kontrakt mot frontend**: speglar vi CM:s `_meta` eller behåller vi det gamla `PageErrand`‑formatet och adapterar i backend?

## Verifiering

- `cd backend && yarn type-check` ska vara grön
- `cd backend && yarn dev` ska starta utan fel
- Manuell smoke‑test mot `GET /api/caremanagement/errand/:id` med Swagger UI eller curl
- Frontend kompilerar utan att klaga på saknade `data-contracts/backend/...`‑typer
