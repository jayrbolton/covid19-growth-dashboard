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
const PAGE_SIZE = 20;

export class Dashboard extends Component<Props, State> {
    // Total count of results before pagination
    resultsCount: number = 0;
    // Pagination count
    displayCount: number = PAGE_SIZE;
    sourceData: DashboardData;
    filterLocation: string | null = null;
    sortBy: {idx: number, prop: string} = {idx: 0, prop: 'val'};
    // Boolean to track if the user just clicked a stat for highlighting purposes
    justSelectedStat = false;

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
        let count = this.state.selectedCount;
        if (entry.stats[statIdx].isComparing) {
            count -= 1;
        } else {
            count += 1;
            this.justSelectedStat = true;
        }
        entry.stats[statIdx].isComparing = !entry.stats[statIdx].isComparing;
        this.setState({selectedCount: count});
    }

    handleClearSelectedStats() {
        // Mutate the source data and update all stats to have isComparing=false
        this.sourceData.entries.forEach(entry => {
            entry.stats.forEach(stat => {
                stat.isComparing = false;
            });
        });
        this.setState({selectedCount: 0});
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
            return <p className='white sans-serif ph3 pv4'>Loading data...</p>
        }
        const selectedCount = this.state.selectedCount;
        let selectedText = 'Select some metrics to graph and compare';
        if (selectedCount > 0) {
            selectedText = `You've selected ${selectedCount} ${pluralize('metric', selectedCount)}:`;
        }
        return (
            <div className='flex mt4 bt b--white-20'>
                <div className='ph3 z-1 sidebar bg-near-black'>
                    <div>
                        <Filters onFilterLocation={inp => this.handleFilterLocation(inp)}/>
                        <MetricsSelector
                            onSelect={selected => this.handleChangeStatsDisplayed(selected)}
                            entryLabels={this.state.displayData.entryLabels}
                            defaultDisplayedStats={this.state.displayedStats} />
                        <Sorts
                            onSort={(idx, prop) => this.handleSort(idx, prop)}
                            displayedStats={this.state.displayedStats}
                            entryLabels={this.state.displayData.entryLabels} />
                        {renderGraphButton(this, selectedCount, () => this.handleClearSelectedStats())}
                    </div>
                </div>
                <div class='w-100 bl b--white-40'>
                    {this.props.children}
                    <RegionStats
                        data={this.state.displayData}
                        onSelectStat={(entry, statIdx) => this.handleSelectStat(entry, statIdx)}
                        displayedStats={this.state.displayedStats} />
                    {this.showMoreButton()}
                </div>
                <MetricsComparison
                    hidden={!this.state.showingGraph}
                    sourceData={this.sourceData}
                    onClose={() => this.handleHideGraph()} />
            </div>
        );
    }
}

function renderGraphButton(dashboard, selectedCount, onClear) {
    const justSelected = dashboard.justSelectedStat;
    if (justSelected) {
        dashboard.justSelectedStat = false;
    }
    // Anchor to clear all current selections
    function renderClearSelection() {
        return (
            <a onClick={onClear} class='light-blue pointer'>
                Clear selections
            </a>
        );
    }
    return (
        <div class='mt3 pt3 bt b--white-40 pb3'>
            <div class='flex justify-between items-center'>
                <span>{selectedCount} metrics selected:</span>
                {Button({
                    text: 'Graph & compare', // `Graph ${selectedCount} selected`,
                    background: '#137752',
                    className: justSelected ? 'yellow-fade' : '',
                    disabled: selectedCount === 0,
                    onClick: () => dashboard.handleShowGraph(),
                })}
            </div>
            <div class='right'>
                {selectedCount > 0 ? renderClearSelection() : ''}
            </div>
        </div>
    );
}
