import { COVIDTRACKING_SOURCE } from "../../constants/data-sources";

export async function fetchData(): Promise<string> {
  const resp = await fetch(COVIDTRACKING_SOURCE.sourceUrl, {
    mode: "cors",
  });
  const data = await resp.text();
  return data;
}
