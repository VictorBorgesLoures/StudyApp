class Validators {

    static validUsername(username) {
        const regex = /^[a-zA-Z0-9]+$/i;

        return regex.test(username) ? true : false;
    }

    static validPassword(password) {
        const regex = /^(\w+\d?)+$/i;

        return regex.test(password) ? true : false;
    }

    static validEmail(email) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return regex.test(email) ? true : false;
    }

    static validCookie(cookie) {
        let regex = /^\$2[ayb]\$.{56}$/;

        return regex.test(cookie) ? true : false;
    }

    static isInt(number) {
        try {
            if (typeof number === 'number') {
                return true;
            } else {
                parseInt(number);
                return true;
            }
        } catch (error) {
            return false;
        }
    }

}

module.exports = Validators;