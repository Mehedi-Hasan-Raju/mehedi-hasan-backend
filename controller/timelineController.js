import { catchAsyncError } from "../middleware/catchAsyncError.js";
import {Timeline} from "../models/timelineSchema.js";
import ErrorHandelar from "../middleware/error.js";


export const postTimeline=catchAsyncError(async(req, res, next) =>{
    const { title, description, from, to } = req.body;
    const newTimeline = await Timeline.create({
        title,
        description,
        timeline: { from, to },
    });
    res.status(200).json ({
        success: true,
        message: "Timeline Added",
        newTimeline,
    })
});
export const deleteTimeline=catchAsyncError(async(req, res, next) =>{
    const {id} = req.params;
    const timeline = await Timeline.findById(id);
    if(!timeline) {
        return next(new ErrorHandelar("Timeline not found", 404));
    }
    await timeline.deleteOne();
    res.status(200).json ({
        success: true,
        message: "Timeline Deleted",
        
    })
})
export const getAllTimelines=catchAsyncError(async(req, res, next) =>{
    const timelines = await Timeline.find();
  res.status(200).json({
    success: true,
    timelines,
  });
});

