import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    Phone: {
        type: String,
        required: [true, "Phone Number is required"],
    },
    aboutMe: {
        type: String,
        required: [true, "About Me Field is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password Must Contain at lest 8 Characters!"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    resume: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    portfolioURL: String,
    githubURL: String,
    linkedinURL: String,
    facebookURL: String,
    twiterURL: String,
    instagramURL: String,
    resetPasswordToken : String,
    resetPasswordExpire: Date,
});

// FOR HASHING PASSWORD
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});


//FOR COMPARING PASSWARD WITH HASH PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//GENERATING JSON WEB TOKEN
userSchema.methods.generateJsonWebToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto 
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
return resetToken;

};
export const User = mongoose.model("User", userSchema)