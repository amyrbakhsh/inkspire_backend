const axios = require("axios");
const fs = require("fs");

const IMGUR_CLIENT_ID = "c2a2ba1be2a32af"; 

const uploadImageToImgur = async (buffer) => {
  try {
    const imageBase64 = buffer.toString('base64');
    
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      { image: imageBase64 },
      {
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID || IMGUR_CLIENT_ID}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.data.error || "Imgur upload failed");
    }

    return response.data.data.link; // Returns Imgur image URL
  } catch (error) {
    console.error("Error uploading to Imgur:", error);
    throw new Error("Image upload failed: " + error.message);
  }
};

module.exports = uploadImageToImgur;
