"use client";
import { useEffect } from "react";
import { usePageTitle } from "../../lib/PageTitelCmsContext";
import dynamic from "next/dynamic";
const TableWPM = dynamic(() => import("../../components/cms/ui/Table"), {
  ssr: false, // <== penting
});
export default function CMSDashboard() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  return (
    <div className="overflow-hidden h-full w-full">
      <iframe
        className="w-full h-full"
        style={{ border: 'none', overflow: 'hidden' }}
        src="https://lookerstudio.google.com/embed/reporting/6b7470bd-2ba2-4edd-8ed1-b57e90f8f11d/page/vWHfD"
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  );
}
