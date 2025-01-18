import {BlogCard} from '../components/BlogCard'
import {Appbar} from '../components/Appbar'
import {useBlogs} from '../hooks/index'

export const Blogs = ()=>{
    const {loading, blogs} = useBlogs()

    if(loading){
        return <div>
            loading...
        </div>
    }
    return <div>
                <Appbar/>
                <div className="flex justify-center"> 
                    <div >
                        {blogs.map(blog =>
                            <BlogCard
                            key={blog.id}
                            id= {blog.id}
                            authorName={blog.author.name || "Anonymous"}
                            title ={blog.title}
                            content = {blog.content}
                            publishedDate={"2nd Feb 2024"}
                            />        
                        )}
                        
                    </div>
                </div>
            </div>
}