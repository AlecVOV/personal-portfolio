export interface BlogPost {
  _path: string
  _id: string
  _draft?: boolean
  title: string
  description?: string
  excerpt?: string
  date: string
  category?: string
  image?: string
  tags?: string[]
  body?: any
  [key: string]: any
}