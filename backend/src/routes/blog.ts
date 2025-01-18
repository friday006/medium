import {Hono} from 'hono'
import {PrismaClient} from '@prisma/client/edge'
import {withAccelerate} from '@prisma/extension-accelerate'
import {verify} from 'hono/jwt'
import {createBlogInput, updateBlogInput} from '@priyankarxdevs/medium-common'

export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
        JWT_SECRET: string
	}, 
    Variables:{
      userId: string
    }
}>();

//middleware
blogRouter.use('/*',async (c, next)=>{
  //get the header
  //verify the header
  //if header is correct, we can proceed
  //if not, we return the user a 403 status code

  const header = c.req.header("authorization") || "" // Bearer token
  const token = header.split(" ")[1]
try{
    const user = await verify(token, c.env.JWT_SECRET)
  if(user){
    // @ts-ignore
    c.set('userId', user.id);
    await next();
  }
  else{
    c.status(403)
    return c.json({error: "You are not logged in"})
  }
}
catch(e){
    c.status(403)
    return c.json({
        messagee: "You are not logged in"
    })
}
  
})


blogRouter.post('/',async (c) => {
    const body = await c.req.json();
    //zod validation
        const success = createBlogInput.safeParse(body);
    
        if(!success){
          c.status(411)
          return c.json({
            message: "Inputs not correct"
          })
        }
    const authorId = c.get("userId");

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: authorId
        }
    })

    return c.json({
        id: blog.id
    })
  })
  
//update the post
blogRouter.put('/',async(c) => {
    const userId = c.get('userId')
   
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
    
     //zod validation
     const success = updateBlogInput.safeParse(body);

     if(!success){
       c.status(411)
       return c.json({
         message: "Inputs not correct"
       })
     }
    const post = await prisma.post.update({
        where:{
            id: body.id,
            authorId: userId
        },
        data:{
            title: body.title,
            content: body.content
        }
    })

    return c.json({
        id: post.id
    })
  })

// to get all post
blogRouter.get('/bulk', async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const posts = await prisma.post.findMany();

    return c.json({
        posts
    })
})


// get the post
blogRouter.get('/:id', async (c) => {
    const id = await c.req.param("id");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const post = await prisma.post.findFirst({
            where:{
                id: id
            }
        })

        return c.json({
            post
        })
    }catch(e){
        c.status(411)
        return c.json({
            message:"Error while fetching post"
        })
    }
  })

