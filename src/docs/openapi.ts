import { OpenAPIV3 } from "openapi-types";
import { Schemas } from "./components/schemas";
import { Paths } from "./paths";

export const openapiSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Lumina Learning Platform API",
    version: "1.0.0",
    description:
      "Complete API documentation for Lumina, a full-featured Learning Management System. Categorized by User Roles (Public, Student, Instructor, Admin).",
  },
  servers: [ { url: "http://localhost:5000/api/v1" } ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: Schemas,
  },
  paths: Paths,
};
