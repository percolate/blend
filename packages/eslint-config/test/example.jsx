import React from 'react'

export default React.createClass({

    displayName: 'MyComponent',
    propTypes: {
        name: React.PropTypes.string.isRequired,
    },

    render () {
        return (
            <div className="hello">
                <h1>Hello, {this.props.name}!</h1>
            </div>
        )
    },

})
