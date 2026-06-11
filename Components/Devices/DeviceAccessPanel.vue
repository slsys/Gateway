<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <h3 class="device-access-panel__title">
        <span>{{ t('commentsTitle') }}</span>
        <span class="device-access-panel__count-badge">{{ comments.length }}</span>
      </h3>
      <button
        v-if="commentsError && !commentsLoading"
        type="button"
        class="device-access-panel__retry"
        @click="refreshComments"
      >
        {{ t('commentsRetry') }}
      </button>
    </div>

    <div v-if="aggregateSummary" class="device-access-panel__aggregate">
      <span v-if="aggregateSummary.ratingAvg !== null" class="device-access-panel__aggregate-rating">
        {{ formatStarsLabel(aggregateSummary.ratingAvg) }}
      </span>
      <span v-if="aggregateSummary.ratingsLabel" class="device-access-panel__aggregate-meta">
        {{ aggregateSummary.ratingsLabel }}
      </span>
      <span class="device-access-panel__aggregate-meta">{{ aggregateSummary.commentsLabel }}</span>
    </div>

    <div v-if="commentsLoading" class="device-access-panel__empty">{{ t('commentsLoading') }}</div>
    <p v-else-if="commentsError" class="device-access-panel__technical-error">{{ t('commentsLoadFailed') }}</p>
    <div v-else-if="threads.length" class="device-comment-threads">
      <article v-for="thread in threads" :key="thread.root.id" class="device-comment-thread">
        <CommentCard
          :comment="thread.root"
          :is-own="canManageComment(thread.root)"
          :can-vote="canVote"
          :vote-pending="isVotePending(thread.root.id)"
          :show-reply="status === 'authenticated'"
          :is-reply-open="activeReplyAnchorId === thread.root.id"
          :editing-comment-id="editingCommentId"
          :edit-draft-body="editDraftBody"
          :edit-draft-rating="editDraftRating"
          :edit-draft-length="editDraftLength"
          :edit-previews="editPreviews"
          :edit-file-input-key="editFileInputKey"
          :comment-submitting="commentSubmitting"
          :comment-max-length="commentMaxLength"
          :editing-comment="editingComment"
          :resolve-avatar-url="resolveAvatarUrl"
          :resolve-image-url="resolveImageUrl"
          :is-avatar-broken="isAvatarBroken"
          :mark-avatar-broken="markAvatarBroken"
          :format-comment-date="formatCommentDate"
          :render-stars="renderStars"
          :get-user-initials="getUserInitials"
          :get-author-name="getAuthorName"
          :get-avatar-source="getAvatarSource"
          :set-edit-rating="setEditRating"
          :on-edit-files-change="onEditFilesChange"
          :start-edit="startEdit"
          :cancel-edit="cancelEdit"
          :save-edit="saveEdit"
          :remove-comment="removeComment"
          :toggle-reply-form="toggleReplyForm"
          :toggle-vote="toggleVote"
          :t="t"
        />

        <div v-if="thread.replies.length" class="device-comment-replies">
          <CommentCard
            v-for="reply in thread.replies"
            :key="reply.id"
            :comment="reply"
            :is-own="canManageComment(reply)"
            :can-vote="canVote"
            :vote-pending="isVotePending(reply.id)"
            :show-reply="false"
            :is-reply-open="false"
            :editing-comment-id="editingCommentId"
            :edit-draft-body="editDraftBody"
            :edit-draft-rating="editDraftRating"
            :edit-draft-length="editDraftLength"
            :edit-previews="editPreviews"
            :edit-file-input-key="editFileInputKey"
            :comment-submitting="commentSubmitting"
            :comment-max-length="commentMaxLength"
            :editing-comment="editingComment"
            :resolve-avatar-url="resolveAvatarUrl"
            :resolve-image-url="resolveImageUrl"
            :is-avatar-broken="isAvatarBroken"
            :mark-avatar-broken="markAvatarBroken"
            :format-comment-date="formatCommentDate"
            :render-stars="renderStars"
            :get-user-initials="getUserInitials"
            :get-author-name="getAuthorName"
            :get-avatar-source="getAvatarSource"
            :set-edit-rating="setEditRating"
            :on-edit-files-change="onEditFilesChange"
            :start-edit="startEdit"
            :cancel-edit="cancelEdit"
            :save-edit="saveEdit"
            :remove-comment="removeComment"
            :toggle-reply-form="toggleReplyForm"
            :toggle-vote="toggleVote"
            :t="t"
            is-reply
          />
        </div>

        <form
          v-if="status === 'authenticated' && activeReplyAnchorId === thread.root.id"
          class="device-reply-form"
          @submit.prevent="submitReply"
        >
          <textarea
            v-model="replyDraft"
            class="device-comment-form__input"
            :placeholder="t('commentReplyPlaceholder')"
            :maxlength="commentMaxLength"
            :disabled="replySubmitting"
            rows="3"
          ></textarea>
          <input
            :key="replyFileInputKey"
            class="device-comment-form__file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            @change="onReplyFilesChange"
          />
          <div v-if="replyPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
            <div v-for="preview in replyPreviews" :key="preview.url" class="device-comment-gallery__item">
              <img :src="preview.url" :alt="preview.name" />
            </div>
          </div>
          <div class="device-comment-form__footer">
            <div class="device-comment-form__meta-panel">
              <p class="device-comment-form__counter">{{ replyDraft.length }}/{{ commentMaxLength }}</p>
            </div>
            <div class="device-comment-actions">
              <button type="button" class="device-access-panel__secondary" @click="cancelReplyForm">
                {{ t('commentCancel') }}
              </button>
              <button
                type="submit"
                class="device-access-panel__primary"
                :disabled="replySubmitting || !canSubmitReply"
              >
                {{ replySubmitting ? t('commentSubmitting') : t('commentReplySubmit') }}
              </button>
            </div>
          </div>
        </form>
      </article>
    </div>
    <p v-else class="device-access-panel__empty">{{ t('commentsEmpty') }}</p>

    <form
      v-if="status === 'authenticated' && activeReplyAnchorId === null"
      class="device-comment-form"
      @submit.prevent="submitComment"
    >
      <label class="device-comment-form__label" for="device-comment-message">
        {{ t('commentFormLabel') }}
      </label>
      <textarea
        id="device-comment-message"
        v-model="commentDraft"
        class="device-comment-form__input"
        :placeholder="t('commentFormPlaceholder')"
        :disabled="commentSubmitting"
        :maxlength="commentMaxLength"
        rows="4"
      ></textarea>
      <input
        :key="createFileInputKey"
        class="device-comment-form__file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        @change="onCreateFilesChange"
      />
      <div v-if="commentPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
        <div v-for="preview in commentPreviews" :key="preview.url" class="device-comment-gallery__item">
          <img :src="preview.url" :alt="preview.name" />
        </div>
      </div>
      <div class="device-comment-form__footer">
        <div class="device-comment-form__meta-panel">
          <p class="device-comment-form__counter">{{ commentDraftLength }}/{{ commentMaxLength }}</p>
          <div class="device-comment-form__rating-row">
            <span class="device-comment-form__rating-label">{{ t('commentRatingLabel') }}</span>
            <div class="device-rating-editor device-rating-editor--create">
              <button
                v-for="value in 5"
                :key="`create-rating-${value}`"
                type="button"
                class="device-rating-star"
                :class="{ active: (commentRating || 0) >= value }"
                @click="setCreateRating(value)"
              >
                ★
              </button>
              <button type="button" class="device-rating-clear" @click="setCreateRating(null)">
                {{ t('commentRatingClear') }}
              </button>
            </div>
          </div>
        </div>
        <button
          type="submit"
          class="device-access-panel__primary"
          :disabled="commentSubmitting || !canSubmitComment"
        >
          {{ commentSubmitting ? t('commentSubmitting') : t('commentSubmit') }}
        </button>
      </div>
    </form>

    <p v-if="status === 'guest'" class="device-access-panel__guest-note">
      <a href="https://cloud.slsys.io/login" target="_blank" rel="noopener noreferrer">{{ t('commentGuestCta') }}</a>
    </p>
    <p v-if="status === 'auth_error' || status === 'network_error'" class="device-access-panel__technical-error">
      {{ t('commentAuthCheckFailed') }}
    </p>
    <p v-if="actionMessage" class="device-access-panel__message">{{ actionMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import {
  CommunityApiError,
  createDeviceComment,
  deleteDeviceComment,
  getDeviceComments,
  removeCommentVote,
  resolveCommunityAssetUrl,
  updateDeviceComment,
  voteComment,
  type CommentVote,
  type CommunityComment,
  type CommunityCommentImage,
} from '../../.vitepress/theme/api/communityClient'
import { useCloudAuth } from '../../.vitepress/theme/composables/useCloudAuth'
import { buildCommentThreads } from './helpers/buildCommentThreads'

interface PreviewImage {
  name: string
  url: string
}

const props = defineProps<{
  deviceId: number | null
  commentsCount?: number | null
  ratingAvg?: number | null
  t: (key: string) => string
}>()

const emit = defineEmits<{
  aggregatesChange: [{ commentsCount: number; ratingAvg: number | null; ratingsCount: number }]
}>()

const t = props.t
const { status, user } = useCloudAuth()

const comments = ref<CommunityComment[]>([])
const commentsLoading = ref(false)
const commentsError = ref(false)
const commentSubmitting = ref(false)
const deletingCommentId = ref<number | null>(null)
const commentDraft = ref('')
const commentRating = ref<number | null>(null)
const commentFiles = ref<File[]>([])
const commentPreviews = ref<PreviewImage[]>([])
const createFileInputKey = ref(0)

const activeReplyAnchorId = ref<number | null>(null)
const activeReplyParentId = ref<number | null>(null)
const replyDraft = ref('')
const replyFiles = ref<File[]>([])
const replyPreviews = ref<PreviewImage[]>([])
const replyFileInputKey = ref(0)
const replySubmitting = ref(false)

const editDraftBody = ref('')
const editDraftRating = ref<number | null>(null)
const editFiles = ref<File[]>([])
const editPreviews = ref<PreviewImage[]>([])
const editFileInputKey = ref(0)
const editingCommentId = ref<number | null>(null)

const votePendingIds = ref<number[]>([])
const brokenAvatarUrls = ref<string[]>([])
const actionMessage = ref('')
const commentMaxLength = 2000
const maxImagesPerComment = 5
const maxImageSizeBytes = 5 * 1024 * 1024
const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

const normalizedDeviceId = computed(() => props.deviceId)
const commentDraftLength = computed(() => commentDraft.value.length)
const editDraftLength = computed(() => editDraftBody.value.length)
const canVote = computed(() => status.value === 'authenticated')
const threads = computed(() => buildCommentThreads(comments.value))
const editingComment = computed(() => comments.value.find((comment) => comment.id === editingCommentId.value) ?? null)
const canSubmitComment = computed(() => hasPayload(commentDraft.value, commentRating.value, commentFiles.value.length))
const canSubmitReply = computed(() => hasPayload(replyDraft.value, null, replyFiles.value.length))
const canSubmitEdit = computed(() => {
  const currentImagesCount = editingComment.value?.images.length ?? 0
  return hasPayload(editDraftBody.value, editDraftRating.value, editFiles.value.length || currentImagesCount)
    && editingCommentId.value !== null
  })

const aggregateSummary = computed(() => {
  const commentsCount = comments.value.length || props.commentsCount || 0
  const ratedComments = comments.value.filter((comment) => comment.rating !== null)
  const ratingAvg = ratedComments.length
    ? Number((ratedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / ratedComments.length).toFixed(1))
    : props.ratingAvg ?? null

  if (commentsCount === 0 && ratingAvg === null) {
    return null
  }

  return {
    ratingAvg,
    ratingsLabel: ratedComments.length ? `${ratedComments.length} ${pluralizeRatings(ratedComments.length)}` : '',
    commentsLabel: `${commentsCount} ${pluralizeComments(commentsCount)}`,
  }
})

const HandThumbsUpIcon = defineComponent({
  name: 'HandThumbsUpIcon',
  setup() {
    return () => h(
      'svg',
      { viewBox: '0 0 16 16', 'aria-hidden': 'true' },
      [
        h('path', {
          d: 'M6.956 1.745C7.021.81 7.908.081 8.864.325l.261.067c.864.221 1.582.928 1.73 1.812.169 1.005.337 2.388.281 4.058h2.568a1.5 1.5 0 0 1 1.473 1.783l-1.094 5.473A2 2 0 0 1 12.122 15H4.5a1.5 1.5 0 0 1-1.492-1.356L2.469 8.5H1.5A1.5 1.5 0 0 1 0 7V6a1 1 0 0 1 1-1h2.17a1 1 0 0 1 .948.684l.138.416.446-.892c.302-.605.613-1.21.91-1.854.27-.587.505-1.243.644-2.205Z',
        }),
      ],
    )
  },
})

const HandThumbsDownIcon = defineComponent({
  name: 'HandThumbsDownIcon',
  setup() {
    return () => h(
      'svg',
      { viewBox: '0 0 16 16', 'aria-hidden': 'true' },
      [
        h('path', {
          d: 'M6.956 14.255c.065.935.952 1.664 1.908 1.42l.261-.067c.864-.221 1.582-.928 1.73-1.812.169-1.005.337-2.388.281-4.058h2.568a1.5 1.5 0 0 0 1.473-1.783l-1.094-5.473A2 2 0 0 0 12.122 1H4.5a1.5 1.5 0 0 0-1.492 1.356L2.469 7.5H1.5A1.5 1.5 0 0 0 0 9v1a1 1 0 0 0 1 1h2.17a1 1 0 0 0 .948-.684l.138-.416.446.892c.302.605.613 1.21.91 1.854.27.587.505 1.243.644 2.205Z',
        }),
      ],
    )
  },
})

const CommentCard = defineComponent({
  name: 'CommentCard',
  props: {
    comment: { type: Object as PropType<CommunityComment>, required: true },
    isOwn: { type: Boolean, required: true },
    canVote: { type: Boolean, required: true },
    votePending: { type: Boolean, required: true },
    showReply: { type: Boolean, required: true },
    isReplyOpen: { type: Boolean, required: true },
    isReply: { type: Boolean, default: false },
    editingCommentId: { type: Number as PropType<number | null>, required: true },
    editDraftBody: { type: String, required: true },
    editDraftRating: { type: Number as PropType<number | null>, required: true },
    editDraftLength: { type: Number, required: true },
    editPreviews: { type: Array as PropType<PreviewImage[]>, required: true },
    editFileInputKey: { type: Number, required: true },
    commentSubmitting: { type: Boolean, required: true },
    commentMaxLength: { type: Number, required: true },
    editingComment: { type: Object as PropType<CommunityComment | null>, required: true },
    resolveAvatarUrl: { type: Function as PropType<(value: string) => string>, required: true },
    resolveImageUrl: { type: Function as PropType<(image: CommunityCommentImage) => string | null>, required: true },
    isAvatarBroken: { type: Function as PropType<(value: string) => boolean>, required: true },
    markAvatarBroken: { type: Function as PropType<(value: string) => void>, required: true },
    formatCommentDate: { type: Function as PropType<(value: string | null) => string>, required: true },
    renderStars: { type: Function as PropType<(rating: number) => string>, required: true },
    getUserInitials: { type: Function as PropType<(name: string) => string>, required: true },
    getAuthorName: { type: Function as PropType<(comment: CommunityComment) => string>, required: true },
    getAvatarSource: { type: Function as PropType<(comment: CommunityComment) => string | null>, required: true },
    setEditRating: { type: Function as PropType<(rating: number | null) => void>, required: true },
    onEditFilesChange: { type: Function as PropType<(event: Event) => void>, required: true },
    startEdit: { type: Function as PropType<(comment: CommunityComment) => void>, required: true },
    cancelEdit: { type: Function as PropType<() => void>, required: true },
    saveEdit: { type: Function as PropType<(commentId: number) => void>, required: true },
    removeComment: { type: Function as PropType<(comment: CommunityComment) => void>, required: true },
    toggleReplyForm: { type: Function as PropType<(commentId: number) => void>, required: true },
    toggleVote: { type: Function as PropType<(comment: CommunityComment, vote: CommentVote) => void>, required: true },
    t: { type: Function as PropType<(key: string) => string>, required: true },
  },
  setup(cardProps) {
    return () => {
      const avatarSource = cardProps.getAvatarSource(cardProps.comment)
      const resolvedAvatar = avatarSource ? cardProps.resolveAvatarUrl(avatarSource) : null
      const hasAvatar = Boolean(resolvedAvatar) && !cardProps.isAvatarBroken(avatarSource || '')
      const isEditing = cardProps.editingCommentId === cardProps.comment.id

      return h('div', {
        class: ['device-comment-card', { 'device-comment-card--reply': cardProps.isReply, 'device-comment-card--own': cardProps.isOwn }],
      }, [
        h('div', { class: 'device-comment-card__avatar' }, [
          hasAvatar
            ? h('img', {
                src: resolvedAvatar || '',
                alt: cardProps.getAuthorName(cardProps.comment),
                loading: 'lazy',
                onError: () => cardProps.markAvatarBroken(avatarSource || ''),
              })
            : h('span', cardProps.getUserInitials(cardProps.getAuthorName(cardProps.comment))),
        ]),
        h('div', { class: 'device-comment-card__body' }, [
          h('div', { class: 'device-comment-card__meta' }, [
            h('div', { class: 'device-comment-card__author-line' }, [
              h('strong', cardProps.getAuthorName(cardProps.comment)),
              cardProps.isOwn ? h('span', { class: 'device-comment-card__author-badge' }, cardProps.t('commentOwnBadge')) : null,
              cardProps.comment.rating !== null
                ? h('span', {
                    class: 'device-comment-card__rating-inline',
                    'aria-label': `${cardProps.comment.rating} / 5`,
                  }, cardProps.renderStars(cardProps.comment.rating))
                : null,
            ]),
            h('span', { class: 'device-comment-card__time' }, cardProps.formatCommentDate(cardProps.comment.updated_at || cardProps.comment.created_at)),
          ]),
          isEditing
            ? h('div', { class: 'device-comment-edit' }, [
                h('div', { class: 'device-rating-editor' }, [
                  ...[1, 2, 3, 4, 5].map((value) => h('button', {
                    key: `edit-rating-${cardProps.comment.id}-${value}`,
                    type: 'button',
                    class: ['device-rating-star', { active: (cardProps.editDraftRating || 0) >= value }],
                    onClick: () => cardProps.setEditRating(value),
                  }, '★')),
                  h('button', {
                    type: 'button',
                    class: 'device-rating-clear',
                    onClick: () => cardProps.setEditRating(null),
                  }, cardProps.t('commentRatingClear')),
                ]),
                h('textarea', {
                  value: cardProps.editDraftBody,
                  onInput: (event: Event) => {
                    editDraftBody.value = (event.target as HTMLTextAreaElement).value
                  },
                  class: 'device-comment-form__input',
                  maxlength: cardProps.commentMaxLength,
                  rows: 4,
                }),
                h('p', { class: 'device-comment-form__replacement-hint' }, cardProps.t('commentImagesReplaceHint')),
                h('input', {
                  key: cardProps.editFileInputKey,
                  class: 'device-comment-form__file-input',
                  type: 'file',
                  accept: 'image/jpeg,image/png,image/webp',
                  multiple: true,
                  onChange: cardProps.onEditFilesChange,
                }),
                cardProps.editingComment?.images.length && !cardProps.editPreviews.length
                  ? h('div', { class: 'device-comment-gallery device-comment-gallery--current' },
                      cardProps.editingComment.images
                        .map((image) => {
                          const imageUrl = cardProps.resolveImageUrl(image)
                          if (!imageUrl) {
                            return null
                          }
                          return h('a', {
                            key: `existing-edit-${image.id}`,
                            href: imageUrl,
                            class: 'device-comment-gallery__item',
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          }, [
                            h('img', { src: imageUrl, alt: cardProps.t('commentImageAlt'), loading: 'lazy' }),
                          ])
                        })
                        .filter(Boolean),
                    )
                  : null,
                cardProps.editPreviews.length
                  ? h('div', { class: 'device-comment-gallery device-comment-gallery--preview' },
                      cardProps.editPreviews.map((preview) => h('div', {
                        key: preview.url,
                        class: 'device-comment-gallery__item',
                      }, [h('img', { src: preview.url, alt: preview.name })])),
                    )
                  : null,
                h('div', { class: 'device-comment-form__footer' }, [
                  h('div', { class: 'device-comment-form__meta-panel' }, [
                    h('p', { class: 'device-comment-form__counter' }, `${cardProps.editDraftLength}/${cardProps.commentMaxLength}`),
                  ]),
                  h('div', { class: 'device-comment-actions' }, [
                    h('button', {
                      type: 'button',
                      class: 'device-access-panel__secondary',
                      onClick: cardProps.cancelEdit,
                    }, cardProps.t('commentCancel')),
                    h('button', {
                      type: 'button',
                      class: 'device-access-panel__primary',
                      disabled: cardProps.commentSubmitting || !canSubmitEdit.value,
                      onClick: () => cardProps.saveEdit(cardProps.comment.id),
                    }, cardProps.commentSubmitting ? cardProps.t('commentSaving') : cardProps.t('commentSave')),
                  ]),
                ]),
              ])
            : h('div', { class: 'device-comment-card__content' }, [
                cardProps.comment.body.trim()
                  ? h('p', { class: 'device-comment-card__text' }, cardProps.comment.body)
                  : null,
                cardProps.comment.images.length
                  ? h('div', { class: 'device-comment-gallery' },
                      cardProps.comment.images
                        .map((image) => {
                          const imageUrl = cardProps.resolveImageUrl(image)
                          if (!imageUrl) {
                            return null
                          }
                          return h('a', {
                            key: `image-${cardProps.comment.id}-${image.id}-${imageUrl}`,
                            href: imageUrl,
                            class: 'device-comment-gallery__item',
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          }, [
                            h('img', { src: imageUrl, alt: cardProps.t('commentImageAlt'), loading: 'lazy' }),
                          ])
                        })
                        .filter(Boolean),
                    )
                  : null,
                h('div', { class: 'device-comment-votes' }, [
                  h('button', {
                    type: 'button',
                    class: ['device-comment-vote', 'device-comment-vote--like', { active: cardProps.comment.my_vote === 'like' }],
                    disabled: !cardProps.canVote || cardProps.votePending,
                    onClick: () => cardProps.toggleVote(cardProps.comment, 'like'),
                  }, [h(HandThumbsUpIcon), h('span', String(cardProps.comment.likes_count))]),
                  h('button', {
                    type: 'button',
                    class: ['device-comment-vote', 'device-comment-vote--dislike', { active: cardProps.comment.my_vote === 'dislike' }],
                    disabled: !cardProps.canVote || cardProps.votePending,
                    onClick: () => cardProps.toggleVote(cardProps.comment, 'dislike'),
                  }, [h(HandThumbsDownIcon), h('span', String(cardProps.comment.dislikes_count))]),
                ]),
                h('div', { class: 'device-comment-actions-row' }, [
                  cardProps.showReply
                    ? h('button', {
                        type: 'button',
                        class: 'device-comment-link',
                        onClick: () => cardProps.toggleReplyForm(cardProps.comment.id),
                      }, cardProps.isReplyOpen ? cardProps.t('commentCancel') : cardProps.t('commentReply'))
                    : null,
                  cardProps.isOwn
                    ? h('div', { class: 'device-comment-actions device-comment-actions--inline' }, [
                        h('button', {
                          type: 'button',
                          class: 'device-comment-link',
                          onClick: () => cardProps.startEdit(cardProps.comment),
                        }, cardProps.t('commentEdit')),
                        h('button', {
                          type: 'button',
                          class: 'device-comment-link device-comment-link--danger',
                          disabled: deletingCommentId.value === cardProps.comment.id,
                          onClick: () => cardProps.removeComment(cardProps.comment),
                        }, deletingCommentId.value === cardProps.comment.id ? cardProps.t('commentDeleting') : cardProps.t('commentDelete')),
                      ])
                    : null,
                ]),
              ]),
        ]),
      ])
    }
  },
})

function pluralizeComments(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return t('commentsCountOne')
  }
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return t('commentsCountFew')
  }
  return t('commentsCountMany')
}

