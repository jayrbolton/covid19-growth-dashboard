import {h, Component} from 'preact';
// Components
import {FiltersAndSorts} from './filters-and-sorts';
import {RegionStats} from './region-stats';
// Utils
import {filterLocation} from '../../utils/filter-data';
import {sortByStat} from '../../utils/sort-data';
// Types
import {DashboardData} from '../../types/dashboard';

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
    filterLocation: string | null = null;
    sortBy: number  = 0;

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

    handleFilterLocation(inp: string) {
        this.filterLocation = inp;
        this.transformSourceData()
    }

    handleSort(inp: number) {
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
        if (this.filterLocation) {
            entries = filterLocation(entries, this.filterLocation);
        }
        this.resultsCount = entries.length;
        // Sort the results. The arrays are mutated in place by these functions.
        sortByStat(entries, this.sortBy, 'desc');
        // Paginate
        entries = entries.slice(0, this.displayCount)
        // Update state
        const displayData = {entries, entryLabels: this.sourceData.entryLabels};
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
                    entryLabels={this.state.displayData.entryLabels}
                    onFilterLocation={inp => this.handleFilterLocation(inp)}
                    onSort={inp => this.handleSort(inp)}
                />
                <RegionStats data={this.state.displayData} />
                {this.showMoreButton()}
            </div>
        );
    }
}
