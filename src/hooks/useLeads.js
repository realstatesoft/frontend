import { useQuery } from "@tanstack/react-query";
import { getLeadById } from "../services/leads/leadApi";

export const useLead = (id) => {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id),
    enabled: !!id,
  });
};
