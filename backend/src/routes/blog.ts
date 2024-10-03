import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";

export const blogRouter=new Hono<{
    Bindings:{
        JWT_SECRET:string
        DATABASE_URL:string
    },
    Variables: {
        userId: string;
    }
}>();
 

//middlewares for blogs
blogRouter.use('/*', async (c, next) => {
    try {
        const bearer = c.req.header('Authorization') || "";
        const token = bearer.split(" ")[1];
    
        if (!token) {
          c.status(403);
          return c.json({ msg: "No token provided" });
        }
    
        const response = await verify(token, c.env.JWT_SECRET);
    
        if (!response) {
          c.status(403);
          return c.json({ msg: "Invalid token" });
        }
        //@ts-ignore
        c.set('userId', response.id);
        await next();
      } catch (error) {
        c.status(403);
        return c.json({ msg: "You are not authorized" });
      }
});

//blogs 

blogRouter.get('/bulk',async (c) => {
	const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const res=await prisma.post.findMany()
	return c.json({response:res})
})

blogRouter.get('/:id',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const param= c.req.param('id');

    const res=await prisma.post.findFirst({
        where:{
            id:param
        }
    })
	return c.json({response:res})
})

blogRouter.post('/',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const userId=c.get("userId")
    const body=await c.req.json()
    const {success}=createBlogInput.safeParse(body)
    if(!success){
        return c.json({
            msg:"body structure is wrong"
        })
    }
    const res=await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:userId
        }
    })
    return c.text('posted!'+res.id)

})

blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();
    const {success}=updateBlogInput.safeParse(body)
    if(!success){
        return c.json({
            msg:"body structure is wrong"
        })
    }
    const res=await prisma.post.update({
        where:{
            id:body.id
        },
        data:{
            title:body.title,
            content:body.content
        }
    })
	return c.text('updated')
})