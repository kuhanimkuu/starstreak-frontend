import { createContext, useContext } from "react";

// Shared by the Starstreak Business layout and pages.

export const OrgContext = createContext(null);
export const useOrg = () => useContext(OrgContext);

export const STATUS_TEXT = {
  pending_email: "Waiting for your email code",
  pending_review: "Being checked by Starstreak",
  approved_unpaid: "Verified · billing not set up",
  active: "Active",
  grace: "Payment overdue",
  lapsed: "Lapsed",
  rejected: "Not approved",
};
