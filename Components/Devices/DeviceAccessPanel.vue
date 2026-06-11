<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <h3 class="device-access-panel__title">
        <span>{{ t('commentsTitle') }}</span>
        <span class="device-access-panel__count-badge">{{ comments.length }}</span>
      </h3>
      <div class="device-access-panel__header-actions">
        <button
          v-if="commentsError && !commentsLoading"
          type="button"
          class="device-access-panel__retry"
          @click="refreshComments"
        >
          {{ t('commentsRetry') }}
        </button>
      </div>
    </div>

    <div v-if="aggregateSummary" class="device-access-panel__aggregate">
      <span v-if="aggregateSummary.ratingAvg !== null" class="device-access-panel__aggregate-rating">
        {{ formatStarsLabel(aggregateSummary.ratingAvg) }}
      </span>
      <span v-if="aggregateSummary.ratingsLabel" class="device-access-panel__aggregate-meta">{{ aggregateSummary.ratingsLabel }}</span>
      <span class="device-access-panel__aggregate-meta">{{ aggregateSummary.commentsLabel }}</span>
    </div>

    <div v-if="commentsLoading" class="device-access-panel__empty">{{ t('commentsLoading') }}</div>
    <p v-else-if="commentsError" class="device-access-panel__technical-error">{{ t('commentsLoadFailed') }}</p>
    <div v-else-if="threads.length" class="device-comment-threads">
      <article
        v-for="thread in threads"
        :key="thread.root.id"
        class="device-comment-thread"
      >
        <div class="device-comment-card" :class="{ 'device-comment-card--own': isOwnComment(thread.root) }">
          <div class="device-comment-card__avatar">
            <img
              v-if="getCommentAvatarUrl(thread.root)"
              :src="resolveAvatarUrl(getCommentAvatarUrl(thread.root) || '')"
              :alt="thread.root.user_name"
              loading="lazy"
            />
            <span v-else>{{ getUserInitials(thread.root.user_name) }}</span>
          </div>
          <div class="device-comment-card__body">
            <div class="device-comment-card__meta">
              <div class="device-comment-card__author-line">
                <strong>{{ thread.root.user_name || t('commentAnonymous') }}</strong>
                <span v-if="isOwnComment(thread.root)" class="device-comment-card__author-badge">{{ t('commentOwnBadge') }}</span>
                <span v-if="thread.root.rating !== null" class="device-comment-card__rating-inline" :aria-label="`${thread.root.rating} / 5`">
                  {{ renderStars(thread.root.rating) }}
                </span>
              </div>
              <span class="device-comment-card__time">{{ formatCommentDate(thread.root.updated_at || thread.root.created_at) }}</span>
            </div>

            <template v-if="editingCommentId === thread.root.id">
              <div class="device-comment-edit">
                <div class="device-rating-editor">
                  <button
                    v-for="value in 5"
                    :key="`edit-root-rating-${thread.root.id}-${value}`"
                    type="button"
                    class="device-rating-star"
                    :class="{ active: (editDraftRating || 0) >= value }"
                    @click="setEditRating(value)"
                  >
                    ★
                  </button>
                  <button type="button" class="device-rating-clear" @click="setEditRating(null)">
                    {{ t('commentRatingClear') }}
                  </button>
                </div>
                <textarea
                  v-model="editDraftComment"
                  class="device-comment-form__input"
                  :maxlength="commentMaxLength"
                  rows="4"
                ></textarea>
                <p class="device-comment-form__replacement-hint">{{ t('commentImagesReplaceHint') }}</p>
                <input
                  :key="editFileInputKey"
                  class="device-comment-form__file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  @change="onEditFilesChange"
                />
                <div v-if="editingComment?.images.length && !editPreviews.length" class="device-comment-gallery device-comment-gallery--current">
                  <a
                    v-for="image in editingComment.images"
                    :key="`existing-edit-${image.id}`"
                    :href="getCommentImageUrl(image.public_url)"
                    class="device-comment-gallery__item"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img :src="getCommentImageUrl(image.public_url)" :alt="t('commentImageAlt')" loading="lazy" />
                  </a>
                </div>
                <div v-if="editPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
                  <div v-for="preview in editPreviews" :key="preview.url" class="device-comment-gallery__item">
                    <img :src="preview.url" :alt="preview.name" />
                  </div>
                </div>
                <div class="device-comment-form__footer">
                  <div class="device-comment-form__meta-panel">
                    <p class="device-comment-form__hint">{{ t('commentSubmitHint') }}</p>
                    <p class="device-comment-form__counter">{{ editDraftLength }}/{{ commentMaxLength }}</p>
                  </div>
                  <div class="device-comment-actions">
                    <button type="button" class="device-access-panel__secondary" @click="cancelEdit">
                      {{ t('commentCancel') }}
                    </button>
                    <button
                      type="button"
                      class="device-access-panel__primary"
                      :disabled="commentSubmitting || !canSubmitEdit"
                      @click="saveEdit(thread.root.id)"
                    >
                      {{ commentSubmitting ? t('commentSaving') : t('commentSave') }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <p v-if="thread.root.comment.trim()">{{ thread.root.comment }}</p>
              <div v-if="thread.root.images.length" class="device-comment-gallery">
                <a
                  v-for="image in thread.root.images"
                  :key="`root-image-${thread.root.id}-${image.id}-${image.public_url}`"
                  :href="getCommentImageUrl(image.public_url)"
                  class="device-comment-gallery__item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img :src="getCommentImageUrl(image.public_url)" :alt="t('commentImageAlt')" loading="lazy" />
                </a>
              </div>
              <div class="device-comment-votes">
                <button
                  type="button"
                  class="device-comment-vote"
                  :class="{ active: thread.root.my_vote === 'like' }"
                  :disabled="!canVote || isVotePending(thread.root.id)"
                  @click="toggleVote(thread.root, 'like')"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.956 1.745C7.021.81 7.908.081 8.864.325l.261.067c.864.221 1.582.928 1.73 1.812.225 1.341.394 3.154.136 5.088h2.502a1.5 1.5 0 0 1 1.444 1.906l-1.203 4.811A2 2 0 0 1 11.794 15H5.153a1 1 0 0 1-.909-.584L2.99 11.694V14.5a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-6a.5.5 0 0 1 .5-.5h1.994a.5.5 0 0 1 .5.5v.362l1.333-2.666c.11-.223.22-.445.315-.665.4-.927.708-1.82.815-2.94Z"/></svg>
                  <span>{{ thread.root.likes_count }}</span>
                </button>
                <button
                  type="button"
                  class="device-comment-vote"
                  :class="{ active: thread.root.my_vote === 'dislike' }"
                  :disabled="!canVote || isVotePending(thread.root.id)"
                  @click="toggleVote(thread.root, 'dislike')"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.956 14.255c.065.935.952 1.664 1.908 1.42l.261-.067c.864-.221 1.582-.928 1.73-1.812.225-1.341.394-3.154.136-5.088h2.502a1.5 1.5 0 0 0 1.444-1.906L13.734 1.99A2 2 0 0 0 11.794 1H5.153a1 1 0 0 0-.909.584L2.99 4.306V1.5a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h1.994a.5.5 0 0 0 .5-.5v-.362l1.333 2.666c.11.223.22.445.315.665.4.927.708 1.82.815 2.94Z"/></svg>
                  <span>{{ thread.root.dislikes_count }}</span>
                </button>
              </div>
              <div class="device-comment-actions-row">
                <button
                  v-if="status === 'authenticated'"
                  type="button"
                  class="device-comment-link"
                  @click="toggleReplyForm(thread.root.id, thread.root.id)"
                >
                  {{ activeReplyAnchorId === thread.root.id ? t('commentCancel') : t('commentReply') }}
                </button>
                <div v-if="canManageComment(thread.root)" class="device-comment-actions device-comment-actions--inline">
                  <button type="button" class="device-comment-link" @click="startEdit(thread.root)">
                    {{ t('commentEdit') }}
                  </button>
                  <button
                    type="button"
                    class="device-comment-link device-comment-link--danger"
                    :disabled="deletingCommentId === thread.root.id"
                    @click="removeComment(thread.root)"
                  >
                    {{ deletingCommentId === thread.root.id ? t('commentDeleting') : t('commentDelete') }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>

        <form
          v-if="status === 'authenticated' && activeReplyAnchorId === thread.root.id"
          class="device-reply-form"
          @submit.prevent="submitReply()"
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
              <p class="device-comment-form__hint">{{ t('commentReplyHint') }}</p>
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

        <div v-if="thread.replies.length" class="device-comment-replies">
          <template v-for="reply in thread.replies" :key="reply.id">
            <article
              class="device-comment-card device-comment-card--reply"
              :class="{ 'device-comment-card--own': isOwnComment(reply) }"
            >
              <div class="device-comment-card__avatar device-comment-card__avatar--reply">
                <img
                  v-if="getCommentAvatarUrl(reply)"
                  :src="resolveAvatarUrl(getCommentAvatarUrl(reply) || '')"
                  :alt="reply.user_name"
                  loading="lazy"
                />
                <span v-else>{{ getUserInitials(reply.user_name) }}</span>
              </div>
              <div class="device-comment-card__body">
                <div class="device-comment-card__meta">
                  <div class="device-comment-card__author-line">
                    <strong>{{ reply.user_name || t('commentAnonymous') }}</strong>
                    <span v-if="isOwnComment(reply)" class="device-comment-card__author-badge">{{ t('commentOwnBadge') }}</span>
                    <span v-if="reply.rating !== null" class="device-comment-card__rating-inline" :aria-label="`${reply.rating} / 5`">
                      {{ renderStars(reply.rating) }}
                    </span>
                  </div>
                  <span class="device-comment-card__time">{{ formatCommentDate(reply.updated_at || reply.created_at) }}</span>
                </div>

                <template v-if="editingCommentId === reply.id">
                  <div class="device-comment-edit">
                    <div class="device-rating-editor">
                      <button
                        v-for="value in 5"
                        :key="`edit-reply-rating-${reply.id}-${value}`"
                        type="button"
                        class="device-rating-star"
                        :class="{ active: (editDraftRating || 0) >= value }"
                        @click="setEditRating(value)"
                      >
                        ★
                      </button>
                      <button type="button" class="device-rating-clear" @click="setEditRating(null)">
                        {{ t('commentRatingClear') }}
                      </button>
                    </div>
                    <textarea
                      v-model="editDraftComment"
                      class="device-comment-form__input"
                      :maxlength="commentMaxLength"
                      rows="4"
                    ></textarea>
                    <p class="device-comment-form__replacement-hint">{{ t('commentImagesReplaceHint') }}</p>
                    <input
                      :key="editFileInputKey"
                      class="device-comment-form__file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      @change="onEditFilesChange"
                    />
                    <div v-if="editingComment?.images.length && !editPreviews.length" class="device-comment-gallery device-comment-gallery--current">
                      <a
                        v-for="image in editingComment.images"
                        :key="`existing-edit-reply-${image.id}`"
                        :href="getCommentImageUrl(image.public_url)"
                        class="device-comment-gallery__item"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img :src="getCommentImageUrl(image.public_url)" :alt="t('commentImageAlt')" loading="lazy" />
                      </a>
                    </div>
                    <div v-if="editPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
                      <div v-for="preview in editPreviews" :key="preview.url" class="device-comment-gallery__item">
                        <img :src="preview.url" :alt="preview.name" />
                      </div>
                    </div>
                    <div class="device-comment-form__footer">
                      <div class="device-comment-form__meta-panel">
                        <p class="device-comment-form__hint">{{ t('commentSubmitHint') }}</p>
                        <p class="device-comment-form__counter">{{ editDraftLength }}/{{ commentMaxLength }}</p>
                      </div>
                      <div class="device-comment-actions">
                        <button type="button" class="device-access-panel__secondary" @click="cancelEdit">
                          {{ t('commentCancel') }}
                        </button>
                        <button
                          type="button"
                          class="device-access-panel__primary"
                          :disabled="commentSubmitting || !canSubmitEdit"
                          @click="saveEdit(reply.id)"
                        >
                          {{ commentSubmitting ? t('commentSaving') : t('commentSave') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <p v-if="reply.comment.trim()">{{ reply.comment }}</p>
                  <div v-if="reply.images.length" class="device-comment-gallery">
                    <a
                      v-for="image in reply.images"
                      :key="`reply-image-${reply.id}-${image.id}-${image.public_url}`"
                      :href="getCommentImageUrl(image.public_url)"
                      class="device-comment-gallery__item"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img :src="getCommentImageUrl(image.public_url)" :alt="t('commentImageAlt')" loading="lazy" />
                    </a>
                  </div>
                  <div class="device-comment-votes">
                    <button
                      type="button"
                      class="device-comment-vote"
                      :class="{ active: reply.my_vote === 'like' }"
                      :disabled="!canVote || isVotePending(reply.id)"
                      @click="toggleVote(reply, 'like')"
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.956 1.745C7.021.81 7.908.081 8.864.325l.261.067c.864.221 1.582.928 1.73 1.812.225 1.341.394 3.154.136 5.088h2.502a1.5 1.5 0 0 1 1.444 1.906l-1.203 4.811A2 2 0 0 1 11.794 15H5.153a1 1 0 0 1-.909-.584L2.99 11.694V14.5a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-6a.5.5 0 0 1 .5-.5h1.994a.5.5 0 0 1 .5.5v.362l1.333-2.666c.11-.223.22-.445.315-.665.4-.927.708-1.82.815-2.94Z"/></svg>
                      <span>{{ reply.likes_count }}</span>
                    </button>
                    <button
                      type="button"
                      class="device-comment-vote"
                      :class="{ active: reply.my_vote === 'dislike' }"
                      :disabled="!canVote || isVotePending(reply.id)"
                      @click="toggleVote(reply, 'dislike')"
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.956 14.255c.065.935.952 1.664 1.908 1.42l.261-.067c.864-.221 1.582-.928 1.73-1.812.225-1.341.394-3.154.136-5.088h2.502a1.5 1.5 0 0 0 1.444-1.906L13.734 1.99A2 2 0 0 0 11.794 1H5.153a1 1 0 0 0-.909.584L2.99 4.306V1.5a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h1.994a.5.5 0 0 0 .5-.5v-.362l1.333 2.666c.11.223.22.445.315.665.4.927.708 1.82.815 2.94Z"/></svg>
                      <span>{{ reply.dislikes_count }}</span>
                    </button>
                  </div>
                  <div class="device-comment-actions-row">
                    <button
                      v-if="status === 'authenticated'"
                      type="button"
                      class="device-comment-link"
                      @click="toggleReplyForm(reply.id, thread.root.id)"
                    >
                      {{ activeReplyAnchorId === reply.id ? t('commentCancel') : t('commentReply') }}
                    </button>
                    <div v-if="canManageComment(reply)" class="device-comment-actions device-comment-actions--inline">
                      <button type="button" class="device-comment-link" @click="startEdit(reply)">
                        {{ t('commentEdit') }}
                      </button>
                      <button
                        type="button"
                        class="device-comment-link device-comment-link--danger"
                        :disabled="deletingCommentId === reply.id"
                        @click="removeComment(reply)"
                      >
                        {{ deletingCommentId === reply.id ? t('commentDeleting') : t('commentDelete') }}
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </article>
            <form
              v-if="status === 'authenticated' && activeReplyAnchorId === reply.id"
              class="device-reply-form device-reply-form--nested"
              @submit.prevent="submitReply()"
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
                  <p class="device-comment-form__hint">{{ t('commentReplyHint') }}</p>
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
          </template>
        </div>
      </article>
    </div>
    <p v-else class="device-access-panel__empty">{{ t('commentsEmpty') }}</p>

    <form v-if="status === 'authenticated'" class="device-comment-form" @submit.prevent="submitComment">
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
          <p class="device-comment-form__hint">{{ t('commentSubmitHint') }}</p>
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
  type DeviceComment,
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

const { status, user } = useCloudAuth()

const comments = ref<DeviceComment[]>([])
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

const editDraftComment = ref('')
const editDraftRating = ref<number | null>(null)
const editFiles = ref<File[]>([])
const editPreviews = ref<PreviewImage[]>([])
const editFileInputKey = ref(0)
const editingCommentId = ref<number | null>(null)

const votePendingIds = ref<number[]>([])
const actionMessage = ref('')
const commentMaxLength = 2000
const maxImagesPerComment = 5
const maxImageSizeBytes = 5 * 1024 * 1024
const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

const normalizedDeviceId = computed(() => props.deviceId)
const commentDraftLength = computed(() => commentDraft.value.length)
const editDraftLength = computed(() => editDraftComment.value.length)
const canVote = computed(() => status.value === 'authenticated')
const threads = computed(() => buildCommentThreads(comments.value))
const editingComment = computed(() => comments.value.find((comment) => comment.id === editingCommentId.value) ?? null)
const canSubmitComment = computed(() => isValidCommentPayload(commentDraft.value, commentRating.value, commentFiles.value.length))
const canSubmitReply = computed(() => hasPayload(replyDraft.value, null, replyFiles.value.length))
const canSubmitEdit = computed(() => {
  const currentImagesCount = editingComment.value?.images.length ?? 0
  return hasPayload(editDraftComment.value, editDraftRating.value, editFiles.value.length || currentImagesCount)
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

function pluralizeComments(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return props.t('commentsCountOne')
  }
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return props.t('commentsCountFew')
  }
  return props.t('commentsCountMany')
}

function pluralizeRatings(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return props.t('ratingsCountOne')
  }
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return props.t('ratingsCountFew')
  }
  return props.t('ratingsCountMany')
}

function normalizeRatingInput(rating: number | null) {
  return rating === null ? null : Math.min(5, Math.max(1, rating))
}

function hasPayload(comment: string, rating: number | null, imagesCount: number) {
  const trimmed = comment.trim()
  const normalizedRating = normalizeRatingInput(rating)
  return (trimmed.length > 0 || normalizedRating !== null || imagesCount > 0) && trimmed.length <= commentMaxLength
}

function isValidCommentPayload(comment: string, rating: number | null, imagesCount: number) {
  return hasPayload(comment, rating, imagesCount)
}

function mapCommentError(err: unknown): string {
  if (err instanceof CommunityApiError) {
    switch (err.code) {
      case 'not_authenticated':
        return props.t('communityAuthRequired')
      case 'invalid_device_id':
        return props.t('communityInvalidDeviceId')
      case 'invalid_parent_comment':
        return props.t('communityInvalidParentComment')
      case 'reply_device_mismatch':
        return props.t('communityReplyDeviceMismatch')
      case 'reply_depth_not_allowed':
        return props.t('communityReplyDepthNotAllowed')
      case 'invalid_rating':
        return props.t('communityInvalidRating')
      case 'invalid_vote':
        return props.t('communityInvalidVote')
      case 'unsupported_image_type':
        return props.t('communityUnsupportedImageType')
      case 'image_too_large':
        return props.t('communityImageTooLarge')
      case 'too_many_images':
        return props.t('communityTooManyImages')
      case 'comment_forbidden':
        return props.t('communityCommentForbidden')
      case 'comment_not_found':
        return props.t('communityCommentNotFound')
      case 'auth_service_unavailable':
        return props.t('communityAuthServiceUnavailable')
      case 'comment_or_rating_required':
        return props.t('communityCommentOrRatingRequired')
      case 'invalid_comment':
      case 'device_not_found':
        return props.t('communityValidationError')
      default:
        return props.t('communityRequestFailed')
    }
  }

  return props.t('communityRequestFailed')
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

function formatCommentDate(value: string) {
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
  return (name || props.t('commentAnonymous'))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function getCommentAvatarUrl(comment: DeviceComment) {
  if (comment.avatarUrl) {
    return comment.avatarUrl
  }

  if (isOwnComment(comment) && user.value?.avatarUrl) {
    return user.value.avatarUrl
  }

  return null
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

function isOwnComment(comment: DeviceComment) {
  return Boolean(user.value?.id) && String(comment.cloud_user_id ?? '') === String(user.value?.id)
}

function canManageComment(comment: DeviceComment) {
  return status.value === 'authenticated' && isOwnComment(comment)
}

function setCreateRating(rating: number | null) {
  commentRating.value = normalizeRatingInput(rating)
}

function setEditRating(rating: number | null) {
  editDraftRating.value = normalizeRatingInput(rating)
}

function getCommentImageUrl(publicUrl: string) {
  return resolveCommunityAssetUrl(publicUrl)
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
    throw new Error(props.t('communityTooManyImages'))
  }

  for (const file of files) {
    if (!allowedImageMimeTypes.includes(file.type)) {
      throw new Error(props.t('communityUnsupportedImageType'))
    }

    if (file.size > maxImageSizeBytes) {
      throw new Error(props.t('communityImageTooLarge'))
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
    actionMessage.value = err instanceof Error ? err.message : props.t('communityRequestFailed')
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
    actionMessage.value = err instanceof Error ? err.message : props.t('communityRequestFailed')
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
    actionMessage.value = err instanceof Error ? err.message : props.t('communityRequestFailed')
  }
}

function resetCreateForm() {
  commentDraft.value = ''
  commentRating.value = null
  clearCreateFiles()
}

function toggleReplyForm(anchorId: number, parentId: number) {
  if (activeReplyAnchorId.value === anchorId) {
    cancelReplyForm()
    return
  }

  activeReplyAnchorId.value = anchorId
  activeReplyParentId.value = parentId
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

function startEdit(comment: DeviceComment) {
  editingCommentId.value = comment.id
  editDraftComment.value = comment.comment
  editDraftRating.value = comment.rating
  clearEditFiles()
  actionMessage.value = ''
}

function cancelEdit() {
  editingCommentId.value = null
  editDraftComment.value = ''
  editDraftRating.value = null
  clearEditFiles()
}

async function submitComment() {
  if (!canSubmitComment.value || normalizedDeviceId.value === null) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceComment({
      deviceId: normalizedDeviceId.value,
      comment: commentDraft.value,
      rating: commentRating.value,
      images: commentFiles.value,
    })
    resetCreateForm()
    actionMessage.value = props.t('commentSubmitSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function submitReply() {
  if (!canSubmitReply.value || normalizedDeviceId.value === null || activeReplyParentId.value === null) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  replySubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceComment({
      deviceId: normalizedDeviceId.value,
      parentId: activeReplyParentId.value,
      comment: replyDraft.value,
      images: replyFiles.value,
    })
    cancelReplyForm()
    actionMessage.value = props.t('commentReplySuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    replySubmitting.value = false
  }
}

async function saveEdit(commentId: number) {
  if (!canSubmitEdit.value) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    await updateDeviceComment({
      commentId,
      comment: editDraftComment.value,
      rating: editDraftRating.value,
      images: editFiles.value,
    })
    cancelEdit()
    actionMessage.value = props.t('commentUpdateSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function removeComment(comment: DeviceComment) {
  if (!window.confirm(props.t('commentDeleteConfirm'))) {
    return
  }

  deletingCommentId.value = comment.id
  actionMessage.value = ''

  try {
    await deleteDeviceComment(comment.id)
    actionMessage.value = props.t('commentDeleteSuccess')
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

function patchVoteState(commentId: number, voteState: { likes_count: number; dislikes_count: number; my_vote: CommentVote | null }) {
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

async function toggleVote(comment: DeviceComment, nextVote: CommentVote) {
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
  clearCreateFiles()
  clearReplyFiles()
  clearEditFiles()
})
</script>

<style scoped>
.device-access-panel {
  margin-top: 24px;
}

.device-access-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.device-access-panel__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-access-panel__title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  line-height: 21px;
  font-weight: 600;
}

.device-access-panel__count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.device-access-panel__aggregate {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.device-access-panel__aggregate-rating {
  color: #c47c00;
  font-weight: 700;
}

.device-access-panel__aggregate-meta {
  color: var(--vp-c-text-2);
}

.device-access-panel__primary,
.device-access-panel__secondary,
.device-access-panel__cta,
.device-access-panel__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-1);
  padding: 7px 14px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  box-sizing: border-box;
}

.device-access-panel__primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}

.device-access-panel__secondary,
.device-access-panel__cta,
.device-access-panel__retry {
  background: transparent;
  color: var(--vp-c-brand-1);
}

.device-access-panel__primary:disabled,
.device-access-panel__secondary:disabled,
.device-access-panel__retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.device-access-panel__empty,
.device-comment-form__hint,
.device-access-panel__technical-error,
.device-comment-form__counter,
.device-comment-form__replacement-hint,
.device-access-panel__guest-note {
  color: var(--vp-c-text-2);
}

.device-access-panel__guest-note,
.device-access-panel__message,
.device-access-panel__technical-error,
.device-comment-card p,
.device-comment-form__hint,
.device-comment-form__counter,
.device-comment-form__replacement-hint {
  margin: 0;
}

.device-comment-threads {
  display: grid;
  gap: 18px;
}

.device-comment-thread {
  display: grid;
  gap: 10px;
}

.device-comment-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
}

.device-comment-card--reply {
  grid-template-columns: 32px minmax(0, 1fr);
}

.device-comment-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vp-c-brand-soft), rgba(0, 0, 0, 0.04));
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
}

.device-comment-card__avatar--reply {
  width: 32px;
  height: 32px;
  font-size: 12px;
}

.device-comment-card--own .device-comment-card__avatar {
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.device-comment-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.device-comment-card__body {
  min-width: 0;
}

.device-comment-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.device-comment-card__author-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.device-comment-card__author-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-success-soft);
  color: var(--vp-c-success-1);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
}

.device-comment-card__rating-inline {
  color: #c47c00;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.device-comment-card__time {
  flex: none;
  font-size: 12px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.device-comment-card p {
  line-height: 1.6;
}

.device-comment-replies {
  display: grid;
  gap: 12px;
  margin-left: 52px;
  padding-left: 14px;
  border-left: 1px solid var(--vp-c-divider);
}

.device-comment-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.device-comment-gallery__item {
  display: block;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.device-comment-gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.device-comment-votes {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.device-comment-vote {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
}

.device-comment-vote svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.device-comment-vote.active {
  color: var(--vp-c-brand-1);
}

.device-comment-vote:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.device-comment-actions-row,
.device-comment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-comment-actions-row {
  margin-top: 10px;
  flex-wrap: wrap;
}

.device-comment-actions--inline {
  gap: 10px;
}

.device-comment-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
}

.device-comment-link--danger {
  color: var(--vp-c-danger-1);
}

.device-comment-link:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.device-comment-form,
.device-comment-edit,
.device-reply-form {
  margin-top: 18px;
}

.device-comment-form,
.device-reply-form {
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-divider));
  border-radius: 12px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-1) 3%, transparent), transparent 70%), var(--vp-c-bg);
}

