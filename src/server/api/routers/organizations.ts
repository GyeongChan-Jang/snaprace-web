import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { dynamoClient } from "@/lib/dynamodb";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { env } from "@/env";

// Partner schema
const PartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  website_url: z.string().optional(),
  description: z.string().optional(),
  display_order: z.number().optional(),
});

// Organization schema
export const OrganizationSchema = z.object({
  organization_id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  custom_settings: z
    .object({
      show_partner_section: z.boolean().optional(),
      welcome_message: z.string().optional(),
      partners: z.array(PartnerSchema).optional(),
      custom_footer_text: z.string().optional(),
    })
    .optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  website_url: z.string().optional(),
  social_links: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const organizationsRouter = createTRPCRouter({
  getBySubdomain: publicProcedure
    .input(z.object({ subdomain: z.string() }))
    .query(async ({ input }) => {
      if (!input.subdomain) {
        return null;
      }

      try {
        // Query using GSI subdomain-index
        const command = new QueryCommand({
          TableName: env.DYNAMO_ORGANIZATIONS_TABLE,
          IndexName: "subdomain-index",
          KeyConditionExpression: "subdomain = :subdomain",
          ExpressionAttributeValues: {
            ":subdomain": input.subdomain,
          },
          Limit: 1,
        });

        const result = await dynamoClient.send(command);
        const item = result.Items?.[0];

        if (!item) {
          return null;
        }

        // Parse and validate the organization data
        return OrganizationSchema.parse(item);
      } catch (error) {
        console.error("Error fetching organization by subdomain:", error);
        return null;
      }
    }),

  getById: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      if (!input.organizationId) {
        return null;
      }

      try {
        const command = new GetCommand({
          TableName: env.DYNAMO_ORGANIZATIONS_TABLE,
          Key: {
            organization_id: input.organizationId,
          },
        });

        const result = await dynamoClient.send(command);

        if (!result.Item) {
          return null;
        }

        // Parse and validate the organization data
        return OrganizationSchema.parse(result.Item);
      } catch (error) {
        console.error("Error fetching organization by ID:", error);
        return null;
      }
    }),
});
