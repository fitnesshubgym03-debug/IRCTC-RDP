export interface NodeStatus {
  nodeName: string;
  status: "online" | "offline" | "maintenance" | "unknown";
  cpuCores: number | null;
  memoryTotalMb: number | null;
  memoryUsedMb: number | null;
  diskTotalGb: number | null;
  diskUsedGb: number | null;
}

export interface ProvisionInput {
  orderId: string;
  hostname: string;
  templateId: string;
  cpuCores: number;
  ramMB: number;
  diskGB: number;
  ipv4: string;
  gateway: string;
  prefixLen: number;
  dnsPrimary: string;
  dnsSecondary: string;
  /** true when the OS image is Windows (custom init, no cloud-init). */
  windows: boolean;
}

export interface ProvisionedVm {
  vmId: number;
  node: string;
}

/**
 * The provisioner talks ONLY to Proxmox through this interface.
 * The backend never sees PVE credentials; the browser never sees this service.
 */
export interface ProxmoxAdapter {
  mode: "simulated" | "real";

  /** Idempotent: if a VM for this order already exists, return it. */
  ensureVm(input: ProvisionInput): Promise<ProvisionedVm>;

  reboot(orderId: string): Promise<void>;
  reinstall(orderId: string, input: ProvisionInput): Promise<ProvisionedVm>;
  destroy(orderId: string): Promise<void>;

  /** Wait until the VM is running (guest reachable where possible). */
  waitHealthy(orderId: string, timeoutMs: number): Promise<void>;

  collectNodes(): Promise<NodeStatus[]>;
}