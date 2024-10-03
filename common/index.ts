import z, { number } from 'zod'
export const signupInput=z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

export const signinInput=z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

export const createBlogInput=z.object({
    title: z.string(), 
    content: z.string()
})

export const blogUpdateInput=z.object({
    title:z.string(),
    content:z.string(),
    id:z.number()
})



export type signupInput=z.infer<typeof signupInput>
export type signinInput=z.infer<typeof signinInput>
export type createBlogInput=z.infer<typeof createBlogInput>
export type blogUpdateInput=z.infer<typeof blogUpdateInput>