import React from "react";

export type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value?: number | string;
  isLoading?: boolean;
  bgColorClassName?: string;
};

export function StatCard({
  icon,
  label,
  value,
  isLoading = false,
  bgColorClassName = "ui:bg-gray-100",
}: StatCardProps) {
  return (
    <div className="ui:bg-white ui:border ui:border-gray-200 ui:rounded-lg ui:p-4 md:ui:p-6 ui:hover:shadow-lg ui:transition-all ui:duration-200 hover:ui:-translate-y-1">
      <div className="ui:flex ui:items-center">
        <div className="ui:flex-shrink-0">
          <div className={`ui:w-12 ui:h-12 ${bgColorClassName} ui:rounded-xl ui:flex ui:items-center ui:justify-center`}>
            {icon}
          </div>
        </div>
        <div className="ui:ml-4">
          <p className="ui:text-sm ui:font-medium ui:text-gray-500">{label}</p>
          {isLoading ? (
            <div className="ui:animate-pulse">
              <div className="ui:h-8 ui:bg-gray-200 ui:rounded ui:w-16" />
            </div>
          ) : (
            <p className="ui:text-3xl ui:font-bold ui:text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatCard;


