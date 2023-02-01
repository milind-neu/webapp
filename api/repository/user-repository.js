const { connect } = require('../config/db.config');

class UserRepository {

    db = {};

    constructor() {
        this.db = connect();
    }

    async getUser(id) {
        try {
            const user = await this.db.users.findOne({
                raw: true,
                where: {
                  id: id
                }
            });
            return user;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async createUser(user) {
        let data = {};
        try {
            data = await this.db.users.create(user);
        } catch(err) {
            data.err = err;
        }
        return data;
    }

    async updateUser(id, user) {
        try {

            const data = await this.db.users.update(user, {
                raw: true,
                where: {
                  id: id
                },
                returning: true,
                plain: true
              });
            return data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

}

module.exports = new UserRepository();