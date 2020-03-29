import 'tachyons/css/tachyons.css';
import {h, render, Component} from 'preact';
import {App} from './components/app';

render(<App />, document.body);

// Minimum width for the page is 500px
// Replace device-width with 500 when the window gets small
const metaViewport = document.querySelector('meta[name="viewport"]'); 
window.addEventListener('resize', handleResize);

function handleResize () {
    const width = window.outerWidth;
    console.log(width);
    if (width <= 500) {
        metaViewport.setAttribute('content', 'width=500');
    } else if (metaViewport.getAttribute('content') !== 'width=device-width') {
        metaViewport.setAttribute('content', 'width=device-width');
    }
}
handleResize();
