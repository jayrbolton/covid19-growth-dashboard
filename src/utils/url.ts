

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
