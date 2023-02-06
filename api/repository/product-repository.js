const Product = require('../../models').Product;

class ProductRepository {

    async getProduct(id) {
        try {
            const data = await Product.findOne({
                raw: true,
                where: {
                  id: id
                }
            });
            return data;
        } catch (err) {
            return [];
        }
    }

    async createProduct(product) {
        let data = {};
        try {
            data = await Product.create(product);
        } catch(err) {
            data.err = err;
        }
        return data;
    }

    async updateProduct(id, product) {
        let data = {};
        try {
            data = await Product.update(product, {
                raw: true,
                where: {
                  id: id
                },
                returning: true,
                plain: true
              });
        } catch (err) {
            data.err = err;
        }
        console.log(data)
        return data;
    }

    async deleteProduct(id) {
        let data = {};
        try {
            data = await Product.destroy({
                raw: true,
                where: {
                  id: id
                }
            });
        } catch (err) {
            data.err = err;
        }
        return data;
    }
}

module.exports = new ProductRepository();