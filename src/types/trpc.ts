import {
  type RouterInputs as _RouterInputs,
  type RouterOutputs as _RouterOutputs,
} from "@/trpc/react";

export type RouterInputs = _RouterInputs;
export type RouterOutputs = _RouterOutputs;

// Events
export type EventEntity = RouterOutputs["events"]["getAll"][number];
export type EventById = RouterOutputs["events"]["getById"];

// Galleries
export type GalleriesList =
  RouterOutputs["galleries"]["get"] extends Array<infer T> ? T[] : never;
export type GalleryByBib = Exclude<
  RouterOutputs["galleries"]["get"],
  undefined
>;
export type GalleriesGetInput = RouterInputs["galleries"]["get"];
