const userRepository  = require('../repository/user-repository');

class UserService {

    constructor() {}

    async getUser(id) {
        return await userRepository.getUser(id);
    }

    async createUser(user) {
        return await userRepository.createUser(user);
    }

    async updateUser(id, user) {
        return await userRepository.updateUser(id, user);
    }

}

module.exports = new UserService();