function pluralizeRatings(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return t('ratingsCountOne')
  }
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return t('ratingsCountFew')
  }
  return t('ratingsCountMany')
}

function normalizeRatingInput(rating: number | null) {
  return rating === null ? null : Math.min(5, Math.max(1, rating))
}

function hasPayload(body: string, rating: number | null, imagesCount: number) {
  const trimmed = body.trim()
  const normalizedRating = normalizeRatingInput(rating)
  return (trimmed.length > 0 || normalizedRating !== null || imagesCount > 0) && trimmed.length <= commentMaxLength
}

function mapCommentError(err: unknown): string {
  if (err instanceof CommunityApiError) {
    switch (err.code) {
      case 'not_authenticated':
        return t('communityAuthRequired')
      case 'invalid_device_id':
        return t('communityInvalidDeviceId')
      case 'invalid_parent_comment':
        return t('communityInvalidParentComment')
      case 'reply_device_mismatch':
        return t('communityReplyDeviceMismatch')
      case 'reply_depth_not_allowed':
        return t('communityReplyDepthNotAllowed')
      case 'invalid_rating':
        return t('communityInvalidRating')
      case 'invalid_vote':
        return t('communityInvalidVote')
      case 'unsupported_image_type':
        return t('communityUnsupportedImageType')
      case 'image_too_large':
        return t('communityImageTooLarge')
      case 'too_many_images':
        return t('communityTooManyImages')
      case 'comment_forbidden':
        return t('communityCommentForbidden')
      case 'comment_not_found':
        return t('communityCommentNotFound')
      case 'auth_service_unavailable':
        return t('communityAuthServiceUnavailable')
      case 'comment_or_rating_required':
        return t('communityCommentOrRatingRequired')
      case 'invalid_comment':
      case 'device_not_found':
        return t('communityValidationError')
      default:
        return t('communityRequestFailed')
    }
  }

  return t('communityRequestFailed')
}

