import { OpenAPIV3 } from 'openapi-types';
import { GeneratedSchemas } from './generated';
import { TenantSchema } from './tenant.schema';

export const Schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {
    ...GeneratedSchemas,
    ...TenantSchema,
};
