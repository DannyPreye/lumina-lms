import { OpenAPIV3 } from 'openapi-types';
import { GeneratedPaths } from './generated';
import { TenantPaths } from './tenant.paths';

export const Paths: OpenAPIV3.PathsObject = {
    ...GeneratedPaths,
    ...TenantPaths,
};
