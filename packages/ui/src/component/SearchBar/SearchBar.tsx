import * as React from "react"
import { cn } from "../../utils"

export interface SearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
  icon?: React.ReactNode
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, icon, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded bg-[var(--color-background)] bg-opacity-80 p-3 relative",
          containerClassName
        )}
      >
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent text-text-neutral-dark font-body text-sm font-normal placeholder-opacity-40 focus:outline-none",
            className
          )}
          {...props}
        />
        <div className="flex items-center gap-2">
          {icon || (
            <img src="/assets/Icons/Search.svg" alt="Search" className="w-4 h-4" />
          )}
        </div>
      </div>
    )
  }
)
SearchBar.displayName = "SearchBar"

export default SearchBar;
