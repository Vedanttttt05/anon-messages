import {Z} from     'zod';

export const usernameValidation = Z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" });


export const signUpSchema = Z.object({
    username : usernameValidation,
    email : Z.string().email({ message: "Invalid email address" }),
    password : Z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must be at most 100 characters long" })
})