# houtu-dependencies

[中文](README-CN.md) | English

> AI Agent autonomous coding guide for the [Houtu](https://github.com/lujiafa/houtu-dependencies) enterprise Java framework.

## Design for AgentCoding

Humans don't participate in writing code. The AI agent loads this skill and produces production-ready code that correctly uses the Houtu framework.

**Three layers of accuracy guarantee:**
1. **Anti-pattern table** — prevents agent from using raw Spring when Houtu provides the capability
2. **Module recipe files** — complete step-by-step: Maven → config → import → code → prohibitions
3. **Source code verification** — `git show` fallback when API uncertain

## Structure

```
houtu-dependencies/
├── SKILL.md                             # Entry: principles + anti-patterns + version detect + module select
├── references/
│   ├── quick-start.md                   # New project scaffolding recipe
│   ├── module-web.md                    # ResponseData, exception, param binding
│   ├── module-security.md               # Session, auth, RBAC, signing, anti-replay
│   ├── module-cache-lock.md             # @Lock, LockSupport, RateLimiter
│   ├── module-data-security.md          # @SecurityWatch, @SecurityParam
│   ├── module-access-log.md             # @AccessLog, LogFilterHandler
│   ├── module-cloud.md                  # Loadbalancer, Feign, Discovery, Sentinel
│   ├── module-config-decrypt.md         # Configuration value decryption
│   ├── module-swagger.md                # Swagger/OpenAPI auto-config
│   ├── module-utils.md                  # JsonUtils, HttpClients, crypto, BeanUtils
│   ├── module-actuator.md               # Prometheus metrics auto-config
│   ├── v3.5.1.md / v3.5.0.md           # Version-specific diffs
│   └── v2.7.2.md / v2.7.1.md            # Version-specific diffs
└── evals/
    └── evals.json                       # 18 test scenarios for validation
```