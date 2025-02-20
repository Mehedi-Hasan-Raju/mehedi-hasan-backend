import { catchAsyncError } from "../middleware/catchAsyncError.js";
import  ErrorHandelar  from "../middleware/error.js"
import { Skill } from "../models/skillSchema.js";
import { v2 as cloudinary } from "cloudinary";



export const addNewSkill = catchAsyncError(async(req, res, next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(
          new ErrorHandelar("Skill Image Required!", 400)
        );
      }
      const { svg } = req.files;
      const { title, proficiency } = req.body;
      if(!title || !proficiency) {
        return next(new ErrorHandelar("please fill full form!", 400))
      }
      
      const cloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        { folder: "PORTFOLIO_SKILL" }
      );
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
          "Cloudinary Error:",
          cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(new ErrorHandelar("Failed to upload avatar to Cloudinary", 500));
      }
      const skill = await Skill.create({
        title,
        proficiency,
        svg: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
      });
      res.status(200).json({
        success: true,
        message: "New Skill Added",
        skill,
      });
});
export const deleteSkill = catchAsyncError(async(req, res, next)=>{
    const { id } = req.params;
  let skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandelar("Already Deleted!", 404));
  }
  const skillSvgId = skill.svg.public_id;
  await cloudinary.uploader.destroy(skillSvgId);
  await skill.deleteOne();
  res.status(200).json({
    success: true,
    message: "Skill Deleted!",
  });
})
export const updateSkill = catchAsyncError(async(req, res, next)=>{
    const { id } = req.params;
    let skill = await Skill.findById(id);
    if (!skill) {
      return next(new ErrorHandelar("Skill not found!", 404));
    }
    const { proficiency } = req.body;
    skill = await Skill.findByIdAndUpdate(
      id,
      { proficiency },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      success: true,
      message: "Skill Updated!",
      skill,
    });
});
export const getAllSkill = catchAsyncError(async(req, res, next)=>{
    const skills = await Skill.find();
  res.status(200).json({
    success: true,
    skills,
  });
})