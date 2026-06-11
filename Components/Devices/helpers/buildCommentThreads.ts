import type { DeviceComment } from '../../../.vitepress/theme/api/communityClient'

export interface DeviceCommentThread {
  root: DeviceComment
  replies: DeviceComment[]
}

export function buildCommentThreads(comments: DeviceComment[]): DeviceCommentThread[] {
  const roots: DeviceComment[] = []
  const repliesByParent = new Map<number, DeviceComment[]>()

  for (const comment of comments) {
    if (comment.parent_id == null) {
      roots.push(comment)
      continue
    }

    const bucket = repliesByParent.get(comment.parent_id) ?? []
    bucket.push(comment)
    repliesByParent.set(comment.parent_id, bucket)
  }

  return roots.map((root) => ({
    root,
    replies: repliesByParent.get(root.id) ?? [],
  }))
}
