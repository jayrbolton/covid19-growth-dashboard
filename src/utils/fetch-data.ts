/*
 * Retrieve source data about COVID-19 growth from the Johns Hopkins Github repo.
 * Returns text blobs of the source CSVs.
 */

import * as dataSources from '~constants/data-sources.json';

const LS_DATE_KEY = 'lastFetched';
const LS_CACHE_PREFIX = 'cache_';
const LS_CONFIRMED_KEY = 'cachedConfirmed';
const LS_DEATHS_KEY = 'cachedDeaths';
const LS_RECOVERED_KEY = 'cachedRecovered';


export async function fetchData() {
    // First try to fetch the date from a localStorage cache
    // const lastFetch = window.localStorage.getItem(LS_DATE_KEY);
    // const date = new Date();
    // const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    // if (lastFetch) {
    //     if (lastFetch === today) {
    //         // Fetch the date from the cache
    //         const ret = {};
    //         let validCache = true;
    //         for (const key of dataSources.categoryKeys) {
    //             ret[key] = localStorage.getItem(LS_CACHE_PREFIX + key);
    //             if (!ret[key]) {
    //                 validCache = false;
    //                 break;
    //             }
    //         }
    //         if (validCache) {
    //             return ret;
    //         } else {
    //             clearCache();
    //         }
    //     } else {
    //         clearCache();
    //     }
    // }
    // // Fetch the data from the Github repo and cache it
    // window.localStorage.setItem(LS_DATE_KEY, today);
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
        // window.localStorage.setItem(LS_CACHE_PREFIX + key, data);
    }
    return ret;
}

function clearCache () {
    window.localStorage.removeItem(LS_DATE_KEY);
    for (const key of dataSources.categoryKeys) {
        window.localStorage.removeItem(LS_CACHE_PREFIX + key);
    }
}
