import React from 'react';
import Header from '../components/Header';
import ExerciseScreen from '../components/ExerciseScreen';
// import WeeklySummary from './WeeklySummary';
// import Achievements from './Achievements';

const Dashboard: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen w-full overflow-hidden">
			<Header />

			<main className="flex-1">
				<ExerciseScreen />
			</main>

			<section className="px-4 py-2">
				{/* <WeeklySummary />
				<Achievements /> */}
			</section>
		</div>
	);
}

export default Dashboard;