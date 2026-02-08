import { OpenAPIV3 } from "openapi-types";

export const TenantSchema: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {
    Tenant: {
        type: "object",
        properties: {
            _id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            domain: { type: "string" },
            ownerId: {
                oneOf: [
                    { type: "string" },
                    {
                        type: "object",
                        properties: {
                            _id: { type: "string" },
                            email: { type: "string" },
                            name: { type: "string" },
                        },
                    },
                ],
            },
            status: {
                type: "string",
                enum: [ "active", "suspended", "pending" ],
            },
            config: {
                type: "object",
                properties: {
                    modules: {
                        type: "object",
                        properties: {
                            gamification: { type: "boolean" },
                            payments: { type: "boolean" },
                            certificates: { type: "boolean" },
                            blog: { type: "boolean" },
                            discussions: { type: "boolean" },
                        },
                    },
                    branding: {
                        type: "object",
                        properties: {
                            logoUrl: { type: "string" },
                            primaryColor: { type: "string" },
                            secondaryColor: { type: "string" },
                            fontFamily: { type: "string" },
                        },
                    },
                    auth: {
                        type: "object",
                        properties: {
                            googleClientId: { type: "string" },
                            allowedDomains: {
                                type: "array",
                                items: { type: "string" },
                            },
                        },
                    },
                },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },
    TenantConfigInput: {
        type: "object",
        properties: {
            modules: {
                type: "object",
                properties: {
                    gamification: { type: "boolean" },
                    payments: { type: "boolean" },
                    certificates: { type: "boolean" },
                    blog: { type: "boolean" },
                    discussions: { type: "boolean" },
                },
            },
            branding: {
                type: "object",
                properties: {
                    logoUrl: { type: "string" },
                    primaryColor: { type: "string" },
                    secondaryColor: { type: "string" },
                    fontFamily: { type: "string" },
                },
            },
        },
    },
};
