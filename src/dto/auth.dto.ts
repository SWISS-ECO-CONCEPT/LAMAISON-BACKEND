export interface SignInDto {
  clerkId: string
}

export type Role = 'ADMIN' | 'AGENT' | 'PROSPECT'

export interface SignUpDto {
  clerkId: string   // l’ID unique retourné par Clerk
  firstname: string
  role: Role
}














// export interface SignInDto {
//     email: string
//     password: string
// }


// export interface SignUpDto {
//     firstname: string
//     email: string
//     password: string
//     role: Role
// }