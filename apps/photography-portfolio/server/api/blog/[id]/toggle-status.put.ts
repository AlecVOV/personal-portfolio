import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const { status } = await readBody(event)

  const updateData: any = { status }
  
  // If unhiding, clear deleted_at
  if (status === 'published' || status === 'hidden') {
    updateData.deleted_at = null
  }

  const { data, error } = await client
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data
})