import { beforeEach, describe, expect, it } from "vitest";
import usePropertyCompareStore from "../../store/usePropertyCompareStore";

function property(id) {
  return {
    id,
    title: `Propiedad ${id}`,
    price: id * 1000,
    propertyType: "HOUSE",
    address: `Direccion ${id}`,
  };
}

describe("usePropertyCompareStore", () => {
  beforeEach(() => {
    sessionStorage.clear();
    usePropertyCompareStore.setState({ comparedProperties: [] });
  });

  it("agrega propiedades hasta el límite permitido", () => {
    expect(usePropertyCompareStore.getState().addProperty(property(10))).toBe(true);
    expect(usePropertyCompareStore.getState().addProperty(property(20))).toBe(true);
    expect(usePropertyCompareStore.getState().addProperty(property(30))).toBe(true);
    expect(usePropertyCompareStore.getState().addProperty(property(40))).toBe(false);

    expect(usePropertyCompareStore.getState().comparedProperties.map((item) => item.id)).toEqual([10, 20, 30]);
  });

  it("toggleProperty remueve una propiedad ya seleccionada", () => {
    usePropertyCompareStore.setState({ comparedProperties: [property(10), property(20)] });

    const result = usePropertyCompareStore.getState().toggleProperty(property(10));

    expect(result).toEqual({ added: false, removed: true, limitReached: false });
    expect(usePropertyCompareStore.getState().comparedProperties.map((item) => item.id)).toEqual([20]);
  });

  it("toggleProperty avisa cuando se alcanza el límite", () => {
    usePropertyCompareStore.setState({ comparedProperties: [property(10), property(20), property(30)] });

    const result = usePropertyCompareStore.getState().toggleProperty(property(40));

    expect(result).toEqual({ added: false, removed: false, limitReached: true });
    expect(usePropertyCompareStore.getState().comparedProperties.map((item) => item.id)).toEqual([10, 20, 30]);
  });

  it("conserva el resumen de la propiedad para comparar sin refetch", () => {
    usePropertyCompareStore.getState().addProperty(property(99));

    expect(usePropertyCompareStore.getState().comparedProperties[0]).toMatchObject({
      id: 99,
      title: "Propiedad 99",
      price: 99000,
      propertyType: "HOUSE",
    });
  });
});
