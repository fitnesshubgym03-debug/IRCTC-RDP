import type { OperatingSystemId } from "@irctcrdp/contracts";

/**
 * Approved OS -> template mapping. The browser sends a friendly OS id;
 * the backend maps it to an internal approved template. Arbitrary Proxmox
 * template ids from clients are never accepted.
 */
export interface TemplateSpec {
  templateId: string;
  rdpPort: number;
  init: "cloudinit" | "custom";
  /** Default Windows local admin / linux user handled during provisioning. */
  windows: boolean;
}

export const OS_TEMPLATES: Record<OperatingSystemId, TemplateSpec> = {
  "windows-server-2025": { templateId: "windows-server-2025", rdpPort: 3389, init: "custom", windows: true },
  "windows-server-2022": { templateId: "windows-server-2022", rdpPort: 3389, init: "custom", windows: true },
  "windows-server-2019": { templateId: "windows-server-2019", rdpPort: 3389, init: "custom", windows: true },
  "windows-11-pro": { templateId: "windows-11-pro", rdpPort: 3389, init: "custom", windows: true },
  "ubuntu-24-04": { templateId: "ubuntu-2404", rdpPort: 22, init: "cloudinit", windows: false },
  "debian-12": { templateId: "debian-12", rdpPort: 22, init: "cloudinit", windows: false },
};

export function getTemplate(os: string): TemplateSpec | null {
  return OS_TEMPLATES[os as OperatingSystemId] ?? null;
}