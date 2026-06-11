export interface DeviceBuyLink {
  name?: string
  url: string
}

export interface DeviceVendor {
  ID?: string | number
  TITLE?: string
  PICTURE?: string
}

export interface DeviceZigbeeModel {
  manufId?: string
  modelId?: string
}

export interface DeviceItem {
  id?: string | number
  ID?: string | number
  TITLE?: string
  MODEL?: string
  VENDOR?: string | number
  DESCRIPTION?: string
  HAVE_IN_LAB?: string
  PICTURE?: string
  UPDATED_IN?: string
  EXPOSES?: string[]
  ZIGBEE_MODELS?: DeviceZigbeeModel[]
  BUY_LINKS?: DeviceBuyLink[]
  NOTES?: Record<string, string>
  PAIRING_NOTES?: Record<string, string>
}
