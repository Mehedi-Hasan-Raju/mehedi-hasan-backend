import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandelar from "../middleware/error.js";
import { Message } from "../models/messageSchema.js";

export const sendMessage = catchAsyncError(async(req, res, next) => {
    const {senderName, subject, message} = req.body
    if (!senderName || !subject || !message) {
        return next(new ErrorHandelar("please Fill Full Form", 400));
    }
     const data = await Message.create({senderName, subject, message});
     res.status(200).json({
        success: true,
        message: "Message Sent",
        data,
     });

});

export const getAllMessage = catchAsyncError(async(req,res,next) => {
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages,
    })
});

export const deleteMessage = catchAsyncError(async(req,res,next) => {
    const { id } =req.params;
    const message = await Message.findById(id);
    if(!message) {
        return next(new ErrorHandelar("Message Already Deleted!", 400))
    }
    await message.deleteOne();
    res.status(200).json({
        success: true,
        message: "Message Delated",
    })
});