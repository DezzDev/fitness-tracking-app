import { useState } from "react";
import EntryScreen from "../components/EntryScreen";
import ActiveSession from "../components/ActiveSession";
import CompletionScreen from "../components/CompletionScreen";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const SESSION = {
	id: '1',
	userId: 'user-123',
	templateId: 'template-456',
	title: 'My Workout Session',
	notes: 'This is a sample session note',
	sessionDate: new Date(), // Fecha del entrenamiento
	durationMinutes: 60,  // duración en minutos
	createdAt: new Date(),
	exercises: [
		{
			id: '1',
			sessionId: '1',
			exerciseId: '1',
			orderIndex: 1,
			sets: [
				{
					id: '1',
					sessionExerciseId: '1',
					setNumber: 1,
					reps: 10,
					durationSeconds: 60,
					weight: 80,
					restSeconds: 60,
					notes: 'This is a sample set note',
					createdAt: new Date(),
				},
				{
					id: '2',
					sessionExerciseId: '1',
					setNumber: 2,
					reps: 8,
					durationSeconds: 60,
					weight: 70,
					restSeconds: 60,
					notes: 'This is a sample set note',
					createdAt: new Date(),
				}
			],
			// join with exercise
			exerciseName: 'exercise name',
			exerciseDescription: 'exercise description',
			difficulty: 'medium',
			muscleGroup: 'pectoral',
			type: 'strength',
		},
		{
			id: '2',
			sessionId: '1',
			exerciseId: '2',
			orderIndex: 2,
			sets: [ {
				id: '1',
				sessionExerciseId: '2',
				setNumber: 1,
				reps: 10,
				durationSeconds: 60,
				weight: 80,
				restSeconds: 60,
				notes: 'This is a sample set note',
				createdAt: new Date(),
			} ],
			// join with exercise
			exerciseName: 'exercise name 2',
			exerciseDescription: 'exercise description 2',
			difficulty: 'medium',
			muscleGroup: 'pectoral',
			type: 'strength',
		}
	],
	templateName: 'template name',

};

function DashboardPage() {

	const [ screen, setScreen ] = useState("entry"); // entry | active | complete
	const [ completedSets, setCompletedSets ] = useState<boolean[][] | null>(null);

	const handleStart = () => setScreen("active");
	const handleComplete = (sets: boolean[][]) => {
		setCompletedSets(sets);
		setScreen("complete");
	}
	const handleReturn = () => setScreen("entry-done");

	const renderDashboard = () => {
		switch (screen) {
			case "entry":
				return (
					<EntryScreen
						session={SESSION}
						onStart={handleStart}
						completed={false}
					/>
				);
			case "active":
				return (
					<ActiveSession session={SESSION} onComplete={handleComplete} />
				);
			case "complete":
				return (
					<CompletionScreen
						session={SESSION}
						completedSets={completedSets}
						onReturn={handleReturn}
					/>
				);
			case "entry-done":
				return (
					<EntryScreen
						session={SESSION}
						onStart={handleStart}
						completed={true}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="overflow-hidden font-barlow">
			{/* Main context */}
			<div className="flex-1 overflow-hidden position-relative bg-background">
				hola
				{renderDashboard()}
			</div>
		</div>
	)
}

export default DashboardPage