import {h, Component} from 'preact';

export function Button({text, disabled, onClick, background}) {
    if (disabled) {
        return (
            <a className='dib pa2 br2 b bg-dark-gray gray f6'>{text}</a>
        );
    }
    return (
        <a className='dib pa2 br2 b f6 pointer grow' style={{background}} onClick={onClick}>
            {text}
        </a>
    );
}
