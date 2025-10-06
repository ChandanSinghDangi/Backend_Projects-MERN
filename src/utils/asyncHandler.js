
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler } 



// below this is a try-catch code to handle express error:-

// const asyncHandler = (fn) => async(req, res, next) => {
//    try {
//         await fn(req, res, next);

//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }


// asyncHandler(async (req, res, next) => {
//   const users = await User.find();
//   res.json(users);
// });


