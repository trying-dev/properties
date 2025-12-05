export interface IdParam {
  id: string
}

export type IdParams = Promise<IdParam>

export type PropsJustParams = {
  params: IdParams
}
