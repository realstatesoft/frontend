import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_PROPERTIES_TO_COMPARE = 3;

function toComparableProperty(property) {
  if (!property || property.id == null) {
    return null;
  }

  return {
    id: property.id,
    title: property.title ?? null,
    price: property.price ?? null,
    propertyType: property.propertyType ?? null,
    address: property.address ?? null,
    primaryImageUrl: property.primaryImageUrl ?? property.image ?? null,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    surfaceArea: property.surfaceArea ?? property.area ?? null,
    locationName: property.locationName ?? property.location ?? null,
  };
}

const usePropertyCompareStore = create(
  persist(
    (set, get) => ({
      comparedProperties: [],

      addProperty: (property) => {
        const comparableProperty = toComparableProperty(property);
        if (!comparableProperty) {
          return false;
        }

        const currentProperties = get().comparedProperties;

        if (
          currentProperties.some((item) => item.id === comparableProperty.id) ||
          currentProperties.length >= MAX_PROPERTIES_TO_COMPARE
        ) {
          return false;
        }

        set({ comparedProperties: [...currentProperties, comparableProperty] });
        return true;
      },

      removeProperty: (propertyId) =>
        set((state) => ({
          comparedProperties: state.comparedProperties.filter((property) => property.id !== propertyId),
        })),

      toggleProperty: (property) => {
        const comparableProperty = toComparableProperty(property);
        if (!comparableProperty) {
          return { added: false, removed: false, limitReached: false };
        }

        const currentProperties = get().comparedProperties;

        if (currentProperties.some((item) => item.id === comparableProperty.id)) {
          set({
            comparedProperties: currentProperties.filter((item) => item.id !== comparableProperty.id),
          });
          return { added: false, removed: true, limitReached: false };
        }

        if (currentProperties.length >= MAX_PROPERTIES_TO_COMPARE) {
          return { added: false, removed: false, limitReached: true };
        }

        set({ comparedProperties: [...currentProperties, comparableProperty] });
        return { added: true, removed: false, limitReached: false };
      },

      clearProperties: () => set({ comparedProperties: [] }),

      isCompared: (propertyId) =>
        get().comparedProperties.some((property) => property.id === propertyId),
    }),
    {
      name: "property-compare-session",
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { comparedProperties: [] };
        }

        if (Array.isArray(persistedState.comparedProperties)) {
          return persistedState;
        }

        return { ...persistedState, comparedProperties: [] };
      },
    }
  )
);

export const MAX_COMPARE_PROPERTIES = MAX_PROPERTIES_TO_COMPARE;

export default usePropertyCompareStore;
