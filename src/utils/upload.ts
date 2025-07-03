import cloudinary from "../config/cloudinary";

export const uploadImages = async (files: File[]) => {
  const uploadPromises = files.map((file) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        // Convert File to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        );

        uploadStream.end(buffer);
      } catch (error) {
        reject(error);
      }
    });
  });

  return Promise.all(uploadPromises);
};
