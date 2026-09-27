import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const ROLES = {
  SUPPORT_WORKER: 'SUPPORT_WORKER',
  VICTIM: 'VICTIM',
  ADMIN: 'ADMIN'
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(ROLES.SUPPORT_WORKER);
  const [activeVictimId, setActiveVictimId] = useState('V-1042');
  const [user, setUser] = useState({
    id: 1,
    email: 'worker@sahay.gov.in',
    full_name: 'Radha Krishnan',
    title: 'Senior Protection & Welfare Officer',
    district: 'Chennai Central',
    center: 'One Stop Centre - Royapettah'
  });

  const switchRole = (newRole, victimId = 'V-1042') => {
    setRole(newRole);
    if (newRole === ROLES.SUPPORT_WORKER) {
      setUser({
        id: 1,
        email: 'worker@sahay.gov.in',
        full_name: 'Radha Krishnan',
        title: 'Senior Protection & Welfare Officer',
        district: 'Chennai Central',
        center: 'One Stop Centre - Royapettah'
      });
    } else if (newRole === ROLES.VICTIM) {
      setActiveVictimId(victimId);
      setUser({
        id: 3,
        email: 'victim@sahay.gov.in',
        full_name: `Beneficiary Portal (${victimId})`,
        title: 'Case Beneficiary',
        district: 'Chennai Central',
        center: 'One Stop Centre - Royapettah'
      });
    } else if (newRole === ROLES.ADMIN) {
      setUser({
        id: 2,
        email: 'admin@sahay.gov.in',
        full_name: 'Dr. Sundaramoorthy IAS',
        title: 'District Nodal Officer (Women & Child Safety)',
        district: 'Chennai Central',
        center: 'District Nodal Office'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ role, user, activeVictimId, setActiveVictimId, switchRole, ROLES }}>
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
