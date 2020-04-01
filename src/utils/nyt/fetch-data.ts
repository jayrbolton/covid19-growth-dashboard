
const SOURCE_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

export async function fetchData() {
    const resp = await fetch(SOURCE_URL);
    const text = await resp.text();
    return text;
}
