import { queryOptions } from "@tanstack/react-query";
import { getPublicRecords } from "./live.functions";
export const publicRecordsOptions = queryOptions({
  queryKey: ["public-records"],
  queryFn: () => getPublicRecords(),
  staleTime: 30_000,
});