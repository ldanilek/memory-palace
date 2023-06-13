/* eslint-disable */
/**
 * Generated API.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.15.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules } from "convex/api";
import type * as addMemory from "../addMemory";
import type * as getShortTerm from "../getShortTerm";
import type * as memories from "../memories";
import type * as reviseShortTerm from "../reviseShortTerm";
import type * as storeUser from "../storeUser";

/**
 * A type describing your app's public Convex API.
 *
 * This `API` type includes information about the arguments and return
 * types of your app's query and mutation functions.
 *
 * This type should be used with type-parameterized classes like
 * `ConvexReactClient` to create app-specific types.
 */
export type API = ApiFromModules<{
  addMemory: typeof addMemory;
  getShortTerm: typeof getShortTerm;
  memories: typeof memories;
  reviseShortTerm: typeof reviseShortTerm;
  storeUser: typeof storeUser;
}>;
