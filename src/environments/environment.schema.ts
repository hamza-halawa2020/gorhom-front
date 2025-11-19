import {z} from "zod";

/**
 * Environment Configuration Schema using Zod
 * This file defines the structure and validation for environment.ts
 * It ensures all environments have consistent configuration
 */

// EmailJS configuration schema
const EmailJsConfigSchema = z.object({
  serviceId: z.string().min(1, "Service ID cannot be empty"),
  templateId: z.string().min(1, "Template ID cannot be empty"),
  publicKey: z.string().min(1, "Public key cannot be empty"),
  email: z.email("Must be a valid email address"),
});

// Environment type schema
const EnvironmentTypeSchema = z.enum(["dev", "staging", "prod"]);

// Main environment schema
const EnvironmentSchema = z.object({
  environment: EnvironmentTypeSchema.default("dev"),
  contactEmail: z.email("Must be a valid email address"),
  contactFormEmail: z.email("Must be a valid email address"),
  apiUrl: z.string(),
  BaseUrl: z.string(),
  plausibleDomain: z.string().min(1, "Plausible domain cannot be empty"),
  emailjsZoho: EmailJsConfigSchema,
  emailjs: EmailJsConfigSchema,
  emailjsZohoInvestors: EmailJsConfigSchema,
});

// TypeScript types derived from Zod schemas
export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;
export type EmailJsConfig = z.infer<typeof EmailJsConfigSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;

/**
 * Validates environment configuration using Zod
 * Throws detailed validation errors if configuration is invalid
 */
export function validateEnvironment(env: any): Environment {
  try {
    return EnvironmentSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${errorMessages.join("\n")}`
      );
    }
    throw error;
  }
}
