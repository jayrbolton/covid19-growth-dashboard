/*
 * Retrieve source data about COVID-19 growth from the Johns Hopkins Github repo.
 * Returns text blobs of the source CSVs.
 */

import * as dataSources from '../../constants/data-sources.json';


export async function fetchData() {
    const ret = {};
    for (const key of dataSources.categoryKeys) {
        const resp = await fetch(dataSources[key]);
        const data = await resp.text();
        if (!resp.ok) {
            console.error("Error fetching data from Github with the following response:");
            console.error(data);
            throw new Error("Could not fetch data source from Github");
        }
        ret[key] = data;
    }
    return ret;
}
