module.exports = class IBaseRepository {
    getAll() {
        throw new Error("Implementar médoto");
    }

    get(id) {
        throw new Error("Implementar médoto");
    }

    add(user) {
        throw new Error("Implementar médoto");
    }

    update(id, updatedUser) {
        throw new Error("Implementar médoto");
    }

    delete(id) {
        throw new Error("Implementar médoto");
    }

    validUserPassword(username, password) {
        throw new Error("Implementar médoto");
    }
};
