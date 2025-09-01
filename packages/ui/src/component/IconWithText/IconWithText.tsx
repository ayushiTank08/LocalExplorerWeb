import React from "react";

interface IconWithTextProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  borderLeft?: boolean;
  borderRight?: boolean;
  bgColor?: string;
  onClick?: () => void;
}

const IconWithText: React.FC<IconWithTextProps> = ({
  icon,
  text,
  active = false,
  borderLeft = true,
  borderRight = false,
  bgColor = "",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex h-[88px] min-w-[110px] px-6 py-2 flex-col justify-center items-center gap-1 flex-1 relative cursor-pointer transition-all duration-200 ${borderLeft ? "border-l border-[#5C90C6]" : ""
        } ${borderRight ? "border-r border-[#5C90C6]" : ""} ${bgColor}`}
    >
      {icon}
      <div className="text-[var(--color-background)] text-center font-body text-base font-normal whitespace-nowrap">
        {text}
      </div>

      {active && (
        <img
          src="/assets/Icons/Selected-Icon-Arrow.svg"
          alt="Active Indicator"
          className="w-6 h-2 absolute bottom-0 left-1/2 -translate-x-1/2"
        />
      )}
    </div>

  );
};

export default IconWithText;
