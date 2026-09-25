import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  // Soft delete: set status to 'deleted' and add deleted_at timestamp
  const { data, error } = await client
    .from('blog_posts')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString()
    })
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