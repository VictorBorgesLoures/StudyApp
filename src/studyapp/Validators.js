class Validators {

    static validSubject(name) {
        const regex = /^[a-z\u00C0-\u00ff\d,/-]{2,}(\s[a-z\u00C0-\u00ff\d,/-]+)*$/i;

        return regex.test(name) ? true : false;
    }

    static isInt(number) {
        try {
            if(typeof number === 'number') {
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