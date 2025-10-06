
// where this Error came from and what properties it has

class ApiError extends Error { 
    
    constructor(
        statusCode,
        message= 'Something went wrong', 
        // why = not this :
        //  this is not object i think cause i can' use : and i can't even avoid this , after every think i need when someone uses this constructor.
        errors = [],
        stack = '', // stack means error stack. But what is error stack?

    ) {
        // we are Over-riding here:-
        // using super() for Overriding
        super(message)
        this.statusCode = statusCode;
        this.data = null; // why data field is null.the youtube guy says, will discuss in nodejs. what does that means? He says look for this in documents of node.js, i think. no spoon feeding all the time!
        this.message = message;
        this.success = false;
        this.errors = errors;

        // why this condition:-
        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}


export { ApiError }
// how someone will import this?

