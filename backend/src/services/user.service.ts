
import { findByEmail } from "@/repository/user.repository"
import { RegisterInput } from "@/schemas/user.schema";


const createUser = async (userData:RegisterInput) =>{
	const findByEmail(userData.email)
}