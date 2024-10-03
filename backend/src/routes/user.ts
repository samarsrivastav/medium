import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign,verify } from "hono/jwt";
import { signinInput, signupInput } from "@100xdevs/medium-common"; // this is an npm package that is published...its logic can be seen in common folder

export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL :string
        JWT_SECRET:string
    }
}>()

userRouter.post('/signup', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
    const {success}=signupInput.safeParse(body)
    if(!success){
        return c.json({
            msg:"input structure is wrong"
        })
    }
    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password
            }
        });
        const token = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.text(token)
    } catch (e) {
        return c.status(403);
    }
})

userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
    const {success}=signinInput.safeParse(body)
    if(!success){
        return c.json({
            msg:"input structure is wrong"
        })
    }
    const user = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    })
    if (!user) {
        return c.text("user does'nt exists")
    }
    const token = await sign({ id: user.id }, c.env.JWT_SECRET)

    return c.text(token)
})