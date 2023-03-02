const productImageRepository  = require('../repository/product-image-repository');

class ProductImageService {

    constructor() {}

    async uploadImage(image) {
        return await productImageRepository.uploadImage(image);
    }

    async getImagesByProduct(productId) {
        return await productImageRepository.getImagesByProduct(productId);
    }

    async getImageById(id) {
        return await productImageRepository.getImageById(id);
    }

    async deleteImage(id) {
        return await productImageRepository.deleteImage(id);
    }
}

module.exports = new ProductImageService();