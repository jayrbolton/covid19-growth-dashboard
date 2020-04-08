import {h, Component} from 'preact';
// Components
import {RegionStats} from './region-stats';
import {MetricsSelector} from './metrics-selector';
import {Filters} from './filters';
import {Sorts} from './sorts';
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
    displayedStats: Map<number, boolean>;
    // Stats selected for graphing and comparing
    selectedStats: Map<string, {location: string, statIdx: number}>;
};

// Some arbitrary min device size for the top filter options to be position:sticky
const FILTER_POS = window.outerWidth > 600 ? 'sticky' : 'relative';
const PAGE_SIZE = 20;

export class Dashboard extends Component<Props, State> {
    // Total count of results before pagination
    resultsCount: number = 0;
    // Pagination count
    displayCount: number = PAGE_SIZE;
    sourceData: DashboardData;
    filterLocation: string | null = null;
    sortBy: {idx: number, prop: string} = {idx: 0, prop: 'val'};

    constructor(props: Props) {
        super(props);
        const width = window.outerWidth;
        let displayedStats;
        if (width >= 1023) {
            displayedStats = new Map([[0, true], [1, true], [2, true], [3, true]]);
        } else if (width >= 769) {
            displayedStats = new Map([[0, true], [1, true], [2, true]]);
        } else {
            displayedStats = new Map([[0, true], [1, true]]);
        }
        this.state = {
            loading: true,
            displayedStats,
            selectedStats: new Map(),
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
        this.filterLocation = inp.trim();
        this.transformSourceData()
    }

    handleSort(idx: number, prop: string) {
        this.sortBy = {idx, prop};
        this.transformSourceData()
    }

    handleClickShowMore() {
        this.displayCount = this.displayCount += PAGE_SIZE;
        if (this.displayCount > this.resultsCount) {
            this.displayCount = this.resultsCount;
        }
        this.transformSourceData();
    }

    handleChangeStatsDisplayed(displayedStats: Map<number, boolean>) {
        this.setState({displayedStats});
    }

    // Change which stats to graph & compare
    handleSelectStat(selection) {
        const id = selection.location + ':' + selection.statIdx;
        const selectedStats = this.state.selectedStats;
        if (selectedStats.has(id)) {
            selectedStats.delete(id);
        } else {
            selectedStats.set(id, selection);
        }
        this.setState({selectedStats});
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
            <p className='ph2 ph2-m ph4-ns pb4'>
                <a onClick={() => this.handleClickShowMore()} className='pointer link b light-blue dim'>
                    Show more ({diff} remaining)
                </a>
            </p>
        );
    }

    render() {
        if (this.state.loading || !this.state.displayData) {
            return <p className='white sans-serif pa4'>Loading data...</p>
        }
        return (
            <div className='mt2'>
                <div
                    className='pv2 ph2 ph2-m ph4-ns z-1 bb b--white-30'
                    style={{position: FILTER_POS, top: 0, marginLeft: '-0.5rem', marginRight: '-0.5rem', background: '#1d1d1d'}}>
                    <div className='flex flex-wrap items-center'>
                        <MetricsSelector
                            onSelect={selected => this.handleChangeStatsDisplayed(selected)}
                            entryLabels={this.state.displayData.entryLabels}
                            defaultDisplayedStats={this.state.displayedStats} />
                        <Sorts
                            onSort={(idx, prop) => this.handleSort(idx, prop)}
                            displayedStats={this.state.displayedStats}
                            entryLabels={this.state.displayData.entryLabels} />
                        <Filters onFilterLocation={inp => this.handleFilterLocation(inp)}/>
                    </div>
                </div>
                <RegionStats
                    data={this.state.displayData}
                    onSelectStat={selection => this.handleSelectStat(selection)}
                    selectedStats={this.state.selectedStats}
                    displayedStats={this.state.displayedStats} />
                {this.showMoreButton()}
            </div>
        );
    }
}
