import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const MainMenu = lazy(() => import('./components/MainMenu'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const BatchCreate = lazy(() => import('./components/BatchCreate'));
const EditPlayer = lazy(() => import('./components/EditPlayer'));
const EditTeam = lazy(() => import('./components/EditTeam'));
const TeamPanel = lazy(() => import('./components/TeamPanel'));
const RankingDashboard = lazy(() => import('./components/RankingDashboard'));
const GameSettings = lazy(() => import('./components/GameSettings'));
const GameAll = lazy(() => import('./components/GameAll'));
const GameScore = lazy(() => import('./components/GameScore'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/batch-create" element={<BatchCreate />} />
          <Route path="/edit-player/:id" element={<EditPlayer />} />
          <Route path="/edit-team/:id" element={<EditTeam />} />
          <Route path="/team-panel/:teamName" element={<TeamPanel />} />
          <Route path="/ranking" element={<RankingDashboard />} />
          <Route path="/game-settings" element={<GameSettings />} />
          <Route path="/game-all" element={<GameAll />} />
          <Route path="/game-score/:gameId" element={<GameScore />} />
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;