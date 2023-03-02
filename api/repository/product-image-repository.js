const Image = require('../../models').Image;

class ProductImageRepository {

    async uploadImage(image) {
        console.log(image)
        let data = {};
        try {
            data = await Image.create(image);
        
            return {
              image_id: data.id,
              file_name: data.file_name,
              date_created: data.date_created,
              product_id: data.product_id,
              s3_bucket_path: data.s3_bucket_path,
            };
          } catch (err) {
            console.log(err)
            data.err = err;
            return data;
            
          }
          
    }

    async getImagesByProduct(productId) {
      
        let data = {};
        try {
          data = await Image.findAll({
            where: {
              product_id: productId,
            },
          });
        } catch (err) {
          console.log(err);
          data.err = err;
        }
        return data;
    };

    async getImageById(id) {
        let data = {};
        try {
            data = await Image.findOne({
            raw: true,
            where: {
                id: id,
            },
            });
        } catch (err) {
            console.log(err);
            data.err = err;
        }
        return data;
    }

    async deleteImage(id) {
        let data = {};
        try {
            data = await Image.destroy({
            where: {
                id: id
            },
            });
            
        } catch (err) {
            console.log(err);
            data.err = err;
        }
        return data;
    }
}

module.exports = new ProductImageRepository();