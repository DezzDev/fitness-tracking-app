import React, { useState } from 'react';
import ExerciseMetrics from './ExerciseMetrics';
import ActionButton from './ActionButton';

const mockExercises = [
	{ name: 'Fondos en paralelas', reps: 10, sets: 4 },
	{ name: 'Flexiones declinadas', reps: 15, sets: 3 },
	{ name: 'Pull-ups', reps: 8, sets: 3 },
];

const ExerciseScreen: React.FC = () => {
	const [ currentIndex, setCurrentIndex ] = useState(0);
	const currentExercise = mockExercises[ currentIndex ];

	const nextExercise = () => {
		if (currentIndex < mockExercises.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 bg-darkbg text-center space-y-6">
			<h2 className="font-display text-3xl">{currentExercise.name}</h2>
			{/* <ExerciseMetrics exercise={currentExercise} /> */}
			<ExerciseMetrics />
			<ActionButton onClick={nextExercise} label={currentIndex === mockExercises.length - 1 ? "Finalizar" : "Siguiente"} />
		</div>
	);
}

export default ExerciseScreen;