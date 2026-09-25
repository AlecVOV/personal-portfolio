import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Blog Post Creation Started ===')
    
    // Use service role client which bypasses RLS
    const client = serverSupabaseServiceRole(event)
    console.log('Supabase service role client initialized')
    
    const body = await readBody(event)
    console.log('Request body:', JSON.stringify(body, null, 2))

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    console.log('Generated slug:', slug)

    // Prepare the insert data
    const insertData = {
      title: body.title,
      slug: slug,
      content: body.content,
      excerpt: body.excerpt || null,
      featured_image: body.featured_image || null,
      category_id: body.category_id || null,
      status: body.status || 'published'
    }
    
    console.log('Insert data:', JSON.stringify(insertData, null, 2))

    const { data, error } = await client
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      throw createError({
        statusCode: 500,
        message: `Database error: ${error.message}`,
        data: { 
          supabaseError: error,
          attemptedInsert: insertData
        }
      })
    }

    console.log('Post created successfully:', data)
    console.log('=== Blog Post Creation Completed ===')
    
    return data
    
  } catch (error: any) {
    console.error('=== Blog Post Creation Failed ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create blog post',
      data: error.data
    })
  }
})