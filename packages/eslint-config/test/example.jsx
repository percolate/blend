const React = require('react')

module.exports = React.createClass({

    displayName: 'MyComponent',
    propTypes: {
        name: React.PropTypes.string.isRequired,
    },

    render () {
        return (
            <div className="hello">
                <h1>Hello, {this.props.name}!</h1>
                <div
                    multilineProp
                >
                    <div/>
                </div>
                <div
                    selfClosingMultilineProp
                />
            </div>
        )
    },

})
