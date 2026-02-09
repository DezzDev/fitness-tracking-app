// src/services/workoutTemplate.service.ts
//===================================
// Service
//===================================

import { workoutTemplateRepository } from "@/repositories/workoutTemplate.repository";
import { CreateWorkoutTemplateInput } from "@/schemas/workoutTemplate.schema";
import { WorkoutTemplateWithExercises } from "@/types";
import { handleServiceError } from "@/utils/error.utils";

export const workoutTemplateService = {
	create: async(userId: string, input: CreateWorkoutTemplateInput):Promise<WorkoutTemplateWithExercises> => {
		try {

			const createData= {
				userId,
				...input
			}
			const workoutTemplate = await workoutTemplateRepository.create(createData);
			return workoutTemplate;
			
		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutTemplateService.create',
				'Unable to create workout template',
				{ userId, input }
			)
		}
	}
}