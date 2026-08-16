-- IRCTC RDP backend schema v1
-- All tables are private to the backend API. Never exposed to the frontend.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  family ENUM('intel','amd') NOT NULL,
  platform VARCHAR(64) NOT NULL,
  name VARCHAR(64) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  cpu_cores SMALLINT UNSIGNED NOT NULL,
  ram_gb SMALLINT UNSIGNED NOT NULL,
  storage_gb SMALLINT UNSIGNED NOT NULL,
  price_inr INT UNSIGNED NOT NULL,
  price_usd INT UNSIGNED NOT NULL,
  popular TINYINT(1) NOT NULL DEFAULT 0,
  best_value TINYINT(1) NOT NULL DEFAULT 0,
  features JSON NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  plan_id VARCHAR(32) NOT NULL,
  region VARCHAR(32) NOT NULL,
  os VARCHAR(32) NOT NULL,
  billing_cycle ENUM('monthly','quarterly','annual') NOT NULL DEFAULT 'monthly',
  amount_inr INT UNSIGNED NOT NULL,
  status ENUM('CREATED','PENDING_PAYMENT','PAID','PROVISIONING','ACTIVE','FAILED','SUSPENDED','CANCELLED','TERMINATED','REFUNDED') NOT NULL DEFAULT 'CREATED',
  provisioning_key VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_provisioning_key (provisioning_key),
  KEY idx_orders_user (user_id),
  KEY idx_orders_status (status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_product FOREIGN KEY (plan_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  razorpay_order_id VARCHAR(64) NULL,
  razorpay_payment_id VARCHAR(64) NULL,
  amount_inr INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  status ENUM('CREATED','PENDING','AUTHORIZED','CAPTURED','FAILED','REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'CREATED',
  method VARCHAR(32) NULL,
  error_code VARCHAR(64) NULL,
  error_description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payments_rzp_order (razorpay_order_id),
  UNIQUE KEY uq_payments_rzp_payment (razorpay_payment_id),
  KEY idx_payments_order (order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  payment_id VARCHAR(64) NULL,
  order_id VARCHAR(36) NULL,
  payload JSON NOT NULL,
  processed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_events_event (event_id),
  KEY idx_payment_events_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS servers (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NULL,
  status ENUM('PROVISIONING','ACTIVE','SUSPENDED','TERMINATED','FAILED','REINSTALLING','REBOOTING') NOT NULL DEFAULT 'PROVISIONING',
  hostname VARCHAR(120) NOT NULL,
  ipv4 VARCHAR(45) NULL,
  os VARCHAR(32) NOT NULL,
  cpu_cores SMALLINT UNSIGNED NOT NULL,
  ram_gb SMALLINT UNSIGNED NOT NULL,
  region VARCHAR(32) NOT NULL,
  rdp_port INT UNSIGNED NULL,
  proxmox_vm_id INT UNSIGNED NULL,
  node VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_servers_order (order_id),
  KEY idx_servers_user (user_id),
  CONSTRAINT fk_servers_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_servers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS provisioning_jobs (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  job_type VARCHAR(32) NOT NULL DEFAULT 'provision_server',
  status ENUM('queued','processing','completed','failed','retrying') NOT NULL DEFAULT 'queued',
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  next_run_at TIMESTAMP NULL,
  last_error VARCHAR(500) NULL,
  result JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_jobs_order (order_id),
  KEY idx_jobs_status_next (status, next_run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proxmox_nodes (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  node_name VARCHAR(80) NOT NULL,
  status ENUM('online','offline','maintenance','unknown') NOT NULL DEFAULT 'unknown',
  cpu_cores SMALLINT UNSIGNED NULL,
  memory_total_mb INT UNSIGNED NULL,
  memory_used_mb INT UNSIGNED NULL,
  disk_total_gb INT UNSIGNED NULL,
  disk_used_gb INT UNSIGNED NULL,
  last_checked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_nodes_name (node_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ip_addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  region VARCHAR(32) NOT NULL,
  ipv4 VARCHAR(45) NOT NULL,
  gateway VARCHAR(45) NOT NULL,
  prefix_len SMALLINT UNSIGNED NOT NULL DEFAULT 24,
  dns_primary VARCHAR(45) NOT NULL DEFAULT '1.1.1.1',
  dns_secondary VARCHAR(45) NOT NULL DEFAULT '8.8.8.8',
  status ENUM('free','reserved','allocated') NOT NULL DEFAULT 'free',
  server_id VARCHAR(36) NULL,
  allocated_at TIMESTAMP NULL,
  released_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ip_region_ip (region, ipv4),
  KEY idx_ip_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  billing_cycle ENUM('monthly','quarterly','annual') NOT NULL,
  status ENUM('active','cancelled','past_due','terminated') NOT NULL DEFAULT 'active',
  current_period_start DATE NULL,
  current_period_end DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_subscriptions_order (order_id),
  CONSTRAINT fk_subscriptions_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_type ENUM('user','system','internal') NOT NULL DEFAULT 'system',
  actor_id VARCHAR(64) NULL,
  action VARCHAR(120) NOT NULL,
  resource_type VARCHAR(64) NULL,
  resource_id VARCHAR(64) NULL,
  request_id VARCHAR(64) NULL,
  ip VARCHAR(45) NULL,
  meta JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_resource (resource_type, resource_id),
  KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;