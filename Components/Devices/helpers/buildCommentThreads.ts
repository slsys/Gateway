import type { CommunityComment } from '../../../.vitepress/theme/api/communityClient'

export interface CommunityCommentThread {
  root: CommunityComment
  replies: CommunityComment[]
}

export function buildCommentThreads(comments: CommunityComment[]): CommunityCommentThread[] {
  const roots: CommunityComment[] = []
  const repliesByParent = new Map<number, CommunityComment[]>()

  for (const comment of comments) {
    if (comment.parent_id === null) {
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
