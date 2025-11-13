// src/infra/http/error-handler.ts

export const createErrorHandler = () => {
    return (ctx: any) => {
        const { error, code, set } = ctx;

        console.error("Unhandled error:", error);

        if (code === "VALIDATION") {
            set.status = 400;

            return {
                error: "validation_error",
                message: error instanceof Error ? error.message : String(error)
            };
        }

        if (code === "NOT_FOUND") {
            set.status = 404;

            return {
                error: "not_found"
            };
        }

        set.status = 500;

        return {
            error: "internal_error"
        };
    };
};