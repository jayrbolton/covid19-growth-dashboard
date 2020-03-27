const SOURCE_URL = "https://covidtracking.com/api/states/daily";

export async function fetchData(): Promise<string> {
    const resp = await fetch(SOURCE_URL);
    const data = await resp.text();
    return data;
}
