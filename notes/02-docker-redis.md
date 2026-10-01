# Docker & Redis — Production Cheat Sheet & Mental Model

### 1. The Core Problem
*Why did installing databases directly on the host OS fail? What exact engineering problem made Docker Compose and Redis necessary?*

1. **Host OS Pollution & Version Conflicts ("Works on My Machine"):** Installing PostgreSQL, extensions like `pgvector`, and Redis directly onto Windows creates port collisions, requires admin privileges, leaves background services consuming resources, and makes onboarding new developers error-prone.
2. **Missing Vector Math in Standard PostgreSQL:** Standard `postgres:16` images lack compiled C extensions required to perform cosine distance calculations (`<=>`) across 768-dimensional AI embeddings.
3. **Database Disk Latency for Ephemeral Data:** Storing rapid, multi-turn AI chat conversations or shopping cart sessions in PostgreSQL causes unnecessary disk writes, table bloat, and ~10-25ms latency. Furthermore, cleaning up expired sessions in Postgres requires building manual background cron jobs.

Docker Compose solves multi-container orchestration with reproducible networking and storage, while Redis provides sub-millisecond in-memory caching with automatic key expiration (TTL).

---

### 2. The Mental Model
*How do I visualize how this works?*

```text
[ Host OS (Your Machine) ]
       │
       ├── Browser / DBeaver ──(Port 5432)──► [ shopmate_postgres (pgvector:pg16) ]
       │                                       └── Volume: postgres_data (Local Disk)
       │
       ├── Browser (localhost:5540) ────────► [ shopmate_redis_insight (Web GUI) ]
       │                                       │
       │                                (Internal DNS: redis:6379)
       │                                       ▼
       └── Node API / redis-cli ─(Port 6379)─► [ shopmate_redis (RAM / In-Memory) ]
                                               └── Volume: redis_data (Local Disk)
```

- **Docker Bridge Network:** All containers in the same `docker-compose.yml` share a private internal network. They reach each other by **service name** (e.g. `redis:6379`), while your host machine reaches them via mapped ports (`localhost:6379`).
- **RAM vs Disk:** PostgreSQL writes durable transactions to disk/SSD. Redis holds active data structures directly in RAM for sub-millisecond retrieval and auto-purges them when TTL expires.

---

### 3. Detailed Topic Breakdown

#### 1. Docker Compose Orchestration & Multi-Container Networking
`docker-compose.yml` defines multiple interconnected services in a single declarative file. Docker automatically creates a shared bridge network (`shopmate_ai_default`), providing automatic internal DNS resolution between containers.

#### 2. PostgreSQL 16 vs `pgvector/pgvector:pg16`
Standard PostgreSQL does not include the vector extension. `pgvector/pgvector:pg16` is a pre-compiled image that bundles the vector extension, enabling cosine distance searches (`<=>`), Euclidean distance (`<->`), and HNSW indexing for AI embeddings.

#### 3. Port Mapping & Localhost vs Container DNS
- `ports: ["6379:6379"]` maps `HostPort:ContainerPort`.
- Outside container (your machine): connect via `localhost:6379`.
- Inside container network (RedisInsight -> Redis): connect via service name `redis:6379`.

#### 4. Named Volumes & `driver: local` Mechanics
Containers are ephemeral by nature. Named volumes preserve database files across restarts. `driver: local` instructs Docker to write data to the host machine's local disk managed by the Docker storage subsystem without requiring external cloud storage plugins.

#### 5. Environment Variable Interpolation & Security
Never hardcode passwords or sensitive credentials in `docker-compose.yml`. Use `${VARIABLE:-fallback}` syntax so credentials are read from `.env` and can be overridden per environment.

#### 6. Redis Architecture: In-Memory (RAM) vs Disk (SSD)
PostgreSQL optimizes for ACID transactional durability, querying indexes from disk/buffer pools (~5-25ms). Redis stores all data structures in system memory (RAM), achieving sub-millisecond (<1ms) reads and writes.

#### 7. Redis Key-Value Operations & Sub-Millisecond Latency
Core Redis commands allow instant access without SQL overhead:
```text
SET user:1:name "Saka"
GET user:1:name
DEL user:1:name
```

#### 8. Time-To-Live (TTL) & Auto-Expiration Mechanics
Keys can have an automatic self-destruction timer. Once the TTL hits zero, Redis reclaims the memory automatically without needing database cron cleanup tasks:
```text
SETEX session:chat:123 3600 "conversation context"
TTL session:chat:123
```

#### 9. Inspecting Redis via GUI (RedisInsight) & CLI (`redis-cli`)
- **CLI:** `docker exec -it shopmate_redis redis-cli` gives an interactive command terminal.
- **Web GUI (RedisInsight):** Running on `http://localhost:5540`, it provides visual key-tree browsing, memory telemetry, and real-time TTL countdowns.

---

### 4. Production Gotchas / Best Practices

1. **Never Hardcode Secrets in Compose Files:** Always source database passwords from `.env` with fallback defaults for local development. Keep `.env` in `.gitignore`.
2. **Container Healthchecks:** Use `healthcheck` with `interval`, `timeout`, and `retries` (`pg_isready` and `redis-cli ping`) so depending services or startup scripts do not attempt connections before services are ready.
3. **RAM Sizing & Eviction Policies:** Redis stores everything in RAM. In production, configure `maxmemory` and an eviction policy (`allkeys-lru` or `volatile-lru`) to prevent out-of-memory crashes under heavy traffic.
4. **Never Expose Redis GUI in Production:** Tools like RedisInsight are strictly for local developer inspection; exposing them in production creates severe security vulnerabilities.