function emitAggregates() {
  const commentsCount = comments.value.length
  const ratedComments = comments.value.filter((comment) => comment.rating !== null)
  const ratingAvg = ratedComments.length
    ? Number((ratedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / ratedComments.length).toFixed(1))
    : null

  emit('aggregatesChange', {
    commentsCount,
    ratingAvg,
    ratingsCount: ratedComments.length,
  })
}

async function refreshComments() {
  const deviceId = normalizedDeviceId.value
  commentsError.value = false
  actionMessage.value = ''

  if (deviceId === null) {
    comments.value = []
    emitAggregates()
    return
  }

  commentsLoading.value = true

  try {
    comments.value = await getDeviceComments(deviceId)
    emitAggregates()
  } catch (err) {
    console.error(err)
    commentsError.value = true
  } finally {
    commentsLoading.value = false
  }
}

watch(
  normalizedDeviceId,
  () => {
    void refreshComments()
  },
  { immediate: true },
)

function formatCommentDate(value: string | null) {
  if (!value) {
    return ''
  }

  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value
  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function renderStars(rating: number) {
  const full = '★'.repeat(Math.round(rating))
  const empty = '☆'.repeat(Math.max(0, 5 - Math.round(rating)))
  return `${full}${empty}`
}

function formatStarsLabel(rating: number) {
  return `★ ${rating.toFixed(1)}`
}

function getUserInitials(name: string) {
  return (name || t('commentAnonymous'))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function getAuthorName(comment: CommunityComment) {
  if (comment.author === null) {
    return t('commentDeletedUser')
  }

  return comment.author.display_name.trim() || t('commentAnonymous')
}

function isAvatarBroken(value: string) {
  return brokenAvatarUrls.value.includes(value)
}

function markAvatarBroken(value: string) {
  if (!value || brokenAvatarUrls.value.includes(value)) {
    return
  }

  brokenAvatarUrls.value = [...brokenAvatarUrls.value, value]
}

function getAvatarSource(comment: CommunityComment) {
  const candidate = comment.author?.avatar_url ?? null
  if (!candidate || isAvatarBroken(candidate)) {
    return null
  }
  return candidate
}

function resolveAvatarUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  if (value.startsWith('/')) {
    return `https://cloud.slsys.io${value}`
  }

  return value
}

function resolveImageUrl(image: CommunityCommentImage) {
  if (!image.url) {
    return null
  }

  return resolveCommunityAssetUrl(image.url)
}

function canManageComment(comment: CommunityComment) {
  return status.value === 'authenticated'
    && comment.author !== null
    && String(comment.author.id) === String(user.value?.id)
}

function setCreateRating(rating: number | null) {
  commentRating.value = normalizeRatingInput(rating)
}

function setEditRating(rating: number | null) {
  editDraftRating.value = normalizeRatingInput(rating)
}

function revokePreviewUrls(previews: PreviewImage[]) {
  previews.forEach((preview) => {
    URL.revokeObjectURL(preview.url)
  })
}

function clearCreateFiles() {
  revokePreviewUrls(commentPreviews.value)
  commentPreviews.value = []
  commentFiles.value = []
  createFileInputKey.value += 1
}

function clearReplyFiles() {
  revokePreviewUrls(replyPreviews.value)
  replyPreviews.value = []
  replyFiles.value = []
  replyFileInputKey.value += 1
}

function clearEditFiles() {
  revokePreviewUrls(editPreviews.value)
  editPreviews.value = []
  editFiles.value = []
  editFileInputKey.value += 1
}

function buildPreviews(files: File[]): PreviewImage[] {
  return files.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file),
  }))
}

