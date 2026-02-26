import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import TemplatesPage from './components/TemplatesPage';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import StatsPage from './components/StatsPage';

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<MainLayout />}>
					<Route index element={<Navigate to="/dashboard" replace />} />
					<Route path="dashboard" element={<Dashboard />} />
					<Route path="templates" element={<TemplatesPage />} />
					<Route path="history" element={<HistoryPage />} />
					<Route path="profile" element={<ProfilePage />} />
					<Route path="stats" element={<StatsPage />} />
				</Route>
				<Route path="*" element={<Navigate to="/dashboard" replace />} />
			</Routes>
		</Router>
	);
};

export default App;