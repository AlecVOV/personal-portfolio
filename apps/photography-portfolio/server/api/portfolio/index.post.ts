import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { data, error } = await client
    .from('portfolio_items')
    .insert({
      title: body.title,
      category_id: body.category_id,
      image: body.image,
      description: body.description || null,
      status: body.status || 'published'
    })
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