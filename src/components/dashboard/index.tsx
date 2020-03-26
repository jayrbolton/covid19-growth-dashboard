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
    fetchSourceData: () => Promise<DashboardData>;
};

interface State {
    // A copy of sourceData with sorts and filters applied
    displayData?: DashboardData;
    loading: boolean;
};

export class Dashboard extends Component<Props, State> {
    displayCount: number = 100;
    sourceData: DashboardData;

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

    handleClickShowMore() {
        this.displayCount = this.displayCount += 100;
        if (this.displayCount > this.sourceData.count) {
            this.displayCount = this.sourceData.count;
        }
        this.transformSourceData();
    }

    // Paginate, filter, and sort the source data
    transformSourceData() {
        const displayData = {
            count: this.displayCount,
            entries: this.sourceData.entries.slice(0, this.displayCount)
        };
        console.log(displayData);
        this.setState({displayData, loading: false});
    }

    showMoreButton() {
        let displayCount = 0;
        if (this.state.displayData) {
            displayCount = this.state.displayData.count;
        }
        const diff = this.sourceData.count - displayCount;
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
                <RegionStats data={this.state.displayData} />
                {this.showMoreButton()}
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
