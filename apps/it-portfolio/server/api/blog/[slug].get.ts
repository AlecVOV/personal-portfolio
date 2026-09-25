// Public: one published post by slug (slug pointer -> post).
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!SLUG_RE.test(slug)) throw createError({ statusCode: 404, message: 'Not found' })
  const pointer = await dbGet(slugKey(slug).PK, slugKey(slug).SK)
  const post = pointer && await dbGet('BLOG', `POST#${pointer.id}`)
  if (!post?.published) throw createError({ statusCode: 404, message: 'Not found' })
  return toApi(post)
})
