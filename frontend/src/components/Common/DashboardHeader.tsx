import React from 'react';
import { Container as Logo } from "@/src/components/Common/Logo";
import AccountMenuButton from '@/src/components/navigation/AccountMenuButton';

interface DashboardHeaderProps {
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ subtitle }) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center">
          <Logo brand={false} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">SYNERGY MATCH MAKER</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <AccountMenuButton fixed={false} />
      </div>
    </div>
  </div>
);

export default DashboardHeader;
