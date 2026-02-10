import { OpenAPIV3 } from "openapi-types";

export const TenantPaths: OpenAPIV3.PathsObject = {
    "/system-admin/tenants": {
        post: {
            summary: "Onboard a new tenant",
            tags: [ "System Admin" ],
            security: [ { bearerAuth: [] } ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: [ "name", "adminEmail", "adminName" ],
                            properties: {
                                name: { type: "string", example: "Acme University" },
                                slug: { type: "string", example: "acme" },
                                domain: { type: "string", example: "acme.university.com" },
                                adminEmail: { type: "string", example: "admin@acme.edu" },
                                adminName: { type: "string", example: "Acme Admin" },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Tenant created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            tenant: { $ref: "#/components/schemas/Tenant" },
                                            adminUser: {
                                                type: "object",
                                                properties: {
                                                    email: { type: "string" },
                                                    name: { type: "string" },
                                                    tempPassword: { type: "string" },
                                                    invitationToken: { type: "string" },
                                                }
                                            }
                                        }
                                    },
                                },
                            },
                        },
                    },
                },
                400: { description: "Bad request" },
                409: { description: "Tenant slug or domain already exists" },
            },
        },
        get: {
            summary: "List all tenants",
            tags: [ "System Admin" ],
            security: [ { bearerAuth: [] } ],
            responses: {
                200: {
                    description: "List of tenants",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Tenant" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/system-admin/tenants/{tenantId}": {
        get: {
            summary: "Get tenant details",
            tags: [ "System Admin" ],
            security: [ { bearerAuth: [] } ],
            parameters: [
                {
                    in: "path",
                    name: "tenantId",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "Tenant details",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    data: { $ref: "#/components/schemas/Tenant" },
                                },
                            },
                        },
                    },
                },
                404: { description: "Tenant not found" },
            },
        },
    },
    "/system-admin/tenants/{tenantId}/config": {
        patch: {
            summary: "Update tenant configuration",
            tags: [ "System Admin" ],
            security: [ { bearerAuth: [] } ],
            parameters: [
                {
                    in: "path",
                    name: "tenantId",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/TenantConfigInput" },
                    },
                },
            },
            responses: {
                200: {
                    description: "Tenant updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    data: { $ref: "#/components/schemas/Tenant" },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
