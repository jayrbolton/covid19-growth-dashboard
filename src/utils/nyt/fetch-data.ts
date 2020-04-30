import { NYT_SOURCE } from "../../constants/data-sources";

export async function fetchData() {
  const resp = await fetch(NYT_SOURCE.sourceUrl);
  const text = await resp.text();
  return text;
}
