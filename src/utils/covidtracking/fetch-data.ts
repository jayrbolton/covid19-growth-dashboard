const SOURCE_URL = "https://covidtracking.com/api/v1/states/daily.json";

export async function fetchData(): Promise<string> {
  const resp = await fetch(SOURCE_URL);
  const data = await resp.text();
  return data;
}
