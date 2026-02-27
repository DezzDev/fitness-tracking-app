const EntryScreen = ({ session, onStart, completed }) => {
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		setTimeout(() => setVisible(true), 50);
	}, []);

	const totalSeries = session.exercises.reduce((a, e) => a + e.sets, 0);

	return (
		<div className="flex flex-col h-full justify-between p-0 transition duration-500 ease
			opacity-0 translate-y-"
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				justifyContent: "space-between",
				padding: "0",
				opacity: visible ? 1 : 0,
				transform: visible ? "none" : "translateY(20px)",
				transition: "opacity 0.5s ease, transform 0.5s ease",
			}}
		>
			{/* Top section */}
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "40px 32px 0",
				}}
			>
				<div
					style={{
						fontFamily: "'Barlow Condensed', sans-serif",
						fontSize: "11px",
						letterSpacing: "4px",
						color: "var(--orange)",
						marginBottom: "16px",
						fontWeight: 600,
					}}
				>
					{completed ? "SESIÓN DEL DÍA" : "SESIÓN PROGRAMADA"}
				</div>

				<div
					style={{
						fontFamily: "'Bebas Neue', cursive",
						fontSize: "clamp(56px, 12vw, 88px)",
						lineHeight: 0.9,
						color: "var(--white)",
						letterSpacing: "2px",
						marginBottom: "8px",
					}}
				>
					{session.name}
				</div>

				<div
					style={{
						fontFamily: "'Barlow Condensed', sans-serif",
						fontSize: "18px",
						color: "var(--gray-mid)",
						letterSpacing: "3px",
						fontWeight: 500,
						marginBottom: "48px",
					}}
				>
					{session.date}
				</div>

				{!completed && (
					<div
						style={{
							borderTop: "1px solid var(--border)",
							borderBottom: "1px solid var(--border)",
							padding: "24px 0",
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "24px",
						}}
					>
						<div>
							<div
								style={{
									fontFamily: "'Bebas Neue', cursive",
									fontSize: "42px",
									color: "var(--white)",
									lineHeight: 1,
								}}
							>
								{session.exercises.length}
							</div>
							<div
								style={{
									fontFamily: "'Barlow Condensed', sans-serif",
									fontSize: "11px",
									letterSpacing: "3px",
									color: "var(--gray-mid)",
									marginTop: "4px",
								}}
							>
								EJERCICIOS
							</div>
						</div>
						<div>
							<div
								style={{
									fontFamily: "'Bebas Neue', cursive",
									fontSize: "42px",
									color: "var(--white)",
									lineHeight: 1,
								}}
							>
								{totalSeries}
							</div>
							<div
								style={{
									fontFamily: "'Barlow Condensed', sans-serif",
									fontSize: "11px",
									letterSpacing: "3px",
									color: "var(--gray-mid)",
									marginTop: "4px",
								}}
							>
								SERIES
							</div>
						</div>
					</div>
				)}

				{completed && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							color: "var(--orange)",
						}}
					>
						<div
							style={{
								width: "8px",
								height: "8px",
								borderRadius: "50%",
								background: "var(--orange)",
							}}
						/>
						<div
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: "13px",
								letterSpacing: "3px",
								fontWeight: 600,
							}}
						>
							COMPLETADO
						</div>
					</div>
				)}
			</div>

			{/* Bottom CTA */}
			<div style={{ padding: "32px" }}>
				{!completed ? (
					<button
						onClick={onStart}
						style={{
							width: "100%",
							background: "var(--orange)",
							border: "none",
							color: "#000",
							fontFamily: "'Bebas Neue', cursive",
							fontSize: "22px",
							letterSpacing: "4px",
							padding: "20px",
							cursor: "pointer",
							transition: "transform 0.1s ease, filter 0.2s ease",
							position: "relative",
							overflow: "hidden",
						}}
						onMouseDown={(e) =>
							(e.currentTarget.style.transform = "scale(0.98)")
						}
						onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
					>
						INICIAR SESIÓN
					</button>
				) : (
					<button
						style={{
							width: "100%",
							background: "transparent",
							border: "1px solid var(--border)",
							color: "var(--gray-light)",
							fontFamily: "'Barlow Condensed', sans-serif",
							fontSize: "14px",
							letterSpacing: "3px",
							padding: "18px",
							cursor: "pointer",
						}}
					>
						VER DETALLE
					</button>
				)}
			</div>
		</div>
	);
};
