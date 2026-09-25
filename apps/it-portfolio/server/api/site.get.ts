// Public: everything the home page shows, from one Query on partition SITE.
export default defineEventHandler(async () => {
  const items = await dbQuery({ KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': 'SITE' } })
  const ofType = (type: string) => items.filter(i => i.type === type).sort(bySortOrder).map(toApi)
  const profile = items.find(i => i.type === 'profile')
  return {
    profile: profile ? toApi(profile) : null,
    socialLinks: ofType('socialLink'),
    fields: ofType('field'),
    education: ofType('education'),
    experience: ofType('experience'),
    skills: ofType('skill'),
    certifications: ofType('certification'),
    projects: ofType('project'),
  }
})
