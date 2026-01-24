import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from './openapi';

export function mountSwagger(app: Application): void
{
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
    app.use('/docs-json', (_req, res) =>
    {
        res.json(openapiSpec);
    });
}