.device-reply-form {
  margin-left: 52px;
}

.device-reply-form--nested {
  margin-left: 44px;
}

.device-comment-form__label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.device-comment-form__rating-row {
  display: grid;
  gap: 8px;
  margin-top: 4px;
}

.device-comment-form__rating-label {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.device-comment-form__input,
.device-comment-form__file-input {
  width: 100%;
  box-sizing: border-box;
}

.device-comment-form__input {
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.device-comment-form__file-input {
  margin-top: 10px;
}

.device-comment-form__replacement-hint {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.5;
}

.device-comment-form__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
}

.device-comment-form__meta-panel {
  display: grid;
  gap: 4px;
}

.device-rating-editor {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.device-rating-editor--create {
  margin-bottom: 0;
}

.device-rating-star {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-divider);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.device-rating-star.active {
  color: #c47c00;
}

.device-rating-clear {
  margin-left: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
}

.device-access-panel__technical-error,
.device-access-panel__message,
.device-access-panel__guest-note {
  margin-top: 14px;
}

.device-access-panel__message {
  color: var(--vp-c-brand-1);
}

.device-access-panel__guest-note a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

@media (max-width: 640px) {
  .device-access-panel__header,
  .device-comment-form__footer,
  .device-comment-card__meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .device-comment-replies,
  .device-reply-form {
    margin-left: 18px;
  }

  .device-comment-actions-row {
    align-items: flex-start;
  }
}
</style>
