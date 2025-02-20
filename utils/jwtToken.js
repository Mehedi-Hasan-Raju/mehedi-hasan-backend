
export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();

    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
    })
    .json({
        success: true,
        message,
        token,
        user,
    });
};

// export const login = catchAsyncError(async(req, res, next) => {
//     const {email, password } = req.body;
//     if(!email || !password) {
//         return next(new ErrorHandelar("Email and Password Are Required!"));
//     }
//     const user = await User.findOne({ email }).select("+password");
//     if(!user) {
//         return next(new ErrorHandelar("Invalid Email or Password!"));
//     }
//     const isPasswordMatched = await user.comparePassword(password);
//     if(!isPasswordMatched) {
//         return next(new ErrorHandelar("Invalid Email or Password!"));
//     }
//     generateToken(user, "Logged In", 200, res);
// });