import { Schema } from 'mongoose';
import { getTenantId } from '../contexts/tenant.context';

export interface ITenantAware
{
    tenantId: any; // Schema.Types.ObjectId
}

export const tenantPlugin = (schema: Schema) =>
{
    // 1. Add tenantId field
    schema.add({
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            index: true,
            // required: true // TODO: Enable strict requirement after migration
        }
    });

    // 2. Pre-save hook: inject tenantId
    schema.pre('save' as any, async function (this: any)
    {
        const tenantId = getTenantId();
        // If tenantId is already set (e.g. manually by admin or migration script), don't overwrite
        if (this.isNew && !this.get('tenantId') && tenantId) {
            this.set('tenantId', tenantId);
        }
    });

    // 3. Pre-find hooks: filter by tenantId
    // Standard find, findOne, findOneAndUpdate, etc.
    const methods = [
        'countDocuments',
        'find',
        'findOne',
        'findOneAndDelete',
        'findOneAndUpdate',
        'updateOne',
        'updateMany',
        'deleteOne',
        'deleteMany',
    ];

    methods.forEach((method) =>
    {
        schema.pre(method as any, async function (this: any)
        {
            const tenantId = getTenantId();

            if (tenantId) {
                // Check if user manually specified tenantId in the query
                const filter = this.getFilter();
                if (!filter.tenantId) {
                    this.setQuery({ ...filter, tenantId });
                }
            }
        });
    });
};
