import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { dynamoClient, TABLES } from "@/lib/dynamodb";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export const galleriesRouter = createTRPCRouter({
  // Get galleries - eventId required, bibNumber optional
  get: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        bibNumber: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // If bibNumber provided, get specific item
      if (input.bibNumber) {
        const command = new GetCommand({
          TableName: TABLES.GALLERIES,
          Key: {
            event_id: input.eventId,
            bib_number: input.bibNumber,
          },
        });
        const result = await dynamoClient.send(command);
        return result.Item ?? null;
      }

      // Otherwise, get all items for the event
      const command = new QueryCommand({
        TableName: TABLES.GALLERIES,
        KeyConditionExpression: "event_id = :eventId",
        ExpressionAttributeValues: {
          ":eventId": input.eventId,
        },
      });
      const result = await dynamoClient.send(command);
      return result.Items ?? [];
    }),
});
