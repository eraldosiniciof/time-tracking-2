import { STORAGE_DRIVER } from "../config";
import { ApiRepository } from "./api";
import { LocalStorageRepository } from "./local";
import type { TimeTrackingRepository } from "./repository";

/** Factory — único ponto a mudar ao plugar PostgreSQL. */
export function createRepository(): TimeTrackingRepository {
  if (STORAGE_DRIVER === "api") {
    return new ApiRepository();
  }
  return new LocalStorageRepository();
}
