bcrypt = require('bcrypt');
let minute = 60*1000;
let hour = 60*minute;
let day = 24*hour;

class Generators {

    static generateToken(token) {
        var saltRounds = Math.floor(Math.random()*10);
        var salt = bcrypt.genSaltSync(saltRounds);
        return bcrypt.hash(token, salt);
    }

    static expireGeneratorByMin(minutes) {
        return new Date(new Date().getTime() + (minutes*minute));
    }
    
    static expireGeneratorByHours(hours) {
        return new Date(new Date().getTime() + (hours*hour));
    }
    
    static expireGeneratorByDays(days) {
        return new Date(new Date().getTime() + (days*day));
    }

}

module.exports = Generators;