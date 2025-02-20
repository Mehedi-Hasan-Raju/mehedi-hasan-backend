import { catchAsyncError } from "../middleware/catchAsyncError.js";
import  ErrorHandelar  from "../middleware/error.js"
import { SoftwareApplication } from "../models/softwareApplicationSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewApplication = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(
        new ErrorHandelar("Software Application Icon/Image Required!", 400)
      );
    }
    const { svg } = req.files;
    const { name } = req.body;
    if (!name) {
      return next(new ErrorHandelar("Please Provide Software's Name!", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      svg.tempFilePath,
      { folder: "PORTFOLIO SOFTWARE APPLICATION IMAGES" }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(new ErrorHandelar("Failed to upload avatar to Cloudinary", 500));
    }
    const softwareApplication = await SoftwareApplication.create({
      name,
      svg: {
        public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
        url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
      },
    });
    res.status(200).json({
      success: true,
      message: "New Software Application Added!",
      softwareApplication,
    });
});
export const deleteApplication = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let softwareApplication = await SoftwareApplication.findById(id);
    if (!softwareApplication) {
      return next(new ErrorHandelar("Already Deleted!", 404));
    }
    const softwareApplicationSvgId = softwareApplication.svg.public_id;
    await cloudinary.uploader.destroy(softwareApplicationSvgId);
    await softwareApplication.deleteOne();
    res.status(200).json({
      success: true,
      message: "Software Application Deleted!",
    });
  });
  
export const getAllApplications = catchAsyncError(async (req, res, next) => {
    const softwareApplications = await SoftwareApplication.find();
    res.status(200).json({
      success: true,
      softwareApplications,
    });
  });