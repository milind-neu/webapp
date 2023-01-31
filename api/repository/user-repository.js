const { connect } = require('../config/db.config');

class UserRepository {

    db = {};

    constructor() {
        this.db = connect();
    }

    async createUser(user) {
        let data = {};
        try {
            data = await this.db.users.create(user);
        } catch(err) {
            throw err
        }
        return data;
    }

}

module.exports = new UserRepository();