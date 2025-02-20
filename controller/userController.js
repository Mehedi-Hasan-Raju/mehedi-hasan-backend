import {catchAsyncError} from "../middleware/catchAsyncError.js";
import ErrorHandelar from "../middleware/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from"cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmails } from "../utils/sendEmails.js";
import crypto from "crypto";





export const register = catchAsyncError(async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandelar("Avater and Resume Are Required!",400));
    }
    const { avatar, resume } = req.files;
    
    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {folder: "AVATARS"}
    );
    if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForAvatar.error || "Unknown Cloudinary Error"
        );
    }
    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {folder: "MY_RESUME"}
    );
    if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForResume.error || "Unknown Cloudinary Error"
        );
    }

const {
    fullName,
    email,
    Phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    linkedinURL,
    facebookURL,
    twiterURL,
    instagramURL,} = req.body;

    const user = await User.create({
    fullName,
    email,
    Phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    linkedinURL,
    facebookURL,
    twiterURL,
    instagramURL,
    avatar: {
        public_id: cloudinaryResponseForAvatar.public_id,
        url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
        public_id: cloudinaryResponseForResume.public_id,
        url: cloudinaryResponseForResume.secure_url,
    },
    });
    generateToken(user,"User Registered", 200,res);


});

export const login = catchAsyncError(async(req, res, next) => {
    const {email, password } = req.body;
    if(!email || !password) {
        return next(new ErrorHandelar("Email and Password Are Required!"));
    }
    const user = await User.findOne({ email }).select("+password");
    if(!user) {
        return next(new ErrorHandelar("Invalid Email or Password!"));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched) {
        return next(new ErrorHandelar("Invalid Email or Password!"));
    }
    generateToken(user, "Logged In", 200, res);
});

export const logout = catchAsyncError(async(req, res, next) =>{
    res.status(200)
    .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    .json({
        success: true,
        message: "Logged Out",
    });
});
export const getUser = catchAsyncError(async(req, res, next) =>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      aboutMe: req.body.aboutMe,
      portfolioURL: req.body.portfolioURL,
      githubURL: req.body.githubURL,
      linkedInURL: req.body.linkedInURL,
      facebookURL: req.body.facebookURL,
      twitterURL: req.body.twitterURL,
      instagramURL: req.body.instagramURL,
    };
    if (req.files && req.files.avatar) {
      const avatar = req.files.avatar;
      const user = await User.findById(req.user.id);
      const profileImageId = user.avatar.public_id;
      await cloudinary.uploader.destroy(profileImageId);
      const newProfileImage = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "AVATARS",
        }
      );
      newUserData.avatar = {
        public_id: newProfileImage.public_id,
        url: newProfileImage.secure_url,
      };
    }
  
    if (req.files && req.files.resume) {
      const resume = req.files.resume;
      const user = await User.findById(req.user.id);
      const resumeFileId = user.resume.public_id;
      if (resumeFileId) {
        await cloudinary.uploader.destroy(resumeFileId);
      }
      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "MY_RESUME",
      });
      newUserData.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });
      res.status(200).json({
        success: true,
        message: "Profile Updated!",
        user,
    });
});    

export const updatePassword = catchAsyncError(async(req,res,next) => {
  const {currentPassword, newPassword, confirmNewPassword } = req.body;
  if(!currentPassword || !newPassword || !confirmNewPassword ) {
    return next( new ErrorHandelar("Please Fill All Files", 400));
  }
  const user = await User.findById(req.user.id).select("+password")
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandelar("Incorrect Current Password!"));
  }
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandelar("New Password And Confirm New Password Do Not Match!")
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Updated!",
  }); 
});

export const getUserForPortfolio = catchAsyncError(async (req, res, next) => {
  const id = "67a24e2c6d62f8c82dacfdbd";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

//forget pass
export const forgetPassword = catchAsyncError(async(req, res, next) =>{
  const user = await User.findOne({ email: req.body.email});
  if(!user) {
    return next(new ErrorHandelar("User not found!", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
  You've not requested this email then, please ignore it.`;

  try {
    await sendEmails({
      email: user.email,
      subject: `Personal Portfolio Dashboard Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandelar(error.message, 500));
  }
});

//reset pass

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandelar(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandelar("Password & Confirm Password do not match"));
  }
  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Reset Password Successfully!", 200, res);
});