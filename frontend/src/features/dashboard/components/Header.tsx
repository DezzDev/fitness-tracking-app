import React from 'react';

const Header: React.FC = () => {
	const xpPercent = 0.65; // Placeholder
	const level = 12;

	return (
		<header className="p-4 bg-darkbg flex flex-col space-y-2">
			<div className="flex justify-between items-center">
				<h1 className="font-display text-2xl">{`Nivel ${level}`}</h1>
				<span className="font-display text-accent">{`${Math.round(xpPercent * 100)}% XP`}</span>
			</div>
			<div className="w-full bg-primaryText/10 h-3 rounded-full overflow-hidden">
				<div
					className="h-3 bg-accent rounded-full transition-all duration-200 ease-in-out"
					style={{ width: `${xpPercent * 100}%` }}
				/>
			</div>
		</header>
	);
}

export default Header;