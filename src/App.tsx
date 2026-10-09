import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PredictionProvider } from './context/PredictionContext';
import { LanguageProvider } from './i18n';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/Dashboard';
import { RiskMapPage } from './pages/RiskMap';
import { PredictionPage } from './pages/Prediction';
import { DroneRescuePage } from './pages/DroneRescue';
import { AiLandScanPage } from './pages/AiLandScan';
import { RainfallPage } from './pages/Rainfall';
import { ImpactAnalysisPage } from './pages/ImpactAnalysis';
import { EvacuationPage } from './pages/Evacuation';
import { AlertsPage } from './pages/Alerts';
import { HistoricalPage } from './pages/Historical';
import { AnalyticsPage } from './pages/Analytics';
import { AdminPage } from './pages/Admin';
import { MissionControlPage } from './pages/MissionControl';
import { DamageAssessmentPage } from './pages/DamageAssessmentPage';
import { DemoTourProvider } from './context/DemoTourContext';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppProvider>
        <PredictionProvider>
          <BrowserRouter>
            <DemoTourProvider>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="mission-control" element={<MissionControlPage />} />
                <Route path="risk-map" element={<RiskMapPage />} />
                <Route path="prediction" element={<PredictionPage />} />
                <Route path="drone-rescue" element={<DroneRescuePage />} />
                <Route path="drone" element={<Navigate to="/drone-rescue" replace />} />
                <Route path="ai-land-scan" element={<AiLandScanPage />} />
                <Route path="land-scan" element={<Navigate to="/ai-land-scan" replace />} />
                <Route path="rainfall" element={<RainfallPage />} />
                <Route path="damage-assessment" element={<DamageAssessmentPage />} />
                <Route path="prioritization" element={<Navigate to="/damage-assessment" replace />} />
                <Route path="damage-prioritization" element={<Navigate to="/damage-assessment" replace />} />
                <Route path="impact-analysis" element={<ImpactAnalysisPage />} />
                <Route path="evacuation" element={<EvacuationPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="historical" element={<HistoricalPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </DemoTourProvider>
        </BrowserRouter>
        </PredictionProvider>
      </AppProvider>
    </LanguageProvider>
  );
};

export default App;
