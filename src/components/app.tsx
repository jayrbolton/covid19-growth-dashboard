import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {transformData} from '../utils/transform-data';
import {sortByTotalConfirmed, sortByGrowth} from '../utils/sort-data';
import {filterByCountry, filterByProvince} from '../utils/filter-data';
import * as dataSources from '../constants/data-sources.json';
import {RegionStats} from './region-stats';
import {FiltersAndSorts} from './filters-and-sorts';
import {formatUTCDate} from '../utils/formatting';


interface Props {
}

interface State {
    loading: boolean;
    rows?: any;
}

enum Sorts {
    ConfirmedDesc,
    GrowthDesc,
    GrowthAsc
}


export class App extends Component<Props, State> {

    filterCountry: string | null = null;
    filterProvince: string | null = null;
    sortBy: Sorts = Sorts.ConfirmedDesc;
    sourceData: any = null;
    hiddenCount: number = 0;

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        fetchData()
            .then(transformData)
            .then((sourceData) => {
                this.sourceData = sourceData;
                this.applyFiltersAndSorts();
            });
    }

    handleFilterCountry(inp: string) {
        this.filterCountry = inp;
        this.applyFiltersAndSorts();
    }

    handleFilterProvince(inp: string) {
        this.filterProvince = inp;
        this.applyFiltersAndSorts();
    }

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

    applyFiltersAndSorts() {
        if (!this.sourceData) {
            this.setState({rows: [], loading: false});
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

    render() {
        if (this.state.loading) {
            return <p className='white sans-serif pt5 tc'>Loading data...</p>
        }
        return (
            <div className='bg-near-black'>
                <div className='mw8 center pa2 sans-serif white'>
                    <h1 className='light-gray tc f4 f2-m f2-ns'>COVID-19 Worldwide Growth</h1>
                    <p className='f6'>
                        Data is updated daily from the{' '}
                        <a href={dataSources.sourceURL} target='_blank' className='light-blue'>
                            Johns Hopkins University CSSE COVID-10 Data Repository
                        </a>.
                        Last update was {formatUTCDate()} at 12am UTC.{' '}
                        <a href={dataSources.citationsURL} target='_blank' className='light-blue'>
                            Disclaimer and citations
                        </a>.
                    </p>
                    <FiltersAndSorts
                        loading={this.state.loading}
                        onFilterCountry={inp => this.handleFilterCountry(inp)}
                        onFilterProvince={inp => this.handleFilterProvince(inp)}
                        onSort={inp => this.handleSort(inp)}
                    />
                    <RegionStats
                        hiddenCount={this.hiddenCount}
                        rows={this.state.rows}
                        loading={this.state.loading}
                        dates={this.sourceData.dates}
                    />
                </div>
            </div>
        );
    }
}
