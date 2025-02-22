import { Schema } from "effect";

export const NullObj = Schema.TaggedStruct("NullObj", {});

export type NullObj = typeof NullObj.Type;

export const NULL = NullObj.make();
