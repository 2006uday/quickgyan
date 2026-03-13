declare global {
    namespace Express {
        interface Request {
            user?: string | import("jsonwebtoken").JwtPayload;
            id?: any;
        }
    }
}

    export { };
