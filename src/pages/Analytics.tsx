import { Navigate, useParams } from "react-router-dom";

/**
 * /analytics/:role redirects to the role's real analytics surface:
 * - kid     → /hub/kid           (PracticeAnalytics from DB)
 * - parent  → /hub/parent        (PracticeAnalytics from DB)
 * - teacher → /hub/teacher       (classroom analytics)
 * - therapist → /therapist-analytics (consolidated clinical dashboard)
 */
const Analytics = () => {
  const { role } = useParams();

  switch (role) {
    case "kid":
      return <Navigate to="/hub/kid" replace />;
    case "parent":
      return <Navigate to="/hub/parent" replace />;
    case "teacher":
      return <Navigate to="/hub/teacher" replace />;
    case "therapist":
      return <Navigate to="/therapist-analytics" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default Analytics;
