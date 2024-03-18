export type  ClientListContract = {
    page: number,
    perPage: number,
    total: number
    clients: ClientListClientContract[]
}

export type ClientListClientContract = {
    id: string,
    firstname: string,
    lastname:string,
    email: string
}