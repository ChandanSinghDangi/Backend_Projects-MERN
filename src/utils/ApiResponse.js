
class ApiResponse {

    constructor(statusCode, data, message='Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400
    }
}

// why are we creating this classes in backend.Like:-
// ApiError
// ApiResponse


export { ApiResponse }

// different ways to export this and then import?

