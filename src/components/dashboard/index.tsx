import {h, Component} from 'preact';
import {FiltersAndSorts} from './filters-and-sorts';
import {RegionStats} from './region-stats';
import {filterByCountry, filterByProvince} from '../../utils/filter-data';
import {sortByTotalConfirmed, sortByGrowth} from '../../utils/sort-data';

export interface PercentageStat {
    label: string;
    stat: number;
    percentage: number;
    barColor: string;
}

export interface AverageStat {
    label: string;
    stat: number;
}

export interface TimeSeriesData {
    percentages: Array<Array<number>>; // Array of percentages for stacked bars
    colors: Array<string>; // Array of background colors for the bars
    labels: Array<string>; // Array of bar labels corresponding to above colors
    yMax: number;
    xMin: string;
    xMax: string;
    yLabel: string; // Y-axis label
    xLabel: string; // X-axis label
}

export interface DashboardEntry {
    city?: string,
    province?: string,
    country: string,
    // First column which can show some stats, colored bars, percentages
    col0: {
        stats: Array<PercentageStat>;
    };
    // Second column which shows averages with a title
    col1: {
        title: string;
        stats: Array<AverageStat>;
    };
    // Vertical bar graph
    bars: TimeSeriesData;
}

export interface DashboardData {
    count: number, // Total entries
    entries: Array<DashboardEntry>;
}

interface Props {
    loading: boolean;
    sourceData: DashboardData;
};

interface State {
    // A copy of sourceData with sorts and filters applied
    displayData: DashboardData
};

export class Dashboard extends Component<Props, State> {
    hiddenCount: number = 0;

    /*
    handleFilterCountry(inp: string) {
        this.filterCountry = inp;
        this.applyFiltersAndSorts();
    }
    */

    /*
    handleFilterProvince(inp: string) {
        this.filterProvince = inp;
        this.applyFiltersAndSorts();
    }
    */

    /*
    handleSort(inp: string) {
        if (inp === 'confirmed') {
            this.sortBy = Sorts.ConfirmedDesc;
        } else if (inp === 'growth_desc') {
            this.sortBy = Sorts.GrowthDesc;
        } else if (inp === 'growth_asc') {
            this.sortBy = Sorts.GrowthAsc;
        } else {
            throw new Error('Unknown sort option: ' + inp);
        }
        this.applyFiltersAndSorts()
    }
    */

    /*
    applyFiltersAndSorts() {
        if (!this.sourceData) {
            this.setState({rows: []});
            return;
        }
        const rows = this.sourceData.rows.slice(0);
        if (this.sortBy === Sorts.ConfirmedDesc) {
            sortByTotalConfirmed(rows);
        } else if (this.sortBy === Sorts.GrowthDesc) {
            sortByGrowth(rows, 'desc');
        } else if (this.sortBy === Sorts.GrowthAsc) {
            sortByGrowth(rows, 'asc');
        }
        for (const row of rows) {
            row.hidden = false;
        }
        if (this.filterCountry) {
            this.hiddenCount = filterByCountry(rows, this.filterCountry);
        } 
        if (this.filterProvince) {
            this.hiddenCount = filterByProvince(rows, this.filterProvince);
        } 
        this.setState({rows, loading: false});
    }
    */

    render() {
        if (this.props.loading) {
            return <p className='white sans-serif pt5 tc'>Loading data...</p>
        }
        return (
            <div>
                <RegionStats
                    data={this.props.sourceData}
                    loading={this.props.loading}
                />
            </div>
        );
    }
}

/* TODO
                <FiltersAndSorts
                    loading={this.props.loading}
                    onFilterCountry={inp => this.handleFilterCountry(inp)}
                    onFilterProvince={inp => this.handleFilterProvince(inp)}
                    onSort={inp => this.handleSort(inp)}
                />
*/
