import {h, Component} from 'preact';
// Components
import {RegionStats} from './region-stats';
import {MetricsSelector} from './metrics-selector';
import {MetricsComparison} from './metrics-comparison';
import {Filters} from './filters';
import {Sorts} from './sorts';
import {ShowIf} from '../generic/show-if';
import {Button} from '../generic/button';
// Utils
import {filterLocation} from '../../utils/filter-data';
import {sortByStat} from '../../utils/sort-data';
import {pluralize} from '../../utils/formatting';
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
    showingGraph: boolean;
    selectedCount: number;
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
            showingGraph: false,
            selectedCount: 0,
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

    handleShowMore() {
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
    handleSelectStat(entry, statIdx) {
        console.log(entry, statIdx);
        let count = this.state.selectedCount;
        if (entry.stats[statIdx].isComparing) {
            count -= 1;
        } else {
            count += 1;
        }
        entry.stats[statIdx].isComparing = !entry.stats[statIdx].isComparing;
        this.setState({selectedCount: count});
    }

    handleShowGraph() {
        this.setState({showingGraph: true});
    }

    handleHideGraph() {
        this.setState({showingGraph: false});
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
                <a onClick={() => this.handleShowMore()} className='pointer link b light-blue dim'>
                    Show more ({diff} remaining)
                </a>
            </p>
        );
    }

    render() {
        if (this.state.loading || !this.state.displayData) {
            return <p className='white sans-serif pa4'>Loading data...</p>
        }
        const selectedCount = this.state.selectedCount;
        let selectedText = 'Select some metrics to graph and compare';
        if (selectedCount > 0) {
            selectedText = `You've selected ${selectedCount} ${pluralize('metric', selectedCount)}:`;
        }
        return (
            <div className='mt2'>
                <div
                    className='ph2 ph2-m ph4-ns z-1 bb b--white-30 w-100'
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
                        <div className='mh2 bl b--white-30 pl3 ml2'>
                            {Button({
                                text: `Graph ${selectedCount} selected`,
                                background: '#137752',
                                disabled: selectedCount === 0,
                                onClick: () => this.handleShowGraph(),
                            })}
                        </div>
                    </div>
                </div>
                <RegionStats
                    data={this.state.displayData}
                    onSelectStat={(entry, statIdx) => this.handleSelectStat(entry, statIdx)}
                    displayedStats={this.state.displayedStats} />
                {this.showMoreButton()}
                <MetricsComparison
                    hidden={!this.state.showingGraph}
                    sourceData={this.sourceData}
                    onClose={() => this.handleHideGraph()} />
            </div>
        );
    }
}
