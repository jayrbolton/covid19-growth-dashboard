

// Do a merge update on the URL query to get a new query
export function updateURLQuery(updates: object, query: string | null = null): string {
    if (!query) {
        query = location.search;
    }
    const obj = queryToObj(query);
    return objToQuery(Object.assign(obj, updates));
}

export function queryToObj(query: string | null = null): any {
    if (!query) {
        query = location.search;
    }
    return query
        .slice(1).split('&')
        .map(each => each.split('='))
        .reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
}

export function objToQuery(obj: object): string {
    let ret = '?';
    let keyvals = [];
    for (const key in obj) {
        keyvals.push([key, obj[key]]);
    }
    ret += keyvals.map(([key, val]) => key + '=' + val).join('&');
    return ret;
}
