import {h, Component} from 'preact';
import {FiltersAndSorts} from './filters-and-sorts';
import {RegionStats} from './region-stats';
import {filterByCountry, filterByProvince} from '../../utils/filter-data';
import {sortByTotalConfirmed, sortByGrowth, sortByDeaths} from '../../utils/sort-data';

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
    fetchSourceData: () => Promise<DashboardData>;
};

interface State {
    // A copy of sourceData with sorts and filters applied
    displayData?: DashboardData;
    loading: boolean;
};

export class Dashboard extends Component<Props, State> {
    // Total count of results before pagination
    resultsCount: number = 0;
    // Pagination count
    displayCount: number = 100;
    sourceData: DashboardData;
    filterCountry: string | null = null;
    filterProvince: string | null = null;
    sortBy: string  = 'confirmed';

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        this.props.fetchSourceData()
            .then((sourceData) => {
                this.sourceData = sourceData;
                this.transformSourceData();
            })
    }

    handleFilterCountry(inp: string) {
        this.filterCountry = inp;
        this.transformSourceData()
    }

    handleFilterProvince(inp: string) {
        this.filterProvince = inp;
        this.transformSourceData()
    }

    handleSort(inp: string) {
        this.sortBy = inp;
        this.transformSourceData()
    }

    handleClickShowMore() {
        this.displayCount = this.displayCount += 100;
        if (this.displayCount > this.resultsCount) {
            this.displayCount = this.resultsCount;
        }
        this.transformSourceData();
    }

    // Paginate, filter, and sort the source data
    transformSourceData() {
        // Filter out any entries
        let entries = this.sourceData.entries;
        if (this.filterCountry) {
            entries = filterByCountry(entries, this.filterCountry);
        }
        if (this.filterProvince) {
            entries = filterByProvince(entries, this.filterProvince);
        }
        this.resultsCount = entries.length;
        // Sort the results. The arrays are mutated in place by these functions.
        if (this.sortBy === 'confirmed') {
            sortByTotalConfirmed(entries);
        } else if (this.sortBy === 'growth_desc') {
            sortByGrowth(entries, 'desc');
        } else if (this.sortBy === 'deaths') {
            sortByDeaths(entries, 'desc');
        }
        // Paginate
        entries = entries.slice(0, this.displayCount)
        // Update state
        const displayData = {count: this.displayCount, entries};
        this.setState({displayData, loading: false});
    }

    showMoreButton() {
        const diff = this.resultsCount - this.displayCount;
        if (diff <= 0) {
            return '';
        }
        return (
            <p>
                <a onClick={() => this.handleClickShowMore()} className='pointer link b light-blue dim'>
                    Show more ({diff} remaining)
                </a>
            </p>
        );
    }

    render() {
        if (this.state.loading || !this.state.displayData) {
            return <p className='white sans-serif pt3'>Loading data...</p>
        }
        return (
            <div className='mt2'>
                <FiltersAndSorts
                    onFilterCountry={inp => this.handleFilterCountry(inp)}
                    onFilterProvince={inp => this.handleFilterProvince(inp)}
                    onSort={inp => this.handleSort(inp)}
                />
                <RegionStats data={this.state.displayData} />
                {this.showMoreButton()}
            </div>
        );
    }
}
