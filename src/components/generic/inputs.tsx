import {h} from 'preact';

export function SearchInput(props) {
    return (
        <input
            className='bg-black input-reset outline-0 white ph2 pv1 w5 ba b--white-50'
            type='text'
            placeholder={props.labelText}
            onInput={props.onInput}
        />
    );
}
