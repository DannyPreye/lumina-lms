import { AsyncLocalStorage } from 'async_hooks';
import { ITenant } from '../../modules/system-admin/tenant.model';

export const tenantContext = new AsyncLocalStorage<ITenant>();

export const getTenant = (): ITenant | undefined =>
{
    return tenantContext.getStore();
};

export const getTenantId = (): string | undefined =>
{
    const tenant = tenantContext.getStore();
    return tenant?._id.toString();
};
