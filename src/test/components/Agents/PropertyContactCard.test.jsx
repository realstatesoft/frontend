import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import PropertyContactCard from "../../../components/Agents/PropertyContactCard";

// ── mocks ──────────────────────────────────────────────────────────────────

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key, opts) => (opts?.count != null ? `${key}:${opts.count}` : key) }),
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));

const mockGetAgentById = vi.fn();
vi.mock("../../../services/agents/agentApi", () => ({
  default: { getAgentById: (...args) => mockGetAgentById(...args) },
}));

vi.mock("../../../utils/whatsapp", () => ({
  getWhatsAppLink: (phone) => (phone ? `https://wa.me/${phone}` : null),
}));

vi.mock("../../../components/visits/CreateVisitModal", () => ({
  default: () => null,
}));

vi.mock("../../../components/messages/NewConversationModal", () => ({
  default: () => null,
}));

vi.mock("../../../components/offers/CreateOfferModal", () => ({
  default: () => null,
}));

vi.mock("../../../components/common/StarRating", () => ({
  default: () => <span data-testid="star-rating" />,
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

// ── helpers ────────────────────────────────────────────────────────────────

const baseProperty = {
  id: 401,
  ownerId: 38,
  ownerName: "Cesar Ayala",
  ownerAvatarUrl: null,
  ownerAgentProfileId: null,
  agentId: null,
};

function renderCard(property) {
  return render(
    <MemoryRouter>
      <PropertyContactCard property={property} />
    </MemoryRouter>
  );
}

// ── tests ──────────────────────────────────────────────────────────────────

describe("PropertyContactCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cuando la propiedad NO tiene agente ni agentProfile del owner", () => {
    it("muestra el nombre del owner sin llamar al API de agentes", () => {
      renderCard(baseProperty);

      expect(screen.getByText("Cesar Ayala")).toBeInTheDocument();
      expect(mockGetAgentById).not.toHaveBeenCalled();
    });

    it("muestra el avatar del owner cuando ownerAvatarUrl está presente", () => {
      const property = {
        ...baseProperty,
        ownerAvatarUrl: "https://example.com/cesar.jpg",
      };
      renderCard(property);

      const img = screen.getByRole("img", { name: "Cesar Ayala" });
      expect(img).toHaveAttribute("src", "https://example.com/cesar.jpg");
      expect(mockGetAgentById).not.toHaveBeenCalled();
    });

    it("muestra avatar por defecto cuando ownerAvatarUrl es null", () => {
      renderCard(baseProperty);

      const img = screen.getByRole("img", { name: "Cesar Ayala" });
      // DEFAULT_AVATAR es la URL del fallback configurada en el componente
      expect(img).toHaveAttribute("src", expect.stringContaining("randomuser.me"));
    });

    it("muestra label 'contactCard.owner' cuando no hay agente", () => {
      renderCard(baseProperty);

      expect(screen.getByText("contactCard.owner")).toBeInTheDocument();
    });
  });

  describe("cuando la propiedad tiene ownerAgentProfileId", () => {
    const agentData = {
      id: 5,
      userId: 38,
      userName: "Cesar Ayala Agente",
      userAvatarUrl: "https://example.com/agent-cesar.jpg",
      userPhone: "+595981234567",
      experienceYears: 3,
      avgRating: 4.5,
      totalReviews: 10,
    };

    it("llama al API con el ownerAgentProfileId y muestra datos del agente", async () => {
      mockGetAgentById.mockResolvedValue({ data: { data: agentData } });

      const property = { ...baseProperty, ownerAgentProfileId: 5 };
      renderCard(property);

      expect(mockGetAgentById).toHaveBeenCalledWith(5);

      await waitFor(() => {
        expect(screen.getByText("Cesar Ayala Agente")).toBeInTheDocument();
      });

      const img = screen.getByRole("img", { name: "Cesar Ayala Agente" });
      expect(img).toHaveAttribute("src", "https://example.com/agent-cesar.jpg");
    });
  });

  describe("cuando la propiedad tiene agentId asignado", () => {
    const agentData = {
      id: 7,
      userId: 55,
      userName: "Pedro Agente",
      userAvatarUrl: "https://example.com/pedro.jpg",
      userPhone: "+595987654321",
      experienceYears: 5,
      avgRating: 4.8,
      totalReviews: 20,
    };

    it("agentId tiene prioridad sobre ownerAgentProfileId", async () => {
      mockGetAgentById.mockResolvedValue({ data: { data: agentData } });

      const property = {
        ...baseProperty,
        agentId: 7,
        ownerAgentProfileId: 99, // debe ignorarse — agentId tiene prioridad via nullish coalescing
      };
      renderCard(property);

      // effectiveAgentProfileId = agentId ?? ownerAgentProfileId => 7
      expect(mockGetAgentById).toHaveBeenCalledWith(7);
      expect(mockGetAgentById).not.toHaveBeenCalledWith(99);

      await waitFor(() => {
        expect(screen.getByText("Pedro Agente")).toBeInTheDocument();
      });
    });

    it("usa userAvatarUrl del agente cuando está disponible", async () => {
      mockGetAgentById.mockResolvedValue({ data: { data: agentData } });

      renderCard({ ...baseProperty, agentId: 7 });

      await waitFor(() => {
        const img = screen.getByRole("img", { name: "Pedro Agente" });
        expect(img).toHaveAttribute("src", "https://example.com/pedro.jpg");
      });
    });

    it("cae al ownerAvatarUrl cuando el agente no tiene userAvatarUrl", async () => {
      const agentSinFoto = { ...agentData, userAvatarUrl: null };
      mockGetAgentById.mockResolvedValue({ data: { data: agentSinFoto } });

      const property = {
        ...baseProperty,
        agentId: 7,
        ownerAvatarUrl: "https://example.com/owner-fallback.jpg",
      };
      renderCard(property);

      await waitFor(() => {
        const img = screen.getByRole("img", { name: "Pedro Agente" });
        expect(img).toHaveAttribute("src", "https://example.com/owner-fallback.jpg");
      });
    });
  });

  describe("cuando el API de agentes falla", () => {
    it("muestra el nombre del owner como fallback", async () => {
      mockGetAgentById.mockRejectedValue(new Error("Network error"));

      const property = { ...baseProperty, agentId: 7 };
      renderCard(property);

      await waitFor(() => {
        // Tras el fallo, agent=null; el nombre cae a property.ownerName
        expect(screen.getByText("Cesar Ayala")).toBeInTheDocument();
      });
    });
  });
});
