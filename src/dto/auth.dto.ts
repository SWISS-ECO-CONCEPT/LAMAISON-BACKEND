export interface SignInDto {
    email: string
    password: string
}
export type Role = 'ADMIN' | 'AGENT' | 'PROSPECT'

export interface SignUpDto {
    firstname: string
    email: string
    password: string
    role: Role
}