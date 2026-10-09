import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, PermissionAction, ROLE_DEFINITIONS } from '../types/auth';

export const PRESET_PERSONAS: Record<UserRole, UserProfile> = {
  ADMIN: {
    id: 'USR-ADM-001',
    name: 'Dr. S. K. Ramanathan',
    email: 'ramanathan@sdma.gov.in',
    role: 'ADMIN',
    agency: 'State Disaster Management Authority (SDMA)',
    designation: 'Principal Disaster Commissioner',
    badgeId: 'SDMA-CHIEF-01',
    phoneNumber: '+91 94471 20001',
    status: 'ACTIVE',
    createdAt: '2024-01-10T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  INSPECTOR: {
    id: 'USR-INS-042',
    name: 'Insp. Anand Verma',
    email: 'anand.verma@ndrf.gov.in',
    role: 'INSPECTOR',
    agency: 'NDRF 4th Battalion Rapid Response Unit',
    designation: 'Field Inspection Commander',
    badgeId: 'NDRF-INSP-4042',
    phoneNumber: '+91 98840 33412',
    status: 'ACTIVE',
    createdAt: '2024-02-15T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  OPERATOR: {
    id: 'USR-OPS-109',
    name: 'Officer Priya Sharma',
    email: 'priya.sharma@disasterops.in',
    role: 'OPERATOR',
    agency: 'District Disaster Emergency Operations Center',
    designation: 'EOC Operations Controller',
    badgeId: 'DEOC-OPS-109',
    phoneNumber: '+91 94460 77890',
    status: 'ACTIVE',
    createdAt: '2024-03-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  CITIZEN: {
    id: 'USR-CTZ-550',
    name: 'Ravi Kumar',
    email: 'ravi.kumar.volunteer@gmail.com',
    role: 'CITIZEN',
    agency: 'Community Disaster Response Volunteer',
    designation: 'Ward Civil Volunteer',
    badgeId: 'VOL-AP-550',
    phoneNumber: '+91 91760 44521',
    status: 'ACTIVE',
    createdAt: '2024-05-20T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
};

const INITIAL_USERS: UserProfile[] = [
  PRESET_PERSONAS.ADMIN,
  PRESET_PERSONAS.INSPECTOR,
  PRESET_PERSONAS.OPERATOR,
  PRESET_PERSONAS.CITIZEN,
  {
    id: 'USR-INS-043',
    name: 'Sub-Insp. Devendra Singh',
    email: 'devendra.singh@sdrf.gov.in',
    role: 'INSPECTOR',
    agency: 'SDRF High-Altitude Structural Search Team',
    badgeId: 'SDRF-INSP-202',
    phoneNumber: '+91 98765 11223',
    status: 'ACTIVE',
    createdAt: '2024-03-12T00:00:00Z',
    lastLoginAt: '2026-10-08T18:20:00Z',
  },
  {
    id: 'USR-INS-044',
    name: 'Er. Meenakshi Sundaram',
    email: 'meenakshi.pwd@kerala.gov.in',
    role: 'INSPECTOR',
    agency: 'PWD Disaster Structural Integrity Engineers',
    badgeId: 'PWD-ENG-78',
    phoneNumber: '+91 94470 99887',
    status: 'ACTIVE',
    createdAt: '2024-04-05T00:00:00Z',
    lastLoginAt: '2026-10-09T07:15:00Z',
  },
];

interface AuthContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchPersona: (role: UserRole) => void;
  setCurrentUserById: (userId: string) => void;
  addUser: (user: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'>) => UserProfile;
  updateUser: (updated: UserProfile) => void;
  toggleUserStatus: (id: string) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  isRole: (role: UserRole) => boolean;
  hasPermission: (permission: PermissionAction) => boolean;
  getRoleDefinition: () => typeof ROLE_DEFINITIONS[UserRole];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'disasterguard_auth_user_v1';
const USERS_STORAGE_KEY = 'disasterguard_all_users_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return PRESET_PERSONAS.ADMIN;
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  const switchPersona = (role: UserRole) => {
    const persona = PRESET_PERSONAS[role] || PRESET_PERSONAS.ADMIN;
    setCurrentUser(persona);
  };

  const setCurrentUserById = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `USR-${userData.role.substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setAllUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (updated: UserProfile) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const toggleUserStatus = (id: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
          const updated = { ...u, status: nextStatus as 'ACTIVE' | 'DISABLED' };
          if (currentUser.id === id) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(currentUser.role);
  };

  const isRole = (role: UserRole): boolean => {
    return currentUser.role === role;
  };

  const hasPermission = (permission: PermissionAction): boolean => {
    const roleDef = ROLE_DEFINITIONS[currentUser.role];
    if (!roleDef) return false;
    return roleDef.permissions.includes(permission);
  };

  const getRoleDefinition = () => {
    return ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.ADMIN;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchPersona,
        setCurrentUserById,
        addUser,
        updateUser,
        toggleUserStatus,
        hasRole,
        isRole,
        hasPermission,
        getRoleDefinition,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
