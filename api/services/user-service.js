const userRepository  = require('../repository/user-repository');

class UserService {

    constructor() {}

    async createUser(user) {
        return await userRepository.createUser(user);
    }

}

module.exports = new UserService();