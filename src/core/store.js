const EventEmitter = require('events');

class Store extends EventEmitter {
    constructor(initialState) {
        super();
        this.state = initialState;
    }

    getState(key) {
        if(key)
            return this.state[key];
        
        return this.state;
    }

    setState(newState) {
        const oldState = Object.assign(this.state);
        this.state = Object.assign({}, this.state, newState);
        this.emit('stateChanged', this.state, oldState);
    }
}

module.exports = Store;