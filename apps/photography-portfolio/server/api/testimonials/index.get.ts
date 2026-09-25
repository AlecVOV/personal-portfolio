// Public: published testimonials, newest first. One Query on the sparse GSI1.
export default defineEventHandler(async () => (await dbPublished(PUBLISHED.testimonial)).map(toApi))
