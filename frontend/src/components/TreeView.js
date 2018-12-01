import React from 'react';
import {PropTypes} from 'prop-types';

export class TreeView extends React.Component {
    render() {
        return <h1>{this.props.id}</h1>
    }
}

TreeView.propTypes = {
    id: PropTypes.string
};