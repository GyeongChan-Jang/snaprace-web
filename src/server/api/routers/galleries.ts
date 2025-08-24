import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { dynamoClient, TABLES } from "@/lib/dynamodb";
import {
  GetCommand,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// Gallery item schema
const GallerySchema = z.object({
  bib_number: z.string(),
  // Add more fields as needed based on your actual DynamoDB table structure
  // For example:
  // name: z.string().optional(),
  // photos: z.array(z.string()).optional(),
  // created_at: z.string().optional(),
});

export const galleriesRouter = createTRPCRouter({
  // Get gallery by bib_number
  getById: publicProcedure
    .input(z.object({ bibNumber: z.string() }))
    .query(async ({ input }) => {
      const command = new GetCommand({
        TableName: TABLES.GALLERIES,
        Key: {
          bib_number: input.bibNumber,
        },
      });

      const result = await dynamoClient.send(command);
      return result.Item || null;
    }),

  // Get all galleries (scan operation - use with caution in production)
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        lastEvaluatedKey: z.record(z.any()).optional(),
      }),
    )
    .query(async ({ input }) => {
      const command = new ScanCommand({
        TableName: TABLES.GALLERIES,
        Limit: input.limit,
        ExclusiveStartKey: input.lastEvaluatedKey,
      });

      const result = await dynamoClient.send(command);
      return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      };
    }),

  // Create new gallery
  create: publicProcedure.input(GallerySchema).mutation(async ({ input }) => {
    const command = new PutCommand({
      TableName: TABLES.GALLERIES,
      Item: {
        ...input,
        created_at: new Date().toISOString(),
      },
    });

    await dynamoClient.send(command);
    return { success: true, item: input };
  }),

  // Update gallery
  update: publicProcedure
    .input(
      z.object({
        bibNumber: z.string(),
        data: GallerySchema.partial().omit({ bib_number: true }),
      }),
    )
    .mutation(async ({ input }) => {
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(input.data).forEach(([key, value], index) => {
        const nameKey = `#attr${index}`;
        const valueKey = `:val${index}`;
        updateExpressions.push(`${nameKey} = ${valueKey}`);
        expressionAttributeNames[nameKey] = key;
        expressionAttributeValues[valueKey] = value;
      });

      if (updateExpressions.length === 0) {
        throw new Error("No fields to update");
      }

      // Add updated_at timestamp
      const updatedAtKey = `#attr${updateExpressions.length}`;
      const updatedAtValue = `:val${updateExpressions.length}`;
      updateExpressions.push(`${updatedAtKey} = ${updatedAtValue}`);
      expressionAttributeNames[updatedAtKey] = "updated_at";
      expressionAttributeValues[updatedAtValue] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: TABLES.GALLERIES,
        Key: {
          bib_number: input.bibNumber,
        },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      });

      const result = await dynamoClient.send(command);
      return { success: true, item: result.Attributes };
    }),

  // Delete gallery
  delete: publicProcedure
    .input(z.object({ bibNumber: z.string() }))
    .mutation(async ({ input }) => {
      const command = new DeleteCommand({
        TableName: TABLES.GALLERIES,
        Key: {
          bib_number: input.bibNumber,
        },
      });

      await dynamoClient.send(command);
      return { success: true };
    }),
});
