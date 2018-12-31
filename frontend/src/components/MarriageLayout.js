import React from 'react';

export class MarriageLayout extends React.Component {
    // Frustrating that I can't inspect the data here for personA and personB
    // so I can't do things like render men on the left and women on the right.
    render() {
        return <div className={"flex-container marriage"}>
            {this.props.children}
        </div>
    }
}
