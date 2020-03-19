import {h, Component, Fragment} from 'preact';
import {fetchData} from '../utils/fetch-data';
import {normalizeData} from '../utils/normalize-data';
import {sortByTotalConfirmed} from '../utils/sort-data';
import {filterRows} from '../utils/filter-data';

import {RegionStats} from './region-stats';
import {FiltersAndSorts} from './filters-and-sorts';


interface Props {
}

interface State {
    loading: boolean;
    rows?: any;
}

enum Sorts {
    ConfirmedDesc,
}


export class App extends Component<Props, State> {

    filter: string | null = null;
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
            .then(normalizeData)
            .then((sourceData) => {
                this.sourceData = sourceData;
                this.applyFiltersAndSorts();
            });
    }

    handleFilter(inp: string) {
        this.filter = inp;
        this.applyFiltersAndSorts();
    }

    applyFiltersAndSorts() {
        if (!this.sourceData) {
            this.setState({rows: [], loading: false});
            return;
        }
        const rows = this.sourceData.rows.slice(0);
        if (this.sortBy === Sorts.ConfirmedDesc) {
            sortByTotalConfirmed(rows);
        }
        this.hiddenCount = filterRows(rows, this.filter || '');
        this.setState({rows, loading: false});
    }

    render() {
        if (this.state.loading) {
            return <p>Loading data..</p>
        }
        return (
            <div className='bg-near-black'>
                <div className='mw8 center pa2 sans-serif white'>
                    <h1 className='light-gray tc f4 f2-m f2-ns'>COVID-19 Worldwide Growth Dashboard</h1>
                    <FiltersAndSorts loading={this.state.loading} onFilter={inp => this.handleFilter(inp)} />
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
