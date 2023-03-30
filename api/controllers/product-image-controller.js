const multer = require("multer");
const path = require("path");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const productController  = require('../controllers/product-controller.js');
const productImageService  = require('../services/product-image-service.js');

const s3 = require('./s3-config').s3;
const statsd_config = require('../../statsd_config');
const logError = require('../../log_error')

const storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
    // upload only png, jpg, or jpeg format
    return cb(new Error("Please upload an Image!"));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const uploadToS3 = async (key, buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: process.env.S3_BUCKET_NAME,
        ContentType: mimetype,
        Key: key,
        Body: buffer,
      },
      () => resolve()
    );
  });
};

const deleteS3Object = async (bucket, key) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: bucket,
      Key: key
    }, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data);
        resolve();
      }
    })
  })
}

const getSignedURL = (bucket, key, expires = 3600) => {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl(
      "getObject",
      {
        Bucket: bucket,
        Key: key,
        Expires: expires,
      },
      (err, url) => {
        if (err) {
          reject(err);
        } else {
          console.log(url);
          resolve(url);
        }
      }
    );
  });
};

const setErrorResponse = (error, response) => {
    logger.error(`500: ${error}`);
    response.status(500);
    response.json(error);
    return response
};

const setSuccessResponse = (obj, response) => {
  response.status(201);
  response.json(obj);
  return response
};

const uploadImage = async (request, response) => {
  statsd_config.statsd.increment('api.image.http.post.count');
  try {
    const result = await productController.getProductByUser(
      request,
      response
    );
    if (!result.product) {
      return result;
    } else {
      if (!("file" in request.body) || !request.file) {
        return logError.setAndLogError(400, "Bad request", response)
        // return response.status(400).json({
        //   message: "Bad Request",
        // });
      }

      const imageId = uuidv4();
      await uploadToS3(`Product ${result.product.id}/${imageId}`, request.file.buffer, request.file.mimetype);
      const s3_image_url = await getSignedURL(process.env.S3_BUCKET_NAME, `Product ${result.product.id}/${imageId}`);
      const payload = {
        file_name: request.body.file,
        image_id: imageId,
        product_id: result.product.id,
        s3_bucket_path: s3_image_url,
      };
      const data = await productImageService.uploadImage(payload);
      logger.info(`201: Image uploaded successfully for product with productId: ${result.product.id} having imageId: ${imageId}`);
      return setSuccessResponse(data, response);
    }
  } catch (error) {
    return {data: setErrorResponse(error, response)};
  }
};

const getImagesList = async (request, response) => {
  statsd_config.statsd.increment('api.imageList.http.get.count');
  try {
    const result = await productController.getProductByUser(
      request,
      response
    );

    if (!result.product) {
      return result;
    } else {
      const data = await productImageService
        .getImagesByProduct(result.product.id)
        .then((res) => {
          return res.map((image) => {
            return {
              image_id: image.dataValues.image_id,
              product_id: image.dataValues.product_id,
              file_name: image.dataValues.file_name,
              date_created: image.dataValues.date_created,
              s3_bucket_path: image.dataValues.s3_bucket_path,
            };
          });
        });
      logger.info(`200: Images retrieved successfully for product with productId: ${image.dataValues.product_id} having imageId: ${image.dataValues.image_id}`);
      return response.status(200).send(data);
    }
  } catch (error) {
    return {data: setErrorResponse(error, response)};
  }
};

const getImage = async (request, response) => {
  statsd_config.statsd.increment('api.image.http.get.count');
  const productId = request.params.id;
  const imageId = request.params.imageId;

  if (!productId || !imageId) {
    return logError.setAndLogError(400, "Bad request", response)
    // return response.status(400).send({
    //   message: "Bad Request"
    // });
  } else {
    try {
      const result = await productController.getProductByUser(
        request,
        response
      );
      if (!result.product) {
        return result;
      } else {
        const image = await productImageService.getImageById(imageId, productId);
        if (!image) {
          return logError.setAndLogError(404, "Image not found", response)
          // return response.status(404).send({
          //   message: "Image not found!"
          // });
        } else {
          logger.info(`200: Image retrieved successfully with imageId: ${image.image_id}`);
          return response.status(200).send({
              image_id: image.image_id,
              product_id: image.product_id,
              file_name: image.file_name,
              date_created: image.date_created,
              s3_bucket_path: image.s3_bucket_path
          });
        }
      }
    } catch (error) {
        return {data: setErrorResponse(error, response)};
    }
  }
}

const deleteImage = async (request, response) => {
  statsd_config.statsd.increment('api.image.http.delete.count');
  const productId = request.params.id;
  const imageId = request.params.imageId;

  if (!productId || !imageId) {
    return logError.setAndLogError(400, "Bad request", response)
    // return response.status(400).send({
    //   message: "Bad Request"
    // });
  } else {
    try {
      const result = await productController.getProductByUser(
        request,
        response
      );
      if (!result.product) {
        return result;
      } else {
        const image = await productImageService.getImageById(imageId, productId);
        if (!image) {
          return logError.setAndLogError(404, "Image not found", response)
          // return response.status(404).send({
          //   message: "Image not found!"
          // });
        } else {
          await deleteS3Object(process.env.S3_BUCKET_NAME, `Product ${result.product.id}/${image.image_id}`);
          const res = await productImageService.deleteImage(imageId);
          logger.info(`204: Image deleted successfully with imageId: ${image.image_id}`);
          return response.status(204).send();
        }
      }
    } catch (error) {
        return {data: setErrorResponse(error, response)};
    }
  }
}

module.exports = {
    upload,
    uploadImage,
    getImagesList,
    getImage,
    deleteImage
}