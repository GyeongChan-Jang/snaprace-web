import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ddb, TIMING_TABLE } from "@/server/aws/clients";
import { getJsonFromS3 } from "@/server/utils/s3json";

const InputSchema = z.object({
  eventId: z.string().trim().min(1, "eventId는 필수입니다."),
  bib: z
    .string()
    .min(1, "bib는 필수입니다.")
    .transform((value) => value.trim()),
  resultSetId: z.string().trim().min(1).optional(),
});

type HeadingEntry =
  | string
  | {
      key?: string;
      name?: string;
    };

interface TimingResultItem {
  event_id: string;
  sort_key: string;
  result_set_id?: string;
  category: string;
  s3_key: string;
  row_index: number;
  bib?: string;
  user_id?: string;
  name?: string;
  gender?: string;
  age?: number | null;
  city?: string;
  state?: string;
  division?: string;
  division_place?: string;
  race_placement?: number | string;
  clock_time?: string;
  chip_time?: string;
  avg_pace?: string;
}

interface TimingDatasetJSON {
  headings?: HeadingEntry[];
  resultSet?: {
    headings?: HeadingEntry[];
    results?: unknown[][];
    resultUrls?: string[];
    auxData?: {
      resultUrls?: string[];
    };
  };
  results?: unknown[][];
  resultUrls?: string[];
  auxData?: {
    resultUrls?: string[];
  };
}

export type TimingDetail = {
  event_id: string;
  result_set_id: string;
  category: string;
  bib_num: string;
  name: string;
  gender: string;
  age: number | null;
  city?: string;
  state?: string;
  race_placement?: number | string;
  division?: string;
  division_place?: string;
  clock_time?: string;
  chip_time?: string;
  avg_pace?: string;
  result_url?: string;
  s3_key: string;
  row_index: number;
  raw: Record<string, unknown>;
};

async function fetchTimingItems(
  eventId: string,
  bib: string,
  resultSetId?: string,
): Promise<TimingResultItem[]> {
  const command = new QueryCommand({
    TableName: TIMING_TABLE,
    KeyConditionExpression: resultSetId
      ? "event_id = :eventId AND sort_key = :sortKey"
      : "event_id = :eventId AND begins_with(sort_key, :sortPrefix)",
    ExpressionAttributeValues: resultSetId
      ? {
          ":eventId": eventId,
          ":sortKey": `BIB#${bib}#RS#${resultSetId}`,
        }
      : {
          ":eventId": eventId,
          ":sortPrefix": `BIB#${bib}#RS#`,
        },
    ...(resultSetId ? { Limit: 1 } : {}),
  });

  const response = await ddb.send(command);
  return (response.Items ?? []) as TimingResultItem[];
}

function deriveResultSetId(item: TimingResultItem): string {
  if (item.result_set_id) {
    return String(item.result_set_id);
  }

  const parts = item.sort_key?.split("#RS#");
  if (parts?.length === 2) {
    return parts[1] ?? "";
  }
  return "";
}

function resolveHeadings(dataset: TimingDatasetJSON): HeadingEntry[] {
  if (Array.isArray(dataset.headings)) {
    return dataset.headings;
  }

  if (Array.isArray(dataset.resultSet?.headings)) {
    return dataset.resultSet.headings;
  }

  return [];
}

function resolveRows(dataset: TimingDatasetJSON): unknown[][] {
  if (Array.isArray(dataset.resultSet?.results)) {
    return dataset.resultSet.results;
  }

  if (Array.isArray(dataset.results)) {
    return dataset.results;
  }

  return [];
}

function sanitizeKey(entry: HeadingEntry, index: number): string {
  if (typeof entry === "string") {
    const normalized = entry.replace(/\s+/g, "_").toLowerCase();
    return normalized.length > 0 ? normalized : `col_${index}`;
  }

  if (entry?.key && entry.key.length > 0) {
    return entry.key;
  }

  if (entry?.name) {
    const normalized = entry.name.replace(/\s+/g, "_").toLowerCase();
    return normalized.length > 0 ? normalized : `col_${index}`;
  }

  return `col_${index}`;
}

function mapRowToObject(headings: HeadingEntry[], row: unknown[]): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  headings.forEach((heading, idx) => {
    const key = sanitizeKey(heading, idx);
    mapped[key] = row[idx];
  });

  return mapped;
}

function getField(row: Record<string, unknown>, key: string): unknown {
  return row[key];
}

