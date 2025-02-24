import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/GameAll.css";

// 動態載入頁面
const MainMenu = lazy(() => import("./components/MainMenu"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const BatchCreate = lazy(() => import("./components/BatchCreate"));
const EditPlayer = lazy(() => import("./components/EditPlayer"));
const EditTeam = lazy(() => import("./components/EditTeam"));
const TeamPanel = lazy(() => import("./components/TeamPanel"));
const RankingDashboard = lazy(() => import("./components/RankingDashboard"));
const GameSettings = lazy(() => import("./components/GameSettings"));
const GameAll = lazy(() => import("./components/GameAll"));
const GameScore = lazy(() => import("./components/GameScore"));

// 404 頁面
const NotFound = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2>404: 頁面找不到</h2>
    <p>請確認網址是否正確，或返回首頁。</p>
  </div>
);

// Loading 組件
const Loading = () => (
  <div
    style={{
      textAlign: "center",
      color: "#ffffff",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.5rem",
    }}
  >
    載入中...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<MainMenu />} exact />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/batch-create" element={<BatchCreate />} />
          <Route path="/edit-player/:id" element={<EditPlayer />} />
          <Route path="/edit-team/:id" element={<EditTeam />} />
          <Route path="/team-panel/:teamName" element={<TeamPanel />} />
          <Route path="/ranking" element={<RankingDashboard />} />
          <Route path="/game-settings" element={<GameSettings />} />
          <Route path="/game-all" element={<GameAll />} />
          <Route path="/game-score/:gameId" element={<GameScore />} />
          {/* 404 錯誤處理 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;