import { Sidebar } from "@/src/components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-grow ml-72">
        {children}
      </div>
    </div>
  );
}