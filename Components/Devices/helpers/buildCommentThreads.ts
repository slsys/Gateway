import type { CommunityComment } from '../../../.vitepress/theme/api/communityClient'

export interface CommunityCommentThreadNode {
  comment: CommunityComment
  replies: CommunityCommentThreadNode[]
}

export function buildCommentThreads(comments: CommunityComment[]): CommunityCommentThreadNode[] {
  const byParent = new Map<number | null, CommunityComment[]>()

  for (const comment of comments) {
    const parentId = comment.parent_id ?? null
    const bucket = byParent.get(parentId) ?? []
    bucket.push(comment)
    byParent.set(parentId, bucket)
  }

  const buildBranch = (parentId: number | null): CommunityCommentThreadNode[] => {
    const bucket = byParent.get(parentId) ?? []

    return bucket.map((comment) => ({
      comment,
      replies: buildBranch(comment.id),
    }))
  }

  return buildBranch(null)
}
