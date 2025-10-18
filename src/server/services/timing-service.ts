import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const TIMING_MESSAGES = {
  FETCH_FAILED: "Failed to fetch timing records.",
  DATASET_LOAD_FAILED: "Unable to load timing dataset from storage.",
  ROW_OUT_OF_RANGE: "Row index is out of range in timing dataset.",
  DATASET_MALFORMED: "Timing dataset is missing required data.",
} as const satisfies Record<string, string>;

export type TimingItem = {
  event_id: string;
  sort_key: string;
  bib: string;
  name?: string;
  user_id?: number | null;
  row_index: number;
  result_set_id: string;
  s3_key: string;
};

export type ResultRow = Record<string, unknown>;

export type BibDetailResponse = {
  meta: {
    eventId: string;
    bib: string;
    name?: string;
    userId?: number | null;
  };
  row: ResultRow;
  raw: {
    row_index: number;
    s3_key: string;
  };
};

export enum TimingServiceErrorReason {
  QueryFailed = "QUERY_FAILED",
  ItemNotFound = "ITEM_NOT_FOUND",
  DatasetLoadFailed = "DATASET_LOAD_FAILED",
  RowOutOfRange = "ROW_OUT_OF_RANGE",
  DatasetMalformed = "DATASET_MALFORMED",
}

export class TimingServiceError extends Error {
  constructor(
    public readonly reason: TimingServiceErrorReason,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "TimingServiceError";
  }
}

export type LoadDatasetFn = (
  key: string,
) => Promise<TimingDatasetJSON>;

export type TimingDatasetJSON = {
  headings?: Array<{ key?: string; name?: string }>;
  resultSet?: {
    results?: unknown[][];
  };
  resultUrls?: string[];
  auxData?: {
    resultUrls?: string[];
  };
};

export async function fetchTimingItem(options: {
  ddb: Pick<DynamoDBDocumentClient, "send">;
  tableName: string;
  eventId: string;
  bib: string;
}): Promise<TimingItem | null> {
  const { ddb, tableName, eventId, bib } = options;
  const sortKey = makeSortKey(bib);

  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "event_id = :eventId AND sort_key = :sortKey",
    ExpressionAttributeValues: {
      ":eventId": eventId,
      ":sortKey": sortKey,
    },
    Limit: 1,
  });

  try {
    const response = await ddb.send(command);
    const item = response.Items?.[0];
    if (!item) {
      return null;
    }
    return item as TimingItem;
  } catch (error) {
    throw new TimingServiceError(
      TimingServiceErrorReason.QueryFailed,
      TIMING_MESSAGES.FETCH_FAILED,
      error,
    );
  }
}

export async function buildBibDetail(options: {
  item: TimingItem;
  loadDataset: LoadDatasetFn;
}): Promise<BibDetailResponse> {
  const { item, loadDataset } = options;
  const dataset = await loadTimingDataset(loadDataset, item.s3_key);

  const headings = Array.isArray(dataset.headings) ? dataset.headings : [];
  const results = dataset.resultSet?.results;

  if (!Array.isArray(results)) {
    throw new TimingServiceError(
      TimingServiceErrorReason.DatasetMalformed,
      TIMING_MESSAGES.DATASET_MALFORMED,
    );
  }

  const row = results[item.row_index];
  if (!row) {
    throw new TimingServiceError(
      TimingServiceErrorReason.RowOutOfRange,
      TIMING_MESSAGES.ROW_OUT_OF_RANGE,
    );
  }

  const rowObject = mapRow(headings, row);

  return {
    meta: {
      eventId: item.event_id,
      bib: item.bib,
      name: item.name,
      userId: item.user_id ?? null,
    },
    row: rowObject,
    raw: {
      row_index: item.row_index,
      s3_key: item.s3_key,
    },
  };
}

export async function getBibDetail(options: {
  ddb: Pick<DynamoDBDocumentClient, "send">;
  tableName: string;
  eventId: string;
  bib: string;
  loadDataset: LoadDatasetFn;
}): Promise<BibDetailResponse> {
  const { ddb, tableName, eventId, bib, loadDataset } = options;
  const item = await fetchTimingItem({ ddb, tableName, eventId, bib });

  if (!item) {
    throw new TimingServiceError(
      TimingServiceErrorReason.ItemNotFound,
      "Timing item not found.",
    );
  }

  return buildBibDetail({ item, loadDataset });
}

function makeSortKey(bib: string | number) {
  return `BIB#${String(bib).trim()}`;
}

async function loadTimingDataset(
  loadDataset: LoadDatasetFn,
  key: string,
): Promise<TimingDatasetJSON> {
  try {
    return await loadDataset(key);
  } catch (error) {
    throw new TimingServiceError(
      TimingServiceErrorReason.DatasetLoadFailed,
      TIMING_MESSAGES.DATASET_LOAD_FAILED,
      error,
    );
  }
}

function mapRow(headings: Array<{ key?: string; name?: string }>, row: unknown[]): ResultRow {
  const columnIndex = buildColumnIndex(headings);
  const mapped: ResultRow = {};

  headings.forEach((heading) => {
    if (!heading?.key) return;
    const idx = columnIndex(heading.key);
    mapped[heading.key] = idx === undefined ? undefined : row[idx];
  });

  return mapped;
}

function buildColumnIndex(headings: Array<{ key?: string }>) {
  const index = new Map<string, number>();
  headings.forEach((heading, idx) => {
    if (heading?.key) {
      index.set(heading.key, idx);
    }
  });

  return (key: string) => index.get(key);
}
