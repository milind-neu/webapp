const productRepository  = require('../repository/product-repository');

class ProductService {

    constructor() {}

    async getProduct(id) {
        return await productRepository.getProduct(id);
    }

    async createProduct(product) {
        return await productRepository.createProduct(product);
    }

    async updateProduct(id, product) {
        return await productRepository.updateProduct(id, product);
    }

    async deleteProduct(id) {
        return await productRepository.deleteProduct(id);
    }
}

module.exports = new ProductService();