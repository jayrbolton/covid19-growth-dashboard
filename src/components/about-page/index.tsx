import {h, Component, Fragment} from 'preact';

interface Props {};
interface State {};

const GITHUB_URL = 'https://github.com/jayrbolton/covid19-growth-dashboard';
const CONTRIBUTORS_URL = 'https://github.com/jayrbolton/covid19-growth-dashboard/graphs/contributors';
const EMAIL_ADDR = 'feedback.and.bug.reports+covid19dashboard@gmail.com';

export class AboutPage extends Component<Props, State> {

    render() {
        return (
            <div className='mw7 ph4'>
                <p>This website was created by {extLink('https://www.jayrbolton.com', 'Jay R Bolton')} and maintained by volunteers.
                </p>

                <p>
                    Additional contributors:
                    <ul>
                        <li>Bill Riehl</li>
                        <li>{extLink("https://de.linkedin.com/in/henrieke-baunack", "Henrieke Baunack")}</li>
                        <li>Omree Gal-Oz</li>
                        <li>Annette Greiner</lito>
                        <li>Dylan Chivian</li>
                    </ul>
                </p>

                <p className='b'>
                    {extLink(CONTRIBUTORS_URL, 'View the code contributions for this project')}.
                </p>

                <p>
                    This website is open source (MIT-licensed), and its source code can be found{' '}
                    {extLink(GITHUB_URL, 'in its Github repository')}.
                </p>

                <p>
                    If you see a bug, have feedback, or have a feature request, either:
                    <ul>
                        <li>Email {extLink('mailto:' + EMAIL_ADDR, EMAIL_ADDR)}</li>
                        <li>Open an issue in {extLink(GITHUB_URL, 'our Github repository')}</li>
                    </ul>
                </p>

                <p>
                    Acknowledgments:
                    <ul>
                        <li>{extLink('https://covidtracking.com/', 'The COVID Tracking Project')} for US state testing data</li>
                        <li>{extLink('https://nytimes.com/', 'The New York Times')} for county-level US data</li>
                        <li>{extLink('https://coronavirus.jhu.edu/map.html', 'Johns Hopkins University')} for worldwide data</li>
                        <li>{extLink('https://github.com', 'Github')} for hosting</li>
                    </ul>
                </p>
            </div>
        );
    }
}

function extLink(href, text) {
    return (
        <a target='_blank' className='light-blue pointer' href={href}>
            {text}
        </a>
    );
}
