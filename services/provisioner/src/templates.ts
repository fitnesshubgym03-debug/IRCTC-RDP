import type { OperatingSystemId } from "@irctcrdp/contracts";
import type { ProvisionerConfig } from "./config.js";

export interface ProvisionerTemplate {
  templateId: string;
  rdpPort: number;
  windows: boolean;
}

export function buildTemplates(config: ProvisionerConfig): Record<OperatingSystemId, ProvisionerTemplate> {
  const def = (
    envKey: keyof ProvisionerConfig,
    rdpPort: number,
    windows: boolean,
  ): ProvisionerTemplate => ({
    templateId: String(config[envKey] ?? ""),
    rdpPort,
    windows,
  });
  return {
    "windows-server-2025": def("PROXMOX_TEMPLATE_WINDOWS_SERVER_2025", 3389, true),
    "windows-server-2022": def("PROXMOX_TEMPLATE_WINDOWS_SERVER_2022", 3389, true),
    "windows-server-2019": def("PROXMOX_TEMPLATE_WINDOWS_SERVER_2019", 3389, true),
    "windows-11-pro": def("PROXMOX_TEMPLATE_WINDOWS_11_PRO", 3389, true),
    "ubuntu-24-04": def("PROXMOX_TEMPLATE_UBUNTU_24_04", 22, false),
    "debian-12": def("PROXMOX_TEMPLATE_DEBIAN_12", 22, false),
  };
}