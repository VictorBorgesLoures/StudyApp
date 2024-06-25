let isOn = process.env.NODE_ENV == 'development' ? true : false;

class Debugger {
    constructor(isOn) {
        this.isOn = isOn;
    }

    message(message) {
        if (this.isOn) {
            console.log(message);
        }
    }

    cut() {
        if (this.isOn) {
            console.log("------------------------------------");
        }
    }
}

let debug = new Debugger(isOn);

module.exports = debug;