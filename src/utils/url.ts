// Do a merge update on the URL query to get a new query
export function updateURLQuery(
  updates: object,
  query: string | null = null
): string {
  if (!query) {
    query = location.search;
  }
  const obj = queryToObj(query);
  return objToQuery(Object.assign(obj, updates));
}

// Convert a URL search/query string into an object of keyvals
export function queryToObj(query: string | null = null): any {
  if (!query) {
    query = location.search;
  }
  return query
    .slice(1)
    .split("&")
    .map((each) => each.split("="))
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
}

// Convert a flat object of keyvals into a url query string
export function objToQuery(obj: object): string {
  const keyvals = Object.keys(obj)
    .map((key) => [key, obj[key]])
    .filter(([key, val]) => val !== null && val !== undefined);
  return "?" + keyvals.map(([key, val]) => key + "=" + val).join("&");
}
