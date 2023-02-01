const User = require('../../models').User;

class UserRepository {

    async getUser(id) {
        try {
            const data = await User.findOne({
                raw: true,
                where: {
                  id: id
                }
            });
            return data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async createUser(user) {
        let data = {};
        try {
            data = await User.create(user);
        } catch(err) {
            data.err = err;
        }
        return data;
    }

    async updateUser(id, user) {
        try {

            const data = await User.update(user, {
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