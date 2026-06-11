import type { DeviceRequestPayload } from '../../../.vitepress/theme/api/communityClient'

export interface DeviceRequestPrefill {
  vendor: string
  model: string
  description: string
  updatedIn: string
  exposes: string
  powerSource: string
  source: string
  ieeeAddr: string
  manufacturerName: string
  modelId: string
  manufId: string
  endpoints: string
  clusters: string
  interview: string
  rawPayload: string
}

export interface DeviceRequestPrefillResult {
  values: DeviceRequestPrefill
  warnings: string[]
}

const EMPTY_JSON_ARRAY = '[]'
const EMPTY_JSON_OBJECT = '{}'

export const DEVICE_REQUEST_PREFILL_KEYS = [
  'vendor',
  'model',
  'description',
  'updated_in',
  'updatedIn',
  'exposes',
  'power_source',
  'powerSource',
  'source',
  'ieee_addr',
  'ieeeAddr',
  'manufacturer_name',
  'manufacturerName',
  'model_id',
  'modelId',
  'manuf_id',
  'manufId',
  'endpoints',
  'clusters',
  'interview',
  'raw_payload',
  'rawPayload',
] as const

type DeviceRequestPrefillKey = (typeof DEVICE_REQUEST_PREFILL_KEYS)[number]

function firstNonEmpty(...values: Array<string | null>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function parseJsonString<T>(
  rawValue: string,
  fallback: T,
  warningKey: string,
  warnings: string[],
  validate: (value: unknown) => value is T,
): T {
  if (!rawValue.trim()) {
    return fallback
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    if (validate(parsed)) {
      return parsed
    }
  } catch {
    // fall through to warning below
  }

  warnings.push(warningKey)
  return fallback
}

function normalizeJsonField<T>(
  rawValue: string,
  fallback: T,
  warningKey: string,
  warnings: string[],
  validate: (value: unknown) => value is T,
): string {
  const parsed = parseJsonString(rawValue, fallback, warningKey, warnings, validate)
  return JSON.stringify(parsed, null, 2)
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createEmptyDeviceRequestPrefill(): DeviceRequestPrefill {
  return {
    vendor: '',
    model: '',
    description: '',
    updatedIn: '',
    exposes: '',
    powerSource: '',
    source: 'gateway',
    ieeeAddr: '',
    manufacturerName: '',
    modelId: '',
    manufId: '',
    endpoints: EMPTY_JSON_ARRAY,
    clusters: EMPTY_JSON_ARRAY,
    interview: EMPTY_JSON_OBJECT,
    rawPayload: EMPTY_JSON_OBJECT,
  }
}

export function normalizeDeviceRequestPrefill(
  raw: Partial<Record<DeviceRequestPrefillKey, string | null>>,
): DeviceRequestPrefillResult {
  const warnings: string[] = []
  const values: DeviceRequestPrefill = {
    vendor: firstNonEmpty(raw.vendor),
    model: firstNonEmpty(raw.model),
    description: firstNonEmpty(raw.description),
    updatedIn: firstNonEmpty(raw.updatedIn, raw.updated_in),
    exposes: firstNonEmpty(raw.exposes),
    powerSource: firstNonEmpty(raw.powerSource, raw.power_source),
    source: firstNonEmpty(raw.source) || 'gateway',
    ieeeAddr: firstNonEmpty(raw.ieeeAddr, raw.ieee_addr),
    manufacturerName: firstNonEmpty(raw.manufacturerName, raw.manufacturer_name),
    modelId: firstNonEmpty(raw.modelId, raw.model_id),
    manufId: firstNonEmpty(raw.manufId, raw.manuf_id),
    endpoints: normalizeJsonField(
      firstNonEmpty(raw.endpoints) || EMPTY_JSON_ARRAY,
      [],
      'requestPrefillInvalidEndpoints',
      warnings,
      isArray,
    ),
    clusters: normalizeJsonField(
      firstNonEmpty(raw.clusters) || EMPTY_JSON_ARRAY,
      [],
      'requestPrefillInvalidClusters',
      warnings,
      isArray,
    ),
    interview: normalizeJsonField(
      firstNonEmpty(raw.interview) || EMPTY_JSON_OBJECT,
      {},
      'requestPrefillInvalidInterview',
      warnings,
      isRecord,
    ),
    rawPayload: normalizeJsonField(
      firstNonEmpty(raw.rawPayload, raw.raw_payload) || EMPTY_JSON_OBJECT,
      {},
      'requestPrefillInvalidRawPayload',
      warnings,
      isRecord,
    ),
  }

  return {
    values,
    warnings,
  }
}

export function getDeviceRequestPrefillFromSearch(search: string): DeviceRequestPrefillResult {
  const params = new URLSearchParams(search)

  return normalizeDeviceRequestPrefill({
    vendor: params.get('vendor'),
    model: params.get('model'),
    description: params.get('description'),
    updated_in: params.get('updated_in'),
    updatedIn: params.get('updatedIn'),
    exposes: params.get('exposes'),
    power_source: params.get('power_source'),
    powerSource: params.get('powerSource'),
    source: params.get('source'),
    ieee_addr: params.get('ieee_addr'),
    ieeeAddr: params.get('ieeeAddr'),
    manufacturer_name: params.get('manufacturer_name'),
    manufacturerName: params.get('manufacturerName'),
    model_id: params.get('model_id'),
    modelId: params.get('modelId'),
    manuf_id: params.get('manuf_id'),
    manufId: params.get('manufId'),
    endpoints: params.get('endpoints'),
    clusters: params.get('clusters'),
    interview: params.get('interview'),
    raw_payload: params.get('raw_payload'),
    rawPayload: params.get('rawPayload'),
  })
}

export function buildDeviceRequestPayload(prefill: DeviceRequestPrefill): DeviceRequestPayload {
  const warnings: string[] = []
  const powerSourceNumber = Number(prefill.powerSource)

  return {
    vendor: prefill.vendor.trim(),
    model: prefill.model.trim(),
    description: prefill.description.trim(),
    updatedIn: prefill.updatedIn.trim(),
    exposes: prefill.exposes.trim(),
    powerSource: prefill.powerSource.trim() && Number.isFinite(powerSourceNumber) ? powerSourceNumber : null,
    source: prefill.source.trim() || 'gateway',
    ieeeAddr: prefill.ieeeAddr.trim(),
    manufacturerName: prefill.manufacturerName.trim(),
    modelId: prefill.modelId.trim(),
    manufId: prefill.manufId.trim(),
    endpoints: parseJsonString(prefill.endpoints, [], 'requestPrefillInvalidEndpoints', warnings, isArray),
    clusters: parseJsonString(prefill.clusters, [], 'requestPrefillInvalidClusters', warnings, isArray),
    interview: parseJsonString(prefill.interview, {}, 'requestPrefillInvalidInterview', warnings, isRecord),
    rawPayload: parseJsonString(prefill.rawPayload, {}, 'requestPrefillInvalidRawPayload', warnings, isRecord),
  }
}

export function getDeviceRequestPayloadWarnings(prefill: DeviceRequestPrefill): string[] {
  const warnings: string[] = []

  parseJsonString(prefill.endpoints, [], 'requestPrefillInvalidEndpoints', warnings, isArray)
  parseJsonString(prefill.clusters, [], 'requestPrefillInvalidClusters', warnings, isArray)
  parseJsonString(prefill.interview, {}, 'requestPrefillInvalidInterview', warnings, isRecord)
  parseJsonString(prefill.rawPayload, {}, 'requestPrefillInvalidRawPayload', warnings, isRecord)

  return warnings
}