function validateImageFiles(fileList: FileList | null): File[] {
  const files = Array.from(fileList || [])

  if (files.length > maxImagesPerComment) {
    throw new Error(t('communityTooManyImages'))
  }

  for (const file of files) {
    if (!allowedImageMimeTypes.includes(file.type)) {
      throw new Error(t('communityUnsupportedImageType'))
    }

    if (file.size > maxImageSizeBytes) {
      throw new Error(t('communityImageTooLarge'))
    }
  }

  return files
}

function onCreateFilesChange(event: Event) {
  const input = event.target as HTMLInputElement

  try {
    const files = validateImageFiles(input.files)
    clearCreateFiles()
    commentFiles.value = files
    commentPreviews.value = buildPreviews(files)
    actionMessage.value = ''
  } catch (err) {
    clearCreateFiles()
    actionMessage.value = err instanceof Error ? err.message : t('communityRequestFailed')
  }
}

function onReplyFilesChange(event: Event) {
  const input = event.target as HTMLInputElement

  try {
    const files = validateImageFiles(input.files)
    clearReplyFiles()
    replyFiles.value = files
    replyPreviews.value = buildPreviews(files)
    actionMessage.value = ''
  } catch (err) {
    clearReplyFiles()
    actionMessage.value = err instanceof Error ? err.message : t('communityRequestFailed')
  }
}

