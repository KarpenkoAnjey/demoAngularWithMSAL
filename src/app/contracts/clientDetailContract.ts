export type ClientDetailsContract = {
  attrid: string,
  clientCreated: Date,
  clientEmail: string,
  clientFlags: string[],
  clientUpn: string,
  clientid: string,
  lang: string,
  contacts:ClientDetailsContactsContract,
  personalInfo: ClientDetailsPersonalContract,
  registrationDate: Date
}

export type ClientDetailsContactsContract ={
  email : string,
  faxNumber?: string,
  phoneNumber?: string,
  primaryEmailIsValid: boolean,
  primaryValidationEmailDate?: Date,
  publicEmail?: string,
  publicEmailIsValid?: string,
  publicValidationEmailDate?: Date,
  secondaryPhoneNumber: string,
  skype?: string,
  smsNotificationPhoneType?: string,
}

export type ClientDetailsPersonalContract ={
  fname?: string,
  lang?: string,
  lname?: string,
  mname?: string
}
