import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { JsonSchema, UiSchema } from '@/data-contracts/jsonschema/data-contracts';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { apiURL } from '@/utils/util';
import { Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Controller, Get, Param, Req, Res, UseBefore } from 'routing-controllers';

const LOCAL_SCHEMAS_DIR = path.resolve(__dirname, '..', '..', 'local-schemas');
const useLocalSchemas = () => process.env.USE_LOCAL_SCHEMAS === 'true';

interface SchemaPayload {
  schema: Record<string, unknown>;
  uiSchema: Record<string, unknown>;
  schemaId: string;
}

async function readLocalSchema(schemaName: string): Promise<SchemaPayload | null> {
  const dir = path.join(LOCAL_SCHEMAS_DIR, schemaName);
  try {
    const schemaRaw = await fs.readFile(path.join(dir, 'schema.json'), 'utf-8');
    const schema = JSON.parse(schemaRaw);

    let uiSchema: Record<string, unknown> = {};
    try {
      const uiRaw = await fs.readFile(path.join(dir, 'uiSchema.json'), 'utf-8');
      uiSchema = JSON.parse(uiRaw);
    } catch {
      // uiSchema is optional
    }

    return { schema, uiSchema, schemaId: `local:${schemaName}` };
  } catch {
    return null;
  }
}

@Controller()
export class SchemaController {
  private apiService = new ApiService();
  private apiBase = getApiBase('jsonschema');

  private async fetchUiSchema(schemaId: string, req: RequestWithUser): Promise<Record<string, unknown>> {
    try {
      const uiRes = await this.apiService.get<UiSchema>(
        {
          baseURL: apiURL(this.apiBase),
          url: `${MUNICIPALITY_ID}/schemas/${schemaId}/ui-schema`,
        },
        req,
      );
      return (uiRes.data.value as Record<string, unknown>) ?? {};
    } catch {
      console.log(`No UI schema found for ${schemaId}, using empty object`);
      return {};
    }
  }

  @Get('/schemas/:schemaId')
  @UseBefore(authMiddleware)
  async getSchemaById(@Param('schemaId') schemaId: string, @Req() req: RequestWithUser, @Res() response: Response): Promise<Response> {
    if (useLocalSchemas()) {
      // In local mode the param may be either a real UUID or a `local:<name>` id we returned earlier.
      const localName = schemaId.startsWith('local:') ? schemaId.slice('local:'.length) : schemaId;
      const local = await readLocalSchema(localName);
      if (local) return response.json(local);
    }

    try {
      const schemaRes = await this.apiService.get<JsonSchema>(
        {
          baseURL: apiURL(this.apiBase),
          url: `${MUNICIPALITY_ID}/schemas/${schemaId}`,
        },
        req,
      );

      const schema = schemaRes.data.value as Record<string, unknown>;
      const uiSchema = await this.fetchUiSchema(schemaId, req);

      return response.json({ schema, uiSchema, schemaId });
    } catch (error) {
      console.error('Error loading schema:', error);
      return response.status(500).json({
        error: 'Failed to load schema',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('/schemas/latest/:schemaName')
  @UseBefore(authMiddleware)
  async getLatestSchema(@Param('schemaName') schemaName: string, @Req() req: RequestWithUser, @Res() response: Response): Promise<Response> {
    if (useLocalSchemas()) {
      const local = await readLocalSchema(schemaName);
      if (local) return response.json(local);
    }

    try {
      const latestRes = await this.apiService.get<JsonSchema>(
        {
          baseURL: apiURL(this.apiBase),
          url: `${MUNICIPALITY_ID}/schemas/${schemaName}/versions/latest`,
        },
        req,
      );

      const schemaId = latestRes.data.id;
      const schema = latestRes.data.value as Record<string, unknown>;
      const uiSchema = await this.fetchUiSchema(schemaId, req);

      return response.json({ schema, uiSchema, schemaId });
    } catch (error) {
      console.error('Error loading schema:', error);
      return response.status(500).json({
        error: 'Failed to load schema',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
