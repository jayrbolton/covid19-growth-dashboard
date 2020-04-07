import {h, Component, Fragment} from 'preact';


interface Props {
    currentPage: Page;
    onClickNavItem: (Page) => void;
}

interface State {
}

export type Page = "about" | "world-data" | "us-states" | "us-counties";

export class Nav extends Component<Props, State> {

    handleClickNavItem(page: Page) {
        this.props.onClickNavItem(page);
    }

    navItem(text, pageName) {
        const isCurrent = pageName === this.props.currentPage;
        let linkClass = 'dib link pb1 ';
        if (isCurrent) {
            linkClass += 'b white bb b--white-30';
        } else {
            linkClass += 'lightest-blue pointer dim';
        }
        return (
            <li className='pr3 pr3-m pr4-ns'>
                <a
                    onClick={() => this.handleClickNavItem(pageName)}
                    className={linkClass}
                >
                    {text}
                </a>
            </li>
        );
    }

    render() {
        return (
            <div className='bg-dark-gray white w-100 sans-serif'>
                <div className='flex justify-between container mw8 ph2 ph2-m ph4-ns pt2 pb1 items-center' style={{height: '3rem'}}>
                    <ul className='list pa0 ma0 flex items-center'>
                        {this.navItem('US States', 'us-states')}
                        {this.navItem('US Counties', 'us-counties')}
                        {this.navItem('Worldwide', 'world-data')}
                        {this.navItem('About this site', 'about')}
                    </ul>
                </div>
            </div>
        );
    }
}

