export type  AttorneyDetailsContract ={
  ifowner:boolean,
  current: string,
  attorney?: AttorneyDetailsStaffContract
  address: AttorneyDetailsAddressContract
  cases: AttorneyDetailsAddressContract[]
  info: AttorneyDetailsInfoContract,
  staff:AttorneyDetailsStaffContract[]
}

export type  AttorneyDetailsAddressContract ={
  city?: string,
  companyid?: number,
  country?: string,
  fax?: string,
  other?: string,
  otherNumber?: string,
  phone?: string,
  postalCode?: string,
  region?: string,
  roomNumber?: string,
  roomType?: string,
  skype?: string,
  state?: string,
  streetAddress?: string,
  zip?: string,
}

export type  AttorneyDetailsCaseContract ={
  id: number,
  name: string
}

export type  AttorneyDetailsInfoContract ={
  created?: Date,
  id?: number,
  logo?: string,
  name?: string,
  sub?: string,
  tax?: string,
  website?: string
}

export type  AttorneyDetailsStaffContract ={
  SmsNotificationPhoneType?: string,
  email?: string,
  fname?: string,
  id?: string,
  isOwner?: boolean,
  lname?: string,
  masterid?: string,
  phone?: string,
  phoneSecondary?: string,
  position?: string,
  positionDescription?: string,
  roles?: string[],
  timezone?: string,
}
