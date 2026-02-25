module.exports = {
    successResponse: (res, data, message = "Operation successful") => {
        return res.status(200).json({
            success: true,
            message,
            data,
        });
    },

    errorResponse: (res, error, message = "Operation failed") => {
        return res.status(400).json({
            success: false,
            message,
            error,
        });
    },

    notFoundResponse: (res, message = "Resource not found") => {
        return res.status(404).json({
            success: false,
            message,
        });
    },

    serverErrorResponse: (res, message = "Internal server error") => {
        return res.status(500).json({
            success: false,
            message,
        });
    },
};