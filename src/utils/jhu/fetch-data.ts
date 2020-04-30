/*
 * Retrieve source data about COVID-19 growth from the Johns Hopkins Github repo.
 * Returns text blobs of the source CSVs.
 */

import { JHU_SOURCE } from "../../constants/data-sources";

export async function fetchData() {
  const ret = {};
  for (const key of JHU_SOURCE.categoryKeys) {
    const resp = await fetch(JHU_SOURCE.sourceUrls[key]);
    const data = await resp.text();
    if (!resp.ok) {
      console.error(
        "Error fetching data from Github with the following response:"
      );
      console.error(data);
      throw new Error("Could not fetch data source from Github");
    }
    ret[key] = data;
  }
  return ret;
}
