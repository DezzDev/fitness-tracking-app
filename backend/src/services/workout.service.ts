// src/services/workout.service.ts
import { workoutRepository } from "@/repositories/workout.repository";
import { createAppError } from "@/middlewares/error.middleware";
import {
	Workout,
	WorkoutWithExercises,
	WorkoutCreateData,
	WorkoutUpdateData,
	WorkoutFilters
} from "@/types";
import { CreateWorkoutInput, UpdateWorkoutInput } from "@/schemas/workout.schema";
import { handleServiceError } from "@/utils/error.utils";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validar que el usuario sea dueño del workout
 * @param workoutId id del workout
 * @param userId id del usuario
 * @returns Promise(WorkoutWithExercises)
 */
const validateWorkoutOwnership = async (
	workoutId: string,
	userId: string
): Promise<WorkoutWithExercises> => {
	const workout = await workoutRepository.findById(workoutId, userId);

	if (!workout) {
		throw createAppError('Workout not found', 404);
	}

	return workout;
};

/**
 *  Sanitizar workout (elimina campos sensibles si los hubiera)
 * @param workout workout con ejercicios a sanitizar
 * @returns workout con ejercicios sin campos  sensibles
*/
const sanitizeWorkout = (workout: WorkoutWithExercises): WorkoutWithExercises => {
	// Por ahora no hat campos sensibles, pero mantener patrón
	return workout;
}

// ============================================
// SERVICE
// ============================================

export const workoutService = {
	/**
	 * Crear workout
	 * @param userId id del usuario
	 * @input datos del workout a crear (title, notes, ejercicios)
	 * @returns Promise<WorkoutWithExercises>
	 */
	create: async (userId: string, input: CreateWorkoutInput): Promise<WorkoutWithExercises> => {
		try {
			// Convertir input a WorkoutCreateData
			const createData: WorkoutCreateData = {
				userId: userId,
				title: input.title,
				notes: input.notes || undefined,
				exercises: input.exercises
			};

			const workout = await workoutRepository.create(createData);

			return sanitizeWorkout(workout);

		} catch (error) {
			throw handleServiceError(
				error,
				'WorkoutService.create',
				'Unable to create workout',
				{ userId, input }
			)
		}
	},

	/**
	 * Obtener workout por ID
	 * @param workoutId id del workout
	 * @param userId id del usuario
	 * @returns Promise<WorkoutWithExercises>
	 */
	 findById: async (workoutId: string, userId:string): Promise<WorkoutWithExercises> =>{
		const workout = await validateWorkoutOwnership(workoutId, userId);
		return sanitizeWorkout(workout);
	 },

	 /**
		* Listar workouts con filtros
		* @param userId id del usuario
		* @param filters filtros para buscar workouts (startDate, endDate, search)
		* @param page página actual
		* @param limit número de resultados por página
		* @returns Promise<{
		* 	workouts: WorkoutWithExercises[],
		* 	total: number,
		* 	page: number,
		* 	totalPages: number
		* }>
	  */
	 findAll: async (
		userId: string,
		filters: Partial<WorkoutFilters> = {},
		page : number = 1,
		limit: number = 10
	 ): Promise<{
		workouts: WorkoutWithExercises[],
		total: number,
		page: number,
		totalPages: number
	 }> =>{
		// Validación básica
		if (page < 1) page = 1;
		if (limit < 1 || limit > 100) limit = 10;

		// Crear filtros completos
		const completeFilters: WorkoutFilters = {
			userId,
			...filters,
		}

		try{
			// Obtener workouts y total en paralelo
			const [workouts, total] = await Promise.all([
				workoutRepository.findAll(completeFilters, page, limit),
				workoutRepository.count(completeFilters)
			])

			const totalPages = Math.ceil(total / limit);

			return {
				workouts: workouts.map(sanitizeWorkout),
				total,
				page,
				totalPages
			}
		}catch(error){
			throw handleServiceError(
				error,
				'WorkoutService.findAll',
				'Failed to retrieve workouts',
				{ userId, filters }
			)
		}
	 },

	 /** 
		* Actualizar workout
		* @param workoutId id del workout
		* @param userId id del usuario
		* @param input datos del workout a actualizar (title, notes, ejercicios)
		* @returns Promise(WorkoutWithExercises)
	  */
	 update: async (
		workoutId: string,
		userId: string,
		input: UpdateWorkoutInput
	 ): Promise<WorkoutWithExercises>=>{
		
		// Verificar que el workout existe y pertenece al usuario
		await validateWorkoutOwnership(workoutId, userId);

		try{
			// Convertir input a WorkoutUpdateData
			const updateData: WorkoutUpdateData = {
				title: input.title || undefined,
				notes: input.notes || undefined,
				exercises: input.exercises || undefined,
			}

			// Actualizar
			const updateWorkout = await workoutRepository.update(workoutId, userId,updateData)

			return sanitizeWorkout(updateWorkout);
			
		}catch(error){
			throw handleServiceError(
				error,
				'WorkoutService.update',
				'Unable to update workout',
				{ workoutId, userId, input }
			)
		}
	 },

	 /**
		* Eliminar workout
		* @param workoutId id del workout
		* @param userId id del usuario
		* @returns Promise(void)
	  */
	 delete: async (workoutId:string, userId:string): Promise<void>=>{
		// verificar que el workout existe y pertenece al usuario
		await validateWorkoutOwnership(workoutId, userId);

		try{
			// Eliminar
			await workoutRepository.delete(workoutId, userId);
		}catch(error){
			throw handleServiceError(
				error,
				'WorkoutService.delete',
				'Unable to delete workout',
				{ workoutId, userId }
			)
		}
	 },

	 /**
		* Obtener estadísticas de workouts del usuario
		* @param userId id del usuario
		* @param filters filtros para buscar workouts (startDate, endDate, search)
		* @returns Promise {
		* 	totalWorkouts: number,
		* 	totalExercises: number,
		*   averageExercisesPerWorkout: number,
		*   dateRange: {
		*     earliest?: Date,
		*     latest?: Date  
		*   }
		* }
	  */
	 getStats: async(
		userId: string,
		filters: Partial<WorkoutFilters> = {}
	 ): Promise<{
		totalWorkouts: number,
		totalExercises: number,
		averageExercisesPerWorkout: number,
		dateRange: {
			earliest?: Date,
			latest?: Date
		}
	 }> => {
		try{
			const completeFilters: WorkoutFilters = {
				userId,
				...filters
			};

			// Obtener todos los workouts (sin paginación para stats)
			const workouts = await workoutRepository.findAll(completeFilters, 1, 1000);

			if(workouts.length === 0){
				return {
					totalWorkouts: 0,
					totalExercises: 0,
					averageExercisesPerWorkout: 0,
					dateRange: {}
				};
			}

			// Calcular las estadísticas
			const totalExercises = workouts.reduce(
				(sum, workout) => sum + workout.exercises.length,
				0
			);

			const dates = workouts.map((w) => w.createAt).sort((a,b)=> a.getTime() - b.getTime())

			return {
				totalWorkouts: workouts.length,
				totalExercises,
				averageExercisesPerWorkout: Math.round((totalExercises / workouts.length) * 10 ) / 10,
				dateRange: {
					earliest: dates[0],
					latest: dates[dates.length - 1]
				}
			}
		}catch(error){
			throw handleServiceError(
				error,
				'WorkoutService.getStats',
				'Unable to retrieve workout stats',
				{ userId, filters }
			)
		}
	 }

}

