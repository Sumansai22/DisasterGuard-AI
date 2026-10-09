import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items?: { label: string; path?: string }[];
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Overview',
  'damage-assessment': 'Damage Assessment',
  'risk-map': 'Map & GIS',
  'priorities': 'Inspection Priorities',
  'drone-rescue': 'Drone & Rescue',
  'rainfall': 'Weather & Rainfall',
  'evacuation': 'Evacuation & Shelters',
  'alerts': 'Incidents & SOS',
  'mission-control': 'Mission Control',
  'historical': 'Reports & History',
  'analytics': 'Analytics',
  'inspector-workspace': 'Inspector Workspace',
  'portal': 'Citizen Portal',
  'admin': 'Admin Center',
  'prediction': 'AI Risk Prediction',
  'ai-land-scan': 'AI Land Scan',
  'impact-analysis': 'Impact Analysis',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();

  const breadcrumbItems = items || (() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Overview', path: '/' }];
    let accPath = '';
    for (const part of parts) {
      accPath += `/${part}`;
      crumbs.push({
        label: ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
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
                <span>Overview</span>
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