function coerceString(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function coerceOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value.length > 0 ? value : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function coerceAge(value: unknown, fallback?: number | null): number | null {
  if (value === undefined || value === null || value === "") {
    return fallback ?? null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return fallback ?? null;
  }

  return numeric;
}

function coerceRacePlacement(value: unknown): number | string | undefined {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  return undefined;
}

async function toTimingDetail(
  item: TimingResultItem,
  cache: Map<string, TimingDatasetJSON>,
  fallbackBib: string,
): Promise<TimingDetail> {
  const dataset = await loadDataset(item.s3_key, cache);
  const headings = resolveHeadings(dataset);
  const rows = resolveRows(dataset);

  const rowIndex = Number(item.row_index);
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `유효하지 않은 row_index(${item.row_index}) 값입니다.`,
    });
  }

  const row = rows[rowIndex] ?? [];
  const mappedRow = mapRowToObject(headings, row);

  const resultUrls = resolveResultUrls(dataset);
  const resultSetId = deriveResultSetId(item);
  const racePlacement =
    coerceRacePlacement(getField(mappedRow, "race_placement")) ??
    coerceRacePlacement(item.race_placement);

  return {
    event_id: item.event_id,
    result_set_id: resultSetId,
    category: item.category,
    bib_num: coerceString(getField(mappedRow, "bib_num") ?? item.bib ?? fallbackBib),
    name: coerceString(getField(mappedRow, "name") ?? item.name ?? ""),
    gender: coerceString(getField(mappedRow, "gender") ?? item.gender ?? ""),
    age: coerceAge(getField(mappedRow, "age"), item.age),
    city: coerceOptionalString(getField(mappedRow, "city") ?? item.city),
    state: coerceOptionalString(getField(mappedRow, "state") ?? item.state),
    race_placement: racePlacement,
    division: coerceOptionalString(getField(mappedRow, "division") ?? item.division),
    division_place: coerceOptionalString(
      getField(mappedRow, "division_place") ?? item.division_place,
    ),
    clock_time: coerceOptionalString(
      getField(mappedRow, "clock_time") ?? item.clock_time,
    ),
    chip_time: coerceOptionalString(
      getField(mappedRow, "chip_time") ?? item.chip_time,
    ),
    avg_pace: coerceOptionalString(getField(mappedRow, "avg_pace") ?? item.avg_pace),
    result_url: Array.isArray(resultUrls) ? resultUrls[rowIndex] : undefined,
    s3_key: item.s3_key,
    row_index: rowIndex,
    raw: mappedRow,
  };
}

function resolveResultUrls(dataset: TimingDatasetJSON): string[] | undefined {
  if (Array.isArray(dataset.resultSet?.resultUrls)) {
    return dataset.resultSet?.resultUrls;
  }

  if (Array.isArray(dataset.resultUrls)) {
    return dataset.resultUrls;
  }

  if (Array.isArray(dataset.resultSet?.auxData?.resultUrls)) {
    return dataset.resultSet.auxData.resultUrls;
  }

  if (Array.isArray(dataset.auxData?.resultUrls)) {
    return dataset.auxData.resultUrls;
  }

  return undefined;
}

async function loadDataset(
  key: string,
  cache: Map<string, TimingDatasetJSON>,
): Promise<TimingDatasetJSON> {
  let dataset = cache.get(key);
  if (!dataset) {
    dataset = await getJsonFromS3<TimingDatasetJSON>(key);
    cache.set(key, dataset);
  }

  return dataset;
}

export const resultsRouter = createTRPCRouter({
  getTimingByBib: publicProcedure
    .input(InputSchema)
    .query(async ({ input }) => {
      const { eventId, bib, resultSetId } = input;

      let items: TimingResultItem[];
      try {
        items = await fetchTimingItems(eventId, bib, resultSetId);
      } catch (error) {
        console.error("DynamoDB timing 조회 실패:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "타이밍 데이터를 조회하지 못했습니다.",
        });
      }

      if (items.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 비브 번호의 타이밍 결과가 없습니다.",
        });
      }

      const datasetCache = new Map<string, TimingDatasetJSON>();

      const hydrate = async (item: TimingResultItem) => {
        try {
          return await toTimingDetail(item, datasetCache, bib);
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }

          console.error("타이밍 상세 데이터 구성 실패:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "타이밍 데이터가 올바르지 않습니다.",
          });
        }
      };

      if (resultSetId) {
        return hydrate(items[0]!);
      }

      const details = await Promise.all(items.map((item) => hydrate(item)));
      return details;
    }),
});
