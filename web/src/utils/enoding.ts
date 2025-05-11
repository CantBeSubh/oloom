/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const UuidEncoder = require("uuid-encoder")

const encoder = new UuidEncoder()

export const convertUuidToBase36 = (uuid: string): string => {
  if (!uuid) {
    throw new Error("convertUuidToBase62 error: uuid is undefined")
  }
  return encoder.encode(uuid)
}

export const convertBase36ToUuid = (base64Url: string): string => {
  if (!base64Url) {
    throw new Error("convertBase62ToUuid error: base64Url is undefined")
  }
  return encoder.decode(base64Url)
}
