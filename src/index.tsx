import 'tachyons/css/tachyons.css';
import {h, render, Component} from 'preact';
import {App} from './components/app';

render(<App />, document.body);

// Enforce a minimum width for the page
// Replace device-width with the minimum when the window gets small
const MIN = 516;
const metaViewport = document.querySelector('meta[name="viewport"]'); 
window.addEventListener('resize', handleResize);

function handleResize () {
    const width = window.outerWidth;
    if (width <= MIN) {
        metaViewport.setAttribute('content', 'width=' + MIN);
    } else if (metaViewport.getAttribute('content') !== 'width=device-width') {
        metaViewport.setAttribute('content', 'width=device-width');
    }
}
handleResize();
