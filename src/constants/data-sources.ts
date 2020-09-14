/*
 * Constant data about the covid tracking data sources
 */

// Johns Hopkins worldwide by-country source
export const JHU_SOURCE = {
  homeUrl: "https://github.com/CSSEGISandData/COVID-19",
  citationsURL:
    "https://github.com/jayrbolton/covid19-growth-dashboard/blob/master/disclaimer-citations.md",
  sourceUrls: {
    deaths:
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv",
    confirmed:
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
    recovered:
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv",
  },
  delimiter: ",",
  dateRegex: "(\\d+)\\/(\\d+)\\/(\\d+)",
  provinceIdx: 0,
  countryIdx: 1,
  latIdx: 2,
  lngIdx: 3,
  seriesIdx: 4,
  categoryKeys: ["confirmed", "deaths", "recovered"],
};

// Covidtracking.com US states source
export const COVIDTRACKING_SOURCE = {
  sourceUrl: "https://api.covidtracking.com/v1/states/daily.json",
  homeUrl: "https://covidtracking.com/about-tracker/",
};

// New york times county-by-county datasource
export const NYT_SOURCE = {
  sourceUrl:
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv",
  homeUrl: "https://github.com/nytimes/covid-19-data",
};
