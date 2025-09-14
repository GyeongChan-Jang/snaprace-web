import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { dynamoClient, TABLES } from "@/lib/dynamodb";
import { ScanCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export const EventSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_image_url: z.string(),
  event_date: z.string(),
  event_location: z.string(),
  event_type: z.string(),
  organization_id: z.string(),
  participant_count: z.number().optional(),
});

export type Event = z.infer<typeof EventSchema>;

export const eventsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ organizationId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      // If organizationId is provided, filter events by organization
      if (input?.organizationId) {
        // Use Query with GSI if available, otherwise scan with filter
        const command = new ScanCommand({
          TableName: TABLES.EVENTS,
          FilterExpression: "organization_id = :organizationId",
          ExpressionAttributeValues: {
            ":organizationId": input.organizationId,
          },
        });
        const result = await dynamoClient.send(command);
        return (result.Items ?? []) as Event[];
      }

      // No filter, return all events
      const command = new ScanCommand({
        TableName: TABLES.EVENTS,
      });
      const result = await dynamoClient.send(command);
      return (result.Items ?? []) as Event[];
    }),

  getByOrganization: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      // Query events by organization_id
      const command = new ScanCommand({
        TableName: TABLES.EVENTS,
        FilterExpression: "organization_id = :organizationId",
        ExpressionAttributeValues: {
          ":organizationId": input.organizationId,
        },
      });
      const result = await dynamoClient.send(command);
      return (result.Items ?? []) as Event[];
    }),

  getById: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      const command = new GetCommand({
        TableName: TABLES.EVENTS,
        Key: {
          event_id: input.eventId,
        },
      });
      const result = await dynamoClient.send(command);
      return (result.Item ?? null) as Event | null;
    }),
});
