import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExerciseStats } from "../hooks/useExercises";
import { Dumbbell, TrendingUp, Zap, Target } from "lucide-react";

export default function ExerciseStatsBar() {
	const { data: stats, isLoading } = useExerciseStats();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="h-4 w-20 mb-2" />
							<Skeleton className="h-8 w-16" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!stats) return null;

	const totalDifficulty = Object.values(stats.byDifficulty).reduce((a, b) => a + b, 0);
	const totalTypes = Object.values(stats.byType).reduce((a, b) => a + b, 0);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Total de ejercicios */}
			<Card className="hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
							<Dumbbell className="h-6 w-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total</p>
							<p className="text-2xl font-bold text-foreground">{stats.total}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Principiantes */}
			<Card className="hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-[var(--success)]/10 rounded-lg flex items-center justify-center">
							<Target className="h-6 w-6 text-[var(--success)]" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Principiante</p>
							<p className="text-2xl font-bold text-foreground">
								{stats.byDifficulty.beginner || 0}
							</p>
							{totalDifficulty > 0 && (
								<p className="text-xs text-muted-foreground">
									{Math.round((stats.byDifficulty.beginner || 0) / totalDifficulty * 100)}%
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Intermedios */}
			<Card className="hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-[var(--warning)]/10 rounded-lg flex items-center justify-center">
							<TrendingUp className="h-6 w-6 text-[var(--warning)]" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Intermedio</p>
							<p className="text-2xl font-bold text-foreground">
								{stats.byDifficulty.intermediate || 0}
							</p>
							{totalDifficulty > 0 && (
								<p className="text-xs text-muted-foreground">
									{Math.round((stats.byDifficulty.intermediate || 0) / totalDifficulty * 100)}%
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Avanzados */}
			<Card className="hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
							<Zap className="h-6 w-6 text-destructive" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Avanzado</p>
							<p className="text-2xl font-bold text-foreground">
								{stats.byDifficulty.advanced || 0}
							</p>
							{totalDifficulty > 0 && (
								<p className="text-xs text-muted-foreground">
									{Math.round((stats.byDifficulty.advanced || 0) / totalDifficulty * 100)}%
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
