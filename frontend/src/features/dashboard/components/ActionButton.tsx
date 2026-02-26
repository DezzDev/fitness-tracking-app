import React from 'react';

interface Props {
	onClick: () => void;
	label: string;
}

const ActionButton: React.FC<Props> = ({ onClick, label }) => {
	return (
		<button
			onClick={onClick}
			className="px-8 py-3 bg-accent text-darkbg font-display text-lg rounded-lg transform active:scale-95 transition-transform duration-100"
		>
			{label}
		</button>
	);
}

export default ActionButton;