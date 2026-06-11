import type { DeviceComment } from '../../../.vitepress/theme/api/communityClient'

export interface DeviceCommentThread {
  comment: DeviceComment
  replies: DeviceCommentThread[]
}

export function buildCommentThreads(comments: DeviceComment[]): DeviceCommentThread[] {
  const byParent = new Map<number | null, DeviceComment[]>()

  for (const comment of comments) {
    const parentId = comment.parent_id ?? null
    const bucket = byParent.get(parentId) ?? []
    bucket.push(comment)
    byParent.set(parentId, bucket)
  }

  const buildBranch = (parentId: number | null): DeviceCommentThread[] => {
    const bucket = byParent.get(parentId) ?? []

    return bucket.map((comment) => ({
      comment,
      replies: buildBranch(comment.id),
    }))
  }

  return buildBranch(null)
}
