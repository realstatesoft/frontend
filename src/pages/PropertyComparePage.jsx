import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertyComparePanel from "../components/properties/PropertyComparePanel";
import usePropertyCompareStore from "../store/usePropertyCompareStore";
import { useNavigate } from "react-router-dom";

export default function PropertyComparePage() {
  const navigate = useNavigate();
  const comparedProperties = usePropertyCompareStore((state) => state.comparedProperties);
  const removeComparedProperty = usePropertyCompareStore((state) => state.removeProperty);
  const clearComparedProperties = usePropertyCompareStore((state) => state.clearProperties);

  const handleClearCompare = () => {
    clearComparedProperties();
    navigate("/properties");
  };

  return (
    <>
      <CustomNavbar />
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "60vh" }}>
        <PropertyComparePanel
          properties={comparedProperties}
          loading={false}
          error={null}
          onRemove={removeComparedProperty}
          onClear={handleClearCompare}
        />
      </div>
      <Footer />
    </>
  );
}
