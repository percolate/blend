var React = require('react')

module.exports = React.createClass({

    displayName: 'MyComponent',
    propTypes: {
        name: React.PropTypes.string.isRequired,
    },

    render: function () {
        return (
            <div className="hello">
                <h1>Hello, {this.props.name}!</h1>
            </div>
        )
    },

})
