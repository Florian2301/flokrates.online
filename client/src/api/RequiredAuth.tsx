import { Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { refresh, selectAccessToken, selectHasRole } from '../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../store/store';

export default function RequireAuth({
  children,
  role,
}: {
  children: JSX.Element;
  role?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const access = useSelector(selectAccessToken);
  const hasRole = useSelector(selectHasRole(role ?? ''));
  const [triedRefresh, setTriedRefresh] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!access) {
        const r = await dispatch(refresh());
        if (mounted) setTriedRefresh(true);
      } else {
        setTriedRefresh(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [access, dispatch]);

  if (!triedRefresh) return <div style={{ padding: 12 }}>…</div>;

  if (!access) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role && !hasRole) {
    return <div style={{ padding: 12 }}>Kein Zugriff.</div>;
  }
  return children;
}

/*
Nutzung

<Route
  path="/admin"
  element={
    <RequireAuth role="ROLE_ADMIN">
      <AdminPage />
    </RequireAuth>
  }
/>



*/
