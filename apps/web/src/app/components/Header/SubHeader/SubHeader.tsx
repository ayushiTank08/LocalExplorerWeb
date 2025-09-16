import React, { useEffect, useState } from "react";
import { Dropdown, SearchBar, IconWithText, IconButton } from "@nextforge/ui";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchPlaces, fetchRegions, fetchCategories, applyRegion, applySearchText, applySelectedCategoryIds, setSelectedTopCategoryId } from "../../../../store/slices/placesSlice";

interface SubHeaderProps {
  isSearchActive?: boolean;
}

const SubHeader: React.FC<SubHeaderProps> = ({ isSearchActive = false }) => {
  const dispatch = useAppDispatch();
  const { defaultLocation, searchText, regions, selectedRegionId, regionsLoading, categories, selectedTopCategoryId } = useAppSelector((state) => state.places);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState(searchText);

  useEffect(() => {
    if (!regions || regions.length === 0) {
      dispatch(fetchRegions(undefined));
    }
    dispatch(fetchCategories(undefined));
  }, [dispatch]);

  const dropdownOptions = [
    { label: regionsLoading ? "Loading regions..." : "All Regions", value: "0" },
    ...regions.map(r => ({ label: r.Name, value: String(r.Id) })),
  ];

  const categoryIcons = [
    {
      id: "all",
      icon: <img src="/assets/Icons/All-Categories.svg" alt="All-Categories" className="w-6 h-6" />,
      text: "All",
      dbName: null,
    },
    {
      id: "things-to-do",
      icon: <img src="/assets/Icons/Things-To-Do.svg" alt="Things-To-Do" className="w-6 h-6" />,
      text: "Things To Do",
      dbName: "Things To Do",
    },
    {
      id: "where-to-stay",
      icon: <img src="/assets/Icons/Where-To-Stay.svg" alt="Where-To-Stay" className="w-6 h-6" />,
      text: "Where To Stay",
      dbName: "Where To Stay",
    },
    {
      id: "food-drink",
      icon: <img src="/assets/Icons/Food-Drink.svg" alt="Food-Drink" className="w-6 h-6" />,
      text: "Food & Drink",
      dbName: "Food & Drink",
    },
    {
      id: "events",
      icon: <img src="/assets/Icons/Events.svg" alt="Events" className="w-6 h-6" />,
      text: "Events",
      dbName: "Events",
    },
  ];

  const handleDropdownSelect = (value: string) => {
    const regionVal = Number(value);
    dispatch(applyRegion(Number.isFinite(regionVal) ? regionVal : 0));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    const category = categoryIcons.find(c => c.id === categoryId);
    if (!category) return;

    if (category.id === "all") {
      dispatch(setSelectedTopCategoryId(null));
      return;
    }

    const node = categories.find(
      c => c.CategoryName?.toLowerCase() === category.dbName?.toLowerCase()
    );
    if (node) {
      if (
        typeof window !== "undefined" &&
        typeof window.requestAnimationFrame === "function"
      ) {
        window.requestAnimationFrame(() =>
          dispatch(setSelectedTopCategoryId(node.CategoryId))
        );
      } else {
      dispatch(setSelectedTopCategoryId(node.CategoryId));
      }
    }
  };

  const handleSearch = () => {
    dispatch(applySearchText(localSearch));
  };

  const handleClear = () => {
    setLocalSearch("");
    dispatch(applySearchText(""));
  };

  const searchBarIcon = (
    <div className="flex items-center gap-2">
      {localSearch && (
        <IconButton
          type="button"
          onClick={handleClear}
          aria-label="Clear"
        >
          <img src="/assets/Icons/Close.svg" alt="Clear" className="w-4 h-4" />
        </IconButton>
      )}
      <IconButton
        type="button"
        onClick={handleSearch}
        aria-label="Search"
      >
        <img src="/assets/Icons/Search.svg" alt="Search" className="w-4.5 h-4.5" />
      </IconButton>
    </div>
  );

  useEffect(() => {
    if (!selectedTopCategoryId) {
      setSelectedCategory("all");
      return;
    }
    const topNode = categories.find(c => c.CategoryId === selectedTopCategoryId);
    if (!topNode) return;
    const match = categoryIcons.find(ci => ci.dbName && ci.dbName.toLowerCase() === (topNode.CategoryName || '').toLowerCase());
    if (match) setSelectedCategory(match.id);
  }, [selectedTopCategoryId, categories]);

  return (
    <div className="w-full lg:py-2 bg-[var(--color-primary-lighter)]">
      <div id="subheader-container" className="mx-0 lg:mx-6 lg:my-6 my-3 rounded-lg">
        <div className="lg:hidden flex flex-col space-y-3">
          {isSearchActive && (
            <div className="px-3">
              <SearchBar
                placeholder="Search..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                containerClassName="w-full h-11 bg-[var(--color-background)]/80 px-3 rounded-md hover:shadow-md transition-all duration-200 flex items-center"
                className="text-gray-700 placeholder-gray-500 text-[14px] focus:outline-none focus:ring-0"
                icon={searchBarIcon}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
          )}

          <div className="px-3 [&_.relative]:min-w-[200px] [&_.flex]:h-11 [&_.flex]:bg-[var(--color-background)]/80 [&_.flex]:text-gray-700 [&_.flex]:px-4 [&_.flex]:rounded-md [&_.flex]:border-0 [&_.flex]:focus:outline-none [&_.flex]:transition-all [&_.flex]:duration-200 [&_.flex]:cursor-pointer [&_.flex_.text-black]:text-gray-700 [&_.flex_.text-black]:font-medium [&_.flex_.font-body]:text-md [&_.flex_.font-normal]:font-medium [&_.flex_.bg-opacity-80]:bg-opacity-80">
            <Dropdown
              options={dropdownOptions}
              onSelect={handleDropdownSelect}
              placeholder="Select Region"
            />
          </div>

          <div className="flex items-center w-full justify-start overflow-x-auto no-scrollbar gap-0 px-0 bg-[var(--color-primary)]">
            {categoryIcons.map((category, index) => (
              <div
                key={index}
                className={`relative min-w-[124px] text-[var(--color-background)] ${index > 0 ? 'border-l' : ''} border-[#5C90C6]`}
              >
                <IconWithText
                  icon={category.icon}
                  text={category.text}
                  active={selectedCategory === category.id}
                  bgColor={selectedCategory === category.id ? "bg-[var(--color-primary-dark)]" : ""}
                  onClick={() => handleCategorySelect(category.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between h-[88px] bg-[var(--color-primary)] rounded-lg max-w-[1440px] mx-auto ">
          <div className="flex flex-col mx-6 lg:flex-row items-stretch gap-4 w-full lg:w-auto">
            <div className="[&_.relative]:min-w-[200px] [&_.flex]:h-11 [&_.flex]:bg-[var(--color-background)]/80 [&_.flex]:text-gray-700 [&_.flex]:px-4 [&_.flex]:rounded-md [&_.flex]:border-0 [&_.flex]:focus:outline-none [&_.flex]:transition-all [&_.flex]:duration-200 [&_.flex]:cursor-pointer [&_.flex_.text-black]:text-gray-700 [&_.flex_.text-black]:font-medium [&_.flex_.font-body]:text-md [&_.flex_.font-normal]:font-medium [&_.flex_.bg-opacity-80]:bg-opacity-80">
              <Dropdown
                options={dropdownOptions}
                onSelect={handleDropdownSelect}
                placeholder="Select Region"
              />
            </div>

            <SearchBar
              placeholder="Search..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              containerClassName="w-full lg:min-w-[452px] h-11 bg-[var(--color-background)]/80 px-3 rounded-md hover:shadow-md transition-all duration-200 flex items-center"
              className="text-gray-700 placeholder-gray-500 text-[14px] focus:outline-none focus:ring-0"
              icon={searchBarIcon}
              onKeyDown={e => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          <div className="flex items-center w-full lg:w-auto justify-end overflow-x-auto no-scrollbar gap-0 px-0">
            {categoryIcons.map((category, index) => (
              <div
                key={index}
                className={`relative min-w-[144px] text-[var(--color-background)] ${index > 0 ? 'border-l' : ''} lg:border-x border-[#5C90C6] ${index === categoryIcons.length - 1 ? 'lg:border-r-0' : ''}`}
              >
                <IconWithText
                  icon={category.icon}
                  text={category.text}
                  active={selectedCategory === category.id}
                  bgColor={selectedCategory === category.id ? "bg-[var(--color-primary-dark)]" : ""}
                  onClick={() => handleCategorySelect(category.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;