export interface SignInDto {
    email: string
    password: string
}
export type Role = 'ADMIN'

export interface SignUpDto {
    name: string
    email: string
    password: string
    role: Role
}