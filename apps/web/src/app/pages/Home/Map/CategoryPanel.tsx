"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { CategoryNode, setSelectedCategoryIds, toggleSelectedCategoryId } from "../../../../store/slices/placesSlice";
import { Button } from "@nextforge/ui";
import "./CategoryPanel.css";

const flattenCategoryIds = (node: CategoryNode | null): number[] => {
  if (!node) return [];
  const ids: number[] = [];
  const stack: CategoryNode[] = [node];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.CategoryId > 0) ids.push(n.CategoryId);
    if (Array.isArray(n.Categories)) stack.push(...n.Categories);
  }
  return ids;
};

const CategoryPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, selectedTopCategoryId, selectedCategoryIds } = useAppSelector((s) => s.places);
  const [openLevel2, setOpenLevel2] = useState<Record<number, boolean>>({});
  const [isOpen, setIsOpen] = useState(true);

  const topNode = useMemo(() => {
    if (!selectedTopCategoryId) return null;
    return categories.find((c) => c.CategoryId === selectedTopCategoryId) || null;
  }, [categories, selectedTopCategoryId]);

  const level2 = useMemo(() => (topNode?.Categories ?? []), [topNode]);

  useEffect(() => {
    if (selectedTopCategoryId != null) {
      setIsOpen(true);
      setOpenLevel2({});
    }
  }, [selectedTopCategoryId]);

  if (!topNode || !isOpen) return null;

  const allIds = flattenCategoryIds(topNode);
  const allChecked = allIds.length > 0 && allIds.every((id) => selectedCategoryIds.includes(id));
  const partiallyChecked = !allChecked && allIds.some((id) => selectedCategoryIds.includes(id));

  const toggleAll = () => {
    if (allChecked) {
      const remaining = selectedCategoryIds.filter((id) => !allIds.includes(id));
      dispatch(setSelectedCategoryIds(remaining));
    } else {
      const set = new Set(selectedCategoryIds);
      allIds.forEach((id) => set.add(id));
      dispatch(setSelectedCategoryIds(Array.from(set)));
    }
  };

  const closePanel = () => {
    setIsOpen(false);
    // if (isLoading) return;
    // dispatch(applySelectedTopCategoryId(null));
  };

  return (
    <aside className="fixed right-3 top-60 lg:top-48 lg:right-6 z-30 w-[264px] max-h-[70vh] overflow-auto rounded shadow-lg bg-[var(--color-secondary)] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-lg">{topNode.CategoryName}</h3>
        <Button onClick={closePanel} aria-label="Close" className="text-white/90 hover:text-white text-3xl leading-none cursor-pointer">×</Button>
      </div>

      <div className="p-3 space-y-2">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = partiallyChecked;
            }}
            onChange={toggleAll}
          />
          <span className="label-text">All</span>
        </label>

        {level2.map((l2) => {
          const l2Ids = flattenCategoryIds(l2);
          const l2AllChecked = l2Ids.length > 0 && l2Ids.every((id) => selectedCategoryIds.includes(id));
          const l2Partial = !l2AllChecked && l2Ids.some((id) => selectedCategoryIds.includes(id));
          const hasChildren = (l2.Categories?.length || 0) > 0;

          const toggleL2All = () => {
            if (l2AllChecked) {
              const remaining = selectedCategoryIds.filter((id) => !l2Ids.includes(id));
              dispatch(setSelectedCategoryIds(remaining));
            } else {
              const set = new Set(selectedCategoryIds);
              l2Ids.forEach((id) => set.add(id));
              dispatch(setSelectedCategoryIds(Array.from(set)));
            }
          };

          return (
            <div key={l2.CategoryId}>
              <div className="flex items-center justify-between py-2">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={l2AllChecked}
                    ref={(el) => { if (el) el.indeterminate = l2Partial; }}
                    onChange={toggleL2All}
                    // className="accent-white checked:bg-[var(--color-secondary)]"
                  />
                  <span className="text-[15px]">{l2.CategoryName}</span>
                </label>
                {hasChildren && (
                  <Button
                    onClick={() => setOpenLevel2((s) => ({ ...s, [l2.CategoryId]: !s[l2.CategoryId] }))}
                    className="text-white/90 hover:text-white text-sm"
                  >
                    {openLevel2[l2.CategoryId] ? "−" : "+"}
                  </Button>
                )}
              </div>

              {hasChildren && openLevel2[l2.CategoryId] && (
                <div className="px-3 pb-2 space-y-2">
                  {l2.Categories.map((l3) => {
                    const checked = selectedCategoryIds.includes(l3.CategoryId);
                    return (
                      <label key={l3.CategoryId} className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => dispatch(toggleSelectedCategoryId(l3.CategoryId))}
                          // className="accent-white checked:bg-[var(--color-secondary)]"
                        />
                        <span className="text-[15px]">{l3.CategoryName}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default CategoryPanel;