export interface IdParam {
  serviceId: string;
}

export type IdParams = Promise<IdParam>;

export type PropsJustParams = {
  params: IdParams;
};
