import React from 'react';

export default class SideBySide extends React.Component {
    render() {
        return <div className="flex-container">
            {this.props.children}
        </div>
    }
}