function onEditFilesChange(event: Event) {
  const input = event.target as HTMLInputElement

  try {
    const files = validateImageFiles(input.files)
    clearEditFiles()
    editFiles.value = files
    editPreviews.value = buildPreviews(files)
    actionMessage.value = ''
  } catch (err) {
    clearEditFiles()
    actionMessage.value = err instanceof Error ? err.message : t('communityRequestFailed')
  }
}

function resetCreateForm() {
  commentDraft.value = ''
  commentRating.value = null
  clearCreateFiles()
}

function toggleReplyForm(commentId: number) {
  if (activeReplyAnchorId.value === commentId) {
    cancelReplyForm()
    return
  }

  activeReplyAnchorId.value = commentId
  activeReplyParentId.value = commentId
  replyDraft.value = ''
  clearReplyFiles()
  actionMessage.value = ''
}

function cancelReplyForm() {
  activeReplyAnchorId.value = null
  activeReplyParentId.value = null
  replyDraft.value = ''
  clearReplyFiles()
}

function startEdit(comment: CommunityComment) {
  editingCommentId.value = comment.id
  editDraftBody.value = comment.body
  editDraftRating.value = comment.rating
  clearEditFiles()
  actionMessage.value = ''
}

function cancelEdit() {
  editingCommentId.value = null
  editDraftBody.value = ''
  editDraftRating.value = null
  clearEditFiles()
}

