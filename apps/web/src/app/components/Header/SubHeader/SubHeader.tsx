import React, { useEffect, useState, useMemo } from "react";
import { Dropdown, SearchBar, IconWithText, IconButton } from "@nextforge/ui";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchPlaces, fetchRegions, fetchCategories, applyRegion, applySearchText, applySelectedCategoryIds, setSelectedTopCategoryId } from "../../../../store/slices/placesSlice";
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

config.autoAddCss = false;
library.add(fas);

interface SubHeaderProps {
  isSearchActive?: boolean;
}

const SubHeader: React.FC<SubHeaderProps> = ({ isSearchActive = false }) => {
  const dispatch = useAppDispatch();
  const { 
    defaultLocation, 
    searchText, 
    regions, 
    selectedRegionId, 
    regionsLoading, 
    regionsError,
    categories, 
    selectedTopCategoryId,
    loading: categoriesLoading,
    error: categoriesError
  } = useAppSelector((state) => state.places);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState(searchText);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (!regions || regions.length === 0) {
          await dispatch(fetchRegions(undefined));
        }
        await dispatch(fetchCategories(undefined));
        if (isMounted) {
          setHasFetchedData(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const dropdownOptions = [
    { label: "All Regions", value: "0" },
    ...(regions || []).map(r => ({ label: r.Name, value: String(r.Id) })),
  ];

  const categoryIcons = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    return categories.map(category => {
      const iconClass = category.Icon || 'fa-solid fa-hashtag';
      const [style, ...iconParts] = iconClass.split(' ');
      const iconStyle = style.replace('fa-', '') as any;
      
      let iconName = iconParts[0]?.replace('fa-', '') || 'hashtag';
      
      const exactIconName = `fa${iconName.split('-').map((s: string) => 
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join('')}`;
      
      if (!fas[exactIconName] && iconName.includes('-')) {
        const baseIconName = iconName.split('-')[0];
        const baseIconNameFormatted = `fa${baseIconName.charAt(0).toUpperCase() + baseIconName.slice(1)}`;
        if (fas[baseIconNameFormatted]) {
          iconName = baseIconName;
        }
      }
      
      return {
        id: category.CategoryName.toLowerCase().replace(/\s+/g, '-'),
        icon: (
          <div className="w-6 h-6 flex items-center justify-center text-lg">
            <FontAwesomeIcon icon={[iconStyle === 'solid' ? 'fas' : 'far', iconName] as any} />
          </div>
        ),
        text: category.CategoryName,
        dbName: category.CategoryName,
        categoryId: category.CategoryId,
        iconClass: iconClass
      };
    });
  }, [categories]);

  const handleDropdownSelect = (value: string) => {
    const regionVal = Number(value);
    dispatch(applyRegion(Number.isFinite(regionVal) ? regionVal : 0));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    const category = categoryIcons.find(c => c.id === categoryId);
    if (!category) return;

    if (category.categoryId === -1) {
      dispatch(setSelectedTopCategoryId(null));
      return;
    }

    const findCategory = (items: any[], id: number): any => {
      for (const item of items) {
        if (item.CategoryId === id) return item;
        if (item.Categories && item.Categories.length > 0) {
          const found = findCategory(item.Categories, id);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findCategory(categories, category.categoryId);
    if (node) {
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
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

          {hasFetchedData && !regionsLoading && !regionsError && (
            <div className="px-3 [&_.relative]:min-w-[200px] [&_.flex]:h-11 [&_.flex]:bg-[var(--color-background)]/80 [&_.flex]:text-gray-700 [&_.flex]:px-4 [&_.flex]:rounded-md [&_.flex]:border-0 [&_.flex]:focus:outline-none [&_.flex]:transition-all [&_.flex]:duration-200 [&_.flex]:cursor-pointer [&_.flex_.text-black]:text-gray-700 [&_.flex_.text-black]:font-medium [&_.flex_.font-body]:text-md [&_.flex_.font-normal]:font-medium [&_.flex_.bg-opacity-80]:bg-opacity-80">
              <Dropdown
                options={dropdownOptions}
                onSelect={handleDropdownSelect}
                placeholder="Select Region"
              />
            </div>
          )}

          {hasFetchedData && !categoriesLoading && !categoriesError && (
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
          )}
        </div>

        <div className="hidden lg:flex items-center justify-between h-[88px] bg-[var(--color-primary)] rounded-lg max-w-[1440px] mx-auto ">
          <div className="flex flex-col mx-6 lg:flex-row items-stretch gap-4 w-full lg:w-auto">
            {hasFetchedData && !regionsLoading && !regionsError && (
              <div className="[&_.relative]:min-w-[200px] [&_.flex]:h-11 [&_.flex]:bg-[var(--color-background)]/80 [&_.flex]:text-gray-700 [&_.flex]:px-4 [&_.flex]:rounded-md [&_.flex]:border-0 [&_.flex]:focus:outline-none [&_.flex]:transition-all [&_.flex]:duration-200 [&_.flex]:cursor-pointer [&_.flex_.text-black]:text-gray-700 [&_.flex_.text-black]:font-medium [&_.flex_.font-body]:text-md [&_.flex_.font-normal]:font-medium [&_.flex_.bg-opacity-80]:bg-opacity-80">
                <Dropdown
                  options={dropdownOptions}
                  onSelect={handleDropdownSelect}
                  placeholder="Select Region"
                />
              </div>
            )}

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