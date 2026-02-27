

function DashboardPage() {


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
		<div className="h-full w-full overflow-hidden font-barlow">
			{/* Main context */}
			<div className="flex-1 overflow-hidden position-relative bg-background">
			hola
				{renderDashboard()}
			</div>
		</div>
	)
}

export default DashboardPage