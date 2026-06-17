import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getModuleFromPath } from "@/lib/logging/moduleFromPath";
import { logUserActivityFireAndForget } from "@/lib/logging/userActivity";

const SESSION_KEY = "mct_session_id";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

interface ActivityTrackerContextValue {
  trackAction: (actionName: string, moduleName?: string, details?: Record<string, unknown>) => void;
}

const ActivityTrackerContext = createContext<ActivityTrackerContextValue>({
  trackAction: () => {},
});

export function ActivityTrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);
  const loginTrackedRef = useRef(false);

  const trackAction = useCallback(
    (actionName: string, moduleName?: string, details?: Record<string, unknown>) => {
      if (!user?.id) return;
      logUserActivityFireAndForget({
        userId: user.id,
        activityType: "action",
        moduleName: moduleName ?? getModuleFromPath(window.location.pathname),
        pagePath: window.location.pathname,
        actionName,
        actionDetails: details,
        sessionId: getSessionId(),
      });
    },
    [user?.id],
  );

  useEffect(() => {
    if (!user?.id) {
      loginTrackedRef.current = false;
      return;
    }

    if (!loginTrackedRef.current) {
      loginTrackedRef.current = true;
      logUserActivityFireAndForget({
        userId: user.id,
        activityType: "login",
        moduleName: "Dashboard",
        pagePath: location.pathname,
        sessionId: getSessionId(),
      });
    }
  }, [user?.id, location.pathname]);

  useEffect(() => {
    if (!user?.id) return;
    if (lastPathRef.current === location.pathname) return;
    lastPathRef.current = location.pathname;

    logUserActivityFireAndForget({
      userId: user.id,
      activityType: "page_view",
      moduleName: getModuleFromPath(location.pathname),
      pagePath: location.pathname,
      sessionId: getSessionId(),
    });
  }, [location.pathname, user?.id]);

  return (
    <ActivityTrackerContext.Provider value={{ trackAction }}>
      {children}
    </ActivityTrackerContext.Provider>
  );
}

export function useActivityTracker(): ActivityTrackerContextValue {
  return useContext(ActivityTrackerContext);
}

export { ActivityActions } from "@/lib/logging/moduleFromPath";
