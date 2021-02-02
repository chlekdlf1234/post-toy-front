import { Cache, QueryInput } from "@urql/exchange-graphcache";

export function toUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => {
    return fn(result, data as any) as any;
  });
}