async function submitComment() {
  if (!canSubmitComment.value || normalizedDeviceId.value === null) {
    actionMessage.value = t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceComment({
      deviceId: normalizedDeviceId.value,
      body: commentDraft.value,
      rating: commentRating.value,
      images: commentFiles.value,
    })
    resetCreateForm()
    actionMessage.value = t('commentSubmitSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function submitReply() {
  if (!canSubmitReply.value || normalizedDeviceId.value === null || activeReplyParentId.value === null) {
    actionMessage.value = t('communityCommentOrRatingRequired')
    return
  }

  replySubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceComment({
      deviceId: normalizedDeviceId.value,
      parentId: activeReplyParentId.value,
      body: replyDraft.value,
      images: replyFiles.value,
    })
    cancelReplyForm()
    actionMessage.value = t('commentReplySuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    replySubmitting.value = false
  }
}

async function saveEdit(commentId: number) {
  if (!canSubmitEdit.value) {
    actionMessage.value = t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    await updateDeviceComment({
      commentId,
      body: editDraftBody.value,
      rating: editDraftRating.value,
      images: editFiles.value,
    })
    cancelEdit()
    actionMessage.value = t('commentUpdateSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function removeComment(comment: CommunityComment) {
  if (!window.confirm(t('commentDeleteConfirm'))) {
    return
  }

  deletingCommentId.value = comment.id
  actionMessage.value = ''

  try {
    await deleteDeviceComment(comment.id)
    actionMessage.value = t('commentDeleteSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    deletingCommentId.value = null
  }
}

function isVotePending(commentId: number) {
  return votePendingIds.value.includes(commentId)
}

function patchVoteState(commentId: number, voteState: VoteCommentResultLike) {
  comments.value = comments.value.map((comment) => {
    if (comment.id !== commentId) {
      return comment
    }

    return {
      ...comment,
      likes_count: voteState.likes_count,
      dislikes_count: voteState.dislikes_count,
      my_vote: voteState.my_vote,
    }
  })
}

type VoteCommentResultLike = {
  likes_count: number
  dislikes_count: number
  my_vote: CommentVote | null
}

async function toggleVote(comment: CommunityComment, nextVote: CommentVote) {
  if (!canVote.value || isVotePending(comment.id)) {
    return
  }

  votePendingIds.value = [...votePendingIds.value, comment.id]
  actionMessage.value = ''

  try {
    const result = comment.my_vote === nextVote
      ? await removeCommentVote(comment.id)
      : await voteComment(comment.id, nextVote)

    patchVoteState(comment.id, result)
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    votePendingIds.value = votePendingIds.value.filter((id) => id !== comment.id)
  }
}

onBeforeUnmount(() => {
  revokePreviewUrls(commentPreviews.value)
  revokePreviewUrls(replyPreviews.value)
  revokePreviewUrls(editPreviews.value)
})
</script>

<style scoped>
.device-access-panel {
  margin-top: 24px;
}

.device-access-panel__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.device-access-panel__title {
  align-items: center;
  color: var(--vp-c-text-1);
  display: flex;
  font-size: 1rem;
  font-weight: 600;
  gap: 8px;
  line-height: 1.35;
  margin: 0;
}

.device-access-panel__count-badge {
  background: var(--vp-c-default-soft);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
}

.device-access-panel__retry,
.device-comment-link,
.device-rating-clear {
  background: transparent;
  border: 0;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
  padding: 0;
}

.device-comment-link--danger {
  color: var(--vp-c-danger-1);
}

.device-access-panel__aggregate {
  align-items: center;
  color: var(--vp-c-text-2);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.device-access-panel__aggregate-rating {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.device-access-panel__empty,
.device-access-panel__technical-error,
.device-access-panel__message,
.device-access-panel__guest-note {
  color: var(--vp-c-text-2);
  margin: 14px 0 0;
}

.device-comment-threads {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.device-comment-thread {
  display: grid;
  gap: 12px;
}

.device-comment-replies {
  border-left: 1px solid var(--vp-c-divider);
  display: grid;
  gap: 12px;
  margin-left: 22px;
  padding-left: 18px;
}

.device-comment-card {
  display: flex;
  gap: 12px;
}

.device-comment-card__avatar {
  align-items: center;
  background: var(--vp-c-default-soft);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  display: flex;
  flex: 0 0 40px;
  font-size: 13px;
  font-weight: 700;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;
}

.device-comment-card__avatar img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.device-comment-card__body {
  flex: 1;
  min-width: 0;
}

.device-comment-card__meta {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: space-between;
}

.device-comment-card__author-line {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.device-comment-card__author-badge {
  background: var(--vp-c-success-soft);
  border-radius: 999px;
  color: var(--vp-c-success-1);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
}

.device-comment-card__rating-inline,
.device-comment-card__time {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.device-comment-card__content,
.device-comment-edit {
  margin-top: 8px;
}

.device-comment-card__text {
  color: var(--vp-c-text-1);
  margin: 0;
  white-space: pre-wrap;
}

.device-comment-gallery {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  margin-top: 10px;
}

.device-comment-gallery__item {
  aspect-ratio: 1;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  display: block;
  overflow: hidden;
}

.device-comment-gallery__item img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.device-comment-votes {
  align-items: center;
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.device-comment-vote {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--vp-c-text-2);
  cursor: pointer;
  display: inline-flex;
  gap: 6px;
  padding: 0;
}

.device-comment-vote svg {
  fill: currentColor;
  height: 14px;
  width: 14px;
}

.device-comment-vote--like {
  color: var(--vp-c-success-1);
}

.device-comment-vote--dislike {
  color: var(--vp-c-danger-1);
}

.device-comment-vote:not(.active) {
  opacity: 0.75;
}

.device-comment-vote:disabled,
.device-comment-link:disabled,
.device-access-panel__primary:disabled,
.device-access-panel__secondary:disabled {
  cursor: default;
  opacity: 0.5;
}

.device-comment-actions-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.device-comment-actions,
.device-comment-actions--inline {
  display: inline-flex;
  gap: 12px;
}

.device-comment-form,
.device-reply-form {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  margin-top: 18px;
  padding: 14px;
}

.device-reply-form {
  margin-left: 52px;
}

.device-comment-form__label {
  color: var(--vp-c-text-1);
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.device-comment-form__input,
.device-comment-form__file-input {
  width: 100%;
}

.device-comment-form__input {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--vp-c-text-1);
  font: inherit;
  padding: 10px 12px;
  resize: vertical;
}

.device-comment-form__input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.device-comment-form__file-input {
  color: var(--vp-c-text-2);
  margin-top: 12px;
}

.device-comment-form__footer {
  align-items: flex-end;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 12px;
}

.device-comment-form__meta-panel {
  display: grid;
  gap: 8px;
}

.device-comment-form__counter,
.device-comment-form__replacement-hint {
  color: var(--vp-c-text-2);
  font-size: 12px;
  margin: 0;
}

.device-comment-form__rating-row {
  display: grid;
  gap: 6px;
}

.device-comment-form__rating-label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.device-rating-editor {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.device-rating-star {
  background: transparent;
  border: 0;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.device-rating-star.active {
  color: #f5b400;
}

.device-access-panel__primary,
.device-access-panel__secondary {
  border-radius: 10px;
  font: inherit;
  min-height: 36px;
  padding: 0 14px;
}

.device-access-panel__primary {
  background: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  color: #fff;
}

.device-access-panel__secondary {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.device-access-panel__guest-note a {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .device-comment-card__meta,
  .device-comment-form__footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .device-reply-form {
    margin-left: 0;
  }

  .device-comment-replies {
    margin-left: 12px;
    padding-left: 12px;
  }
}
</style>
