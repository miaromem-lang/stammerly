import { Outlet } from "react-router-dom";
import { SiteNavigation } from "./SiteNavigation";
import { Footer } from "./Footer";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNavigation />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default PublicLayout;
