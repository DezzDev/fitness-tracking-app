// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="text-center">
				<h1 className="text-9xl font-bold text-[var(--gray-dark)] font-bebas">404</h1>
				<h2 className="text-3xl font-bold text-foreground mt-4 font-bebas tracking-wide">
					Página no encontrada
				</h2>
				<p className="text-muted-foreground mt-2 mb-8">
					La página que buscas no existe o ha sido movida.
				</p>
				<Link to="/dashboard">
					<Button className="glow-orange-sm hover:glow-orange transition-shadow">
						Volver al Dashboard
					</Button>
				</Link>
			</div>
		</div>
	);
}
