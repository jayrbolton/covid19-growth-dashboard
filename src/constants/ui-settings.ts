export const UI_SETTINGS = {
  // How many days to show in the time series for each metric
  timeSeriesLen: 12,
  longSeriesLen: 50,
  // How many regions to show on each page
  pageLen: 10,
  // How many days they can time travel backwards
  timeTravelMaxRange: 50,
  // Background color for button to open graph
  graphButtonBg: "#137752",
  // Different time periods in days for average percent growth and total change
  detailsAverages: [3, 7, 14, 21, 49],
};

// Chart.js metrics comparison chart defaults
export const CHART_DEFAULTS = {
  type: "line",
  data: {
    datasets: [],
  },
  defaults: {
    global: {
      defaultFontColor: "white",
    },
  },
  options: {
    scales: {
      yAxes: [
        {
          gridLines: {
            color: "rgb(255,255,255,0.3)",
          },
        },
      ],
      xAxes: [
        {
          gridLines: {
            color: "rgb(255,255,255,0.3)",
          },
        },
      ],
    },
    responsive: false,
    elements: {
      line: {
        tension: 0, // disables bezier curves
      },
    },
    animation: {
      duration: 0, // general animation time
    },
    hover: {
      animationDuration: 0, // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
  },
};
