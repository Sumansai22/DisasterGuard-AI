import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface BreadcrumbsProps {
  items?: { label: string; path?: string }[];
}

const ROUTE_KEYS: Record<string, { key: string; fallback: string }> = {
  '': { key: 'nav.overview', fallback: 'Overview' },
  'damage-assessment': { key: 'nav.damageAssessment', fallback: 'Damage Assessment' },
  'risk-map': { key: 'nav.mapGis', fallback: 'Map & GIS' },
  'priorities': { key: 'nav.priorities', fallback: 'Inspection Priorities' },
  'drone-rescue': { key: 'nav.droneRescue', fallback: 'Drone & Rescue' },
  'rainfall': { key: 'nav.weatherRainfall', fallback: 'Weather & Rainfall' },
  'evacuation': { key: 'nav.evacuationShelters', fallback: 'Evacuation & Shelters' },
  'alerts': { key: 'nav.incidentsSos', fallback: 'Incidents & SOS' },
  'mission-control': { key: 'nav.missionControl', fallback: 'Mission Control' },
  'historical': { key: 'nav.reportsHistory', fallback: 'Reports & History' },
  'feedback': { key: 'nav.userFeedback', fallback: 'User Feedback' },
  'analytics': { key: 'nav.analytics', fallback: 'Analytics' },
  'admin': { key: 'nav.adminCenter', fallback: 'Admin Center' },
  'prediction': { key: 'nav.riskPrediction', fallback: 'AI Risk Prediction' },
  'ai-land-scan': { key: 'nav.aiLandScan', fallback: 'AI Land Scan' },
  'impact-analysis': { key: 'nav.impactAnalysis', fallback: 'Impact Analysis' },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const breadcrumbItems = items || (() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: t('nav.overview', 'Overview'), path: '/' }];
    let accPath = '';
    for (const part of parts) {
      accPath += `/${part}`;
      const conf = ROUTE_KEYS[part];
      crumbs.push({
        label: conf ? t(conf.key, conf.fallback) : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
        path: accPath,
      });
    }
    return crumbs;
  })();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <React.Fragment key={item.path || index}>
            {index === 0 ? (
              <Link
                to="/"
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('nav.overview', 'Overview')}</span>
              </Link>
            ) : isLast ? (
              <span className="font-semibold text-slate-800 truncate max-w-[200px]" aria-current="page">
                {item.label}
              </span>
            ) : item.path ? (
              <Link
                to={item.path}
                className="hover:text-slate-800 transition-colors font-medium truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-500 truncate">{item.label}</span>
            )}

            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
