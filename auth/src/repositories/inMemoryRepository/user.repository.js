const IBaseRepository = require("../IBaseRepository");

module.exports = class UserRepository extends IBaseRepository {
    constructor() {
        super();
        this.users = [
            { id: 1, username: "admin", password: "admin", role:"ADMINISTRADOR" },
            { id: 2, username: "user", password: "user", role:"USUARIO" }

        ];
    }

    getAll() {
        return this.users;
    }

    get(id) {
        return this.users.find((user) => user.id === id);
    }

    add(user) {
        this.users.push(user);
    }

    update(id, updatedUser) {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            return null;
        }
        this.users[userIndex] = { ...this.users[userIndex], ...updatedUser };
        return this.users[userIndex];
    }

    delete(id) {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            return false;
        }
        this.users.splice(userIndex, 1);
        return true;
    }

    validUserPassword(username, password) {
        return this.users.find((u) => u.username === username && u.password === password);
    }
};
