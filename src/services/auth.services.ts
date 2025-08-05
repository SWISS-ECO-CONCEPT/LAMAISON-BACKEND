import { SignInDto, SignUpDto } from "../dto/auth.dto";
import prisma from "../utils/db";
import * as bcrypt from "bcrypt"

export async function signUp (dto: SignUpDto){
    const {firstname,email, password,role} = dto
    if (!email || !password || !role || !firstname) {
        throw new Error ("some fields are required")
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({

        data: {
            firstname,
            email,
            password: hashPassword,
            role
        }
    })
    return {user: {id: user.id, email: user.email, firstname: user.firstname, role: user.role }}
    
}
export async function signIn (dto: SignInDto){
    const {email, password} = dto
    if (!email || !password) {
        throw new Error ("fields are required")
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.findUnique({where: {email}})
    if (!user || !(await bcrypt.compare(password,user.password))){
        throw new Error ("invalid email or password")
    }
    return {user: {id: user.id, email: user.email }}
}

