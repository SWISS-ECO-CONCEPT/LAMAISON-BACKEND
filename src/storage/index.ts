// import path from "path";
// import { v2 as cloudinary } from "cloudinary";

// Config Cloudinary (clé, secret dans .env)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const USE_CLOUD = process.env.USE_CLOUD_STORAGE === "true";

// Sauvegarde locale
const saveLocalFile = (file: Express.Multer.File) => {
  return `/uploads/${file.filename}`;
};

// Sauvegarde Cloudinary
// const saveCloudFile = async (file: Express.Multer.File) => {
//   const result = await cloudinary.uploader.upload(file.path, {
//     folder: "lamaison",
//   });
//   return result.secure_url;
// };

// Fonction unifiée
export const saveFile = async (file: Express.Multer.File) => {
  // if (USE_CLOUD) {
  //   return await saveCloudFile(file);
  // } else {
    return saveLocalFile(file);
  }

