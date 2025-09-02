'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchDefaultLocation, fetchPlaces, setSelectedPlace, clearSelectedPlace, toggleSidebar, Place, setSelectedCategoryIds, toggleSelectedCategoryId, setSelectedTopCategoryId } from "../../../../store/slices/placesSlice";
import MapPopup from "./MapPopup";
import CategoryPanel from "./CategoryPanel";
import { Button, IconButton } from "@nextforge/ui";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export const mapIconGroups = [
  {
    name: "Things To Do",
    icon: "/assets/Icons/Things-To-Do.svg",
    options: [10359, 10334, 10325, 10212],
  },
  {
    name: "Where To Stay",
    icon: "/assets/Icons/Where-To-Stay.svg",
    options: [10321, 10324, 10320, 10322, 10323],
  },
  {
    name: "Food & Drink",
    icon: "/assets/Icons/Food-Drink.svg",
    options: [10360, 10367, 10370, 10353, 10363, 10362, 10366, 10368],
  },
  {
    name: "Events",
    icon: "/assets/Icons/Events.svg",
    options: [],
  },
];

const Map: React.FC = () => {
  const dispatch = useAppDispatch();
  const { places, selectedPlace, hoveredPlace, defaultLocation, loading, error, isSidebarOpen, allPlaces, categories, selectedCategoryIds } = useAppSelector(
    (state) => state.places
  );

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const hoveredIdRef = useRef<number | null>(null);
  const hoveredClusterIdRef = useRef<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  useEffect(() => { dispatch(fetchDefaultLocation()); }, [dispatch]);

  useEffect(() => {
    if (defaultLocation?.Latitude && defaultLocation?.Longitude && (!allPlaces || allPlaces.length === 0)) {
      dispatch(fetchPlaces({
        latitude: defaultLocation.Latitude,
        longitude: defaultLocation.Longitude,
      }));
    }
  }, [defaultLocation, allPlaces, dispatch]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current && defaultLocation) {
      try {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v11?optimize=true",
          center: [defaultLocation.Longitude, defaultLocation.Latitude],
          zoom: 13,
        });

        mapRef.current.on('load', () => {
          setMapInitialized(true);
          mapIconGroups.forEach((cat) => {
            const img = new Image();
            img.src = cat.icon;
            img.onload = () => {
              if (!mapRef.current!.hasImage(cat.name)) {
                mapRef.current!.addImage(cat.name, img);
              }
            };
          });
        });
      } catch (error) { console.error('Error initializing map:', error); }
    }
  }, [defaultLocation]);

  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return;
    const map = mapRef.current;

    if (!places.length) {
      ["place-icons", "clusters", "cluster-count", "cluster-icon", "hover-overlay", "unclustered-point"].forEach(layerId => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });
      if (map.getSource("places")) map.removeSource("places");
      if (map.getSource('hover-overlay')) map.removeSource('hover-overlay');
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      dispatch(clearSelectedPlace());
      return;
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: places.map((p: Place) => {
        const firstCategoryId = p.Category ? parseInt(p.Category.split(",")[0]) : null;
        const matchedCategory = firstCategoryId ? mapIconGroups.find(cat => cat.options.includes(firstCategoryId)) : null;
        return {
          type: "Feature",
          properties: { ...p, icon: matchedCategory?.name || null },
          geometry: { type: "Point", coordinates: [p.Longitude, p.Latitude] },
          id: p.Id,
        };
      })
    };

    const existingSrc = map.getSource("places") as mapboxgl.GeoJSONSource | undefined;
    if (existingSrc) {
      try {
        existingSrc.setData(geojson as any);
        return;
      } catch {}
    }

    ["place-icons", "clusters", "cluster-count", "cluster-icon", "hover-overlay", "unclustered-point"].forEach(layerId => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    });
    if (map.getSource("places")) map.removeSource("places");
    if (map.getSource('hover-overlay')) map.removeSource('hover-overlay');

    map.addSource("places", { type: "geojson", data: geojson, cluster: true, clusterMaxZoom: 14, clusterRadius: 50, clusterMinPoints: 10 });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "places",
      filter: ["has", "point_count"],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#0078B8', 100, '#f1f075', 750, '#f28cb1'] as any,
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40] as any
      }
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "places",
      filter: ["has", "point_count"],
      layout: { "text-field": "{point_count_abbreviated}", "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], "text-size": 14 },
      paint: { "text-color": "#fff" }
    });

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim();

    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "places",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "case",
          ["boolean", ["feature-state", "hovered"], false],
          primaryColor,
          secondaryColor
        ],
        "circle-radius": [
          "case",
          ["boolean", ["feature-state", "hovered"], false],
          20,
          16
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff"
      }
    });

    map.addLayer({
      id: 'place-icons',
      type: 'symbol',
      source: 'places',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-size': 0.6,
        'icon-allow-overlap': true
      }
    });

    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      (map.getSource("places") as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
      });
    });

    map.on("click", "unclustered-point", (e) => {
      e.preventDefault();
      const feature = e.features?.[0]; if (!feature) return;
      const place: Place = feature.properties as any;

      if (selectedPlace && selectedPlace.Id === place.Id) {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
        dispatch(clearSelectedPlace());
        return;
      }

      dispatch(setSelectedPlace(place));

      if (popupRef.current) popupRef.current.remove();

      const popupContainer = document.createElement("div");
      const newPopup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setDOMContent(popupContainer)
        .setLngLat((feature.geometry as any).coordinates)
        .addTo(map);

      popupRef.current = newPopup;
      createRoot(popupContainer).render(<MapPopup place={place} onClose={() => newPopup.remove()} />);
    });

    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseenter", "clusters", () => map.getCanvas().style.cursor = "pointer");
    map.on("mouseleave", "clusters", () => map.getCanvas().style.cursor = "");

  }, [places, mapInitialized, dispatch]);

  useEffect(() => {
    if (!selectedPlace) return;
    const exists = places.some((p: Place) => p.Id === selectedPlace.Id);
    if (!exists) {
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      dispatch(clearSelectedPlace());
    }
  }, [places, selectedPlace, dispatch]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  type GroupedFilters = { topId: number; topName: string; items: { id: number; name: string }[] }[];
  const groupedFilters: GroupedFilters = useMemo(() => {
    if (!categories || categories.length === 0 || !selectedCategoryIds || selectedCategoryIds.length === 0) return [];
    const selectedSet = new Set(selectedCategoryIds);

    const groups: GroupedFilters = [];
    const collectSelected = (node: any): number[] => {
      const out: number[] = [];
      const stack: any[] = [node];
      while (stack.length) {
        const n = stack.pop();
        if (n && typeof n.CategoryId === 'number' && n.CategoryId > 0 && selectedSet.has(n.CategoryId)) out.push(n.CategoryId);
        if (Array.isArray(n?.Categories)) stack.push(...n.Categories);
      }
      return Array.from(new Set(out));
    };

    const nameBy = new globalThis.Map<number, string>();
    const nameWalk = (node: any) => {
      if (node && typeof node.CategoryId === 'number') nameBy.set(node.CategoryId, node.CategoryName);
      if (Array.isArray(node?.Categories)) node.Categories.forEach(nameWalk);
    };
    categories.forEach(nameWalk);

    for (const top of categories) {
      const ids = collectSelected(top);
      if (ids.length) {
        const items = ids.map((id) => ({ id, name: nameBy.get(id) || String(id) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        groups.push({ topId: top.CategoryId, topName: top.CategoryName, items });
      }
    }
    return groups;
  }, [categories, selectedCategoryIds]);

  const totalSelectedCount = selectedCategoryIds?.length || 0;

  useEffect(() => {
    if (!selectedPlace) return;
    if (!mapRef.current || !mapInitialized) return;
    const { Longitude, Latitude } = selectedPlace as Place;

    try {
      mapRef.current.flyTo({ center: [Longitude, Latitude], zoom: 15, speed: 1.2, curve: 1.42, essential: true });
    } catch {}

    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    const map = mapRef.current;
    const point = map.project([Longitude, Latitude]);
    const unclustered = map.queryRenderedFeatures(point, { layers: ["unclustered-point"] });
    if (unclustered && unclustered.length > 0) {
      const popupContainer = document.createElement("div");
      const newPopup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setDOMContent(popupContainer)
        .setLngLat([Longitude, Latitude])
        .addTo(map);
      popupRef.current = newPopup;
      createRoot(popupContainer).render(<MapPopup place={selectedPlace} onClose={() => newPopup.remove()} />);
    }
  }, [selectedPlace, mapInitialized]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapInitialized) return;

    const updatePopupVisibility = () => {
      if (!selectedPlace) {
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
        return;
      }

      const { Longitude, Latitude } = selectedPlace;
      const point = map.project([Longitude, Latitude]);

      const unclustered = map.queryRenderedFeatures(point, { layers: ["unclustered-point"] });
      if (unclustered && unclustered.length > 0) {
        if (!popupRef.current) {
          const popupContainer = document.createElement("div");
          const newPopup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setDOMContent(popupContainer)
            .setLngLat([Longitude, Latitude])
            .addTo(map);
          popupRef.current = newPopup;
          createRoot(popupContainer).render(<MapPopup place={selectedPlace} onClose={() => newPopup.remove()} />);
        } else {
          popupRef.current.setLngLat([Longitude, Latitude]);
        }
      } else {
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      }
    };

    const handlers: Array<[string, any]> = [
      ["move", updatePopupVisibility],
      ["zoom", updatePopupVisibility],
      ["moveend", updatePopupVisibility],
      ["zoomend", updatePopupVisibility],
      ["sourcedata", updatePopupVisibility],
      ["render", updatePopupVisibility],
    ];
    handlers.forEach(([evt, fn]) => map.on(evt as any, fn));
    updatePopupVisibility();

    return () => {
      handlers.forEach(([evt, fn]) => map.off(evt as any, fn));
    };
  }, [mapInitialized, selectedPlace, places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapInitialized) return;
    const src: any = map.getSource("places");
    if (!src) return;

    if (hoveredIdRef.current !== null) {
      try {
        map.setFeatureState({ source: "places", id: hoveredIdRef.current }, { hovered: false });
      } catch { }
      hoveredIdRef.current = null;
    }

    if (hoveredClusterIdRef.current !== null) {
      try {
        map.setFeatureState({ source: 'places', id: hoveredClusterIdRef.current }, { hovered: false, icon: null as any });
      } catch { }
      hoveredClusterIdRef.current = null;
    }

    if (hoveredPlace && typeof hoveredPlace.Id === "number") {
      try {
        map.setFeatureState({ source: "places", id: hoveredPlace.Id }, { hovered: true });
        hoveredIdRef.current = hoveredPlace.Id;
      } catch (err) {
        const features = map.querySourceFeatures("places");

        const target = features.find((f) => f.id === hoveredPlace.Id);
        if (!target && hoveredPlace.Longitude && hoveredPlace.Latitude) {
          const clusterFeatures = map.queryRenderedFeatures(
            map.project([hoveredPlace.Longitude, hoveredPlace.Latitude]),
            { layers: ["clusters"] }
          );

          if (clusterFeatures.length && clusterFeatures[0].properties?.cluster_id) {
            const clusterId = clusterFeatures[0].properties.cluster_id;
            src.getClusterLeaves(clusterId, Infinity, 0, (err: any, leaves: any[]) => {
              if (err) return;
              const found = leaves.find((l) => l.id === hoveredPlace.Id);
              if (found) {
                map.setFeatureState({ source: "places", id: hoveredPlace.Id }, { hovered: true });
                hoveredIdRef.current = hoveredPlace.Id;

                const pointCount = clusterFeatures[0].properties?.point_count ?? 0;
                const firstCategoryId = hoveredPlace.Category ? parseInt((hoveredPlace.Category as string).split(',')[0]) : null;
                const matchedCategory = firstCategoryId ? mapIconGroups.find(cat => cat.options.includes(firstCategoryId)) : null;
                const iconName = matchedCategory?.name || null;

                hoveredClusterIdRef.current = clusterId;

                const overlaySourceId = 'hover-overlay';
                const coords: [number, number] = [hoveredPlace.Longitude, hoveredPlace.Latitude];
                if (pointCount < 100 && iconName) {
                  const overlayData: GeoJSON.FeatureCollection = {
                    type: 'FeatureCollection',
                    features: [
                      {
                        type: 'Feature',
                        properties: { icon: iconName },
                        geometry: { type: 'Point', coordinates: coords }
                      } as any
                    ]
                  };
                  if (map.getSource(overlaySourceId)) {
                    (map.getSource(overlaySourceId) as mapboxgl.GeoJSONSource).setData(overlayData as any);
                  } else {
                    map.addSource(overlaySourceId, { type: 'geojson', data: overlayData });
                    map.addLayer({
                      id: overlaySourceId,
                      type: 'symbol',
                      source: overlaySourceId,
                      layout: {
                        'icon-image': ['get', 'icon'],
                        'icon-size': 1.1,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                      }
                    });
                  }
                } else {
                  if (map.getLayer(overlaySourceId)) map.removeLayer(overlaySourceId);
                  if (map.getSource(overlaySourceId)) map.removeSource(overlaySourceId);
                }
              }
            });
          }
        }
      }
    }

    if (!hoveredPlace) {
      const overlaySourceId = 'hover-overlay';
      if (map.getLayer(overlaySourceId)) map.removeLayer(overlaySourceId);
      if (map.getSource(overlaySourceId)) map.removeSource(overlaySourceId);
    }
  }, [hoveredPlace, mapInitialized]);

  return (
    <div className="w-full md:h-[calc(100vh-330px)] h-[calc(100dvh-176px)] rounded-lg overflow-hidden shadow relative md:pb-0">
      <Button
        type="button"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        onClick={() => dispatch(toggleSidebar())}
        className="absolute top-4 left-4 z-20 flex items-center justify-center rounded border border-gray-200 transition cursor-pointer"
      >
        <img
          src="/assets/Icons/Expand-Map.svg"
          alt="Toggle sidebar"
          className={`w-10 h-10`}
        />
      </Button>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-[var(--color-background)] px-3 py-2 rounded shadow flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Loading places...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 z-10 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
          <span className="text-sm">Error: {error}</span>
        </div>
      )}
      {!filtersOpen && (
        <div className="absolute top-4 right-4 md:right-4 z-20">
          <Button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 border border-gray-300 rounded-lg px-3 py-2 h-[40px] shadow cursor-pointer"
          >

            <img
              src="/assets/Images/filter.svg"
              alt="Filter"
              className="w-6 h-6"
            />
            <span className="font-[16px]">Filters</span>
            {totalSelectedCount > 0 && (
              <span className="ml-1 flex items-center justify-center text-[14px] bg-[var(--color-secondary)] text-white rounded-full w-[22px] h-[22px]">
                {totalSelectedCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {filtersOpen && (
        <div className="absolute top-4 right-4 z-30 w-[264px] max-h-[70vh] overflow-auto rounded-lg shadow-lg bg-white text-gray-800 border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="font-semibold text-lg">Filters</h3>
            <Button onClick={() => setFiltersOpen(false)} aria-label="Close" className="text-gray-600 hover:text-gray-900 text-2xl leading-none cursor-pointer">×</Button>
          </div>
          <div className="p-4 space-y-5">
            {groupedFilters.length === 0 && (
              <div className="text-sm text-gray-500">No filters selected.</div>
            )}
            {groupedFilters.map(group => (
              <div key={group.topId}>
                <div className="font-semibold mb-2">{group.topName}</div>
                <div className="flex flex-wrap gap-2 text-[var(--color-neutral)]">
                  {expandedCategory === group.topId ? (
                    <div className="w-full max-h-[150px] overflow-y-auto scrollbar-thin pr-1 flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 bg-[#F9FAF9] border border-gray-300 rounded-[4px] px-2 text-sm"
                        >
                          <span>{item.name}</span>
                          <IconButton
                            aria-label="Remove filter"
                            className="text-gray-600 hover:text-gray-900 text-lg cursor-pointer px-2"
                            onClick={() => dispatch(toggleSelectedCategoryId(item.id))}
                          >
                            ×
                          </IconButton>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <>
                      {group.items.slice(0, 3).map(item => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 bg-[#F9FAF9] border border-gray-300 rounded-[4px] px-3 text-sm"
                        >
                          <span>{item.name}</span>
                          <Button
                            aria-label="Remove filter"
                            className="text-gray-600 hover:text-gray-900 text-lg cursor-pointer"
                            onClick={() => dispatch(toggleSelectedCategoryId(item.id))}
                          >
                            ×
                          </Button>
                        </span>
                      ))}
                    </>
                  )}

                  {group.items.length > 3 && (
                    <Button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-secondary)] text-sm font-semibold text-[var(--color-white)] cursor-pointer"
                      onClick={() => setExpandedCategory(expandedCategory === group.topId ? null : group.topId)}
                    >
                      {`+${group.items.length - 3}`}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {groupedFilters.length > 0 && (
              <Button
                className="!text-[var(--color-primary)] !underline !text-md !cursor-pointer"
                onClick={() => { dispatch(setSelectedCategoryIds([])); dispatch(setSelectedTopCategoryId(null)); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
      <CategoryPanel />
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
