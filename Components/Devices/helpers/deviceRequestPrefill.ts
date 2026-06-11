import type { CreateDeviceRequestPayload } from '../../../.vitepress/theme/api/communityClient'

export interface DeviceRequestPrefill {
  vendor: string
  model: string
  title: string
  description: string
  picture: string
  exposesText: string
  zigbeeModelsText: string
  buyLinksText: string
  notes: string
  pairingNotes: string
  protocol: string
}

export const DEVICE_REQUEST_PREFILL_KEYS = [
  'vendor',
  'manufacturer',
  'model',
  'title',
  'description',
  'picture',
  'image',
  'exposes',
  'capabilities',
  'zigbeeModels',
  'protocol',
  'links',
  'source',
  'notes',
  'pairingNotes',
] as const

function firstNonEmpty(...values: Array<string | null>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function normalizeMultiline(value: string): string {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n')
}

export function createEmptyDeviceRequestPrefill(): DeviceRequestPrefill {
  return {
    vendor: '',
    model: '',
    title: '',
    description: '',
    picture: '',
    exposesText: '',
    zigbeeModelsText: '',
    buyLinksText: '',
    notes: '',
    pairingNotes: '',
    protocol: '',
  }
}

export function normalizeDeviceRequestPrefill(
  raw: Partial<Record<(typeof DEVICE_REQUEST_PREFILL_KEYS)[number], string | null>>,
): DeviceRequestPrefill {
  return {
    vendor: firstNonEmpty(raw.vendor, raw.manufacturer),
    model: firstNonEmpty(raw.model),
    title: firstNonEmpty(raw.title),
    description: firstNonEmpty(raw.description),
    picture: firstNonEmpty(raw.picture, raw.image),
    exposesText: normalizeMultiline(firstNonEmpty(raw.exposes, raw.capabilities)),
    zigbeeModelsText: normalizeMultiline(firstNonEmpty(raw.zigbeeModels)),
    buyLinksText: normalizeMultiline(firstNonEmpty(raw.links, raw.source)),
    notes: firstNonEmpty(raw.notes),
    pairingNotes: firstNonEmpty(raw.pairingNotes),
    protocol: firstNonEmpty(raw.protocol),
  }
}

export function getDeviceRequestPrefillFromSearch(search: string): DeviceRequestPrefill {
  const params = new URLSearchParams(search)

  return normalizeDeviceRequestPrefill({
    vendor: params.get('vendor'),
    manufacturer: params.get('manufacturer'),
    model: params.get('model'),
    title: params.get('title'),
    description: params.get('description'),
    picture: params.get('picture'),
    image: params.get('image'),
    exposes: params.get('exposes'),
    capabilities: params.get('capabilities'),
    zigbeeModels: params.get('zigbeeModels'),
    protocol: params.get('protocol'),
    links: params.get('links'),
    source: params.get('source'),
    notes: params.get('notes'),
    pairingNotes: params.get('pairingNotes'),
  })
}

export function buildDeviceRequestPayload(prefill: DeviceRequestPrefill): CreateDeviceRequestPayload {
  return {
    vendor: prefill.vendor,
    model: prefill.model,
    title: prefill.title,
    description: prefill.description,
    picture: prefill.picture,
    exposes: prefill.exposesText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
    zigbeeModelsText: prefill.zigbeeModelsText,
    buyLinksText: prefill.buyLinksText,
    notes: prefill.notes,
    pairingNotes: prefill.pairingNotes,
    protocol: prefill.protocol,
  }
}
