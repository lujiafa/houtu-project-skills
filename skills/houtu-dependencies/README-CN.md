# houtu-dependencies

中文 | [English](README.md)

> [Houtu](https://github.com/lujiafa/houtu-dependencies) 企业级 Java 框架 AI Agent 自主编码指南。

## 面向 AgentCoding 设计

人类不参与手动改代码。AI Agent 加载此 skill 后，能生成正确使用 Houtu 框架的生产级代码。

**三层准确性保障：**
1. **反模式清单** — 防止 agent 用原生 Spring 方式替代 Houtu 能力
2. **模块配方文件** — 完整步骤：Maven → 配置 → import → 代码 → 默认避免事项
3. **源码验证** — API 不确定时通过 `git show` 读源码兜底

## 结构

```
houtu-dependencies/
├── SKILL.md                             # 入口：原则 + 反模式 + 版本检测 + 模块选择
├── references/
│   ├── quick-start.md                   # 新项目脚手架配方
│   ├── module-web.md                    # ResponseData、异常、参数绑定
│   ├── module-security.md               # 会话、鉴权、RBAC、签名、防重放
│   ├── module-cache-lock.md             # @Lock、LockSupport、RateLimiter
│   ├── module-data-security.md          # @SecurityWatch、@SecurityParam
│   ├── module-access-log.md             # @AccessLog、LogFilterHandler
│   ├── module-cloud.md                  # 负载均衡、Feign、服务发现、Sentinel
│   ├── module-config-decrypt.md         # 配置文件敏感值解密
│   ├── module-swagger.md                # Swagger/OpenAPI 自动配置
│   ├── module-utils.md                  # JsonUtils、HttpClients、加密工具、BeanUtils
│   ├── module-actuator.md               # Prometheus 监控指标自动配置
│   ├── module-concurrent.md            # 跨线程上下文自动传播
│   ├── v3.5.2.md / v3.5.1.md / v3.5.0.md  # 版本差异
│   └── v2.7.3.md / v2.7.2.md / v2.7.1.md  # 版本差异
└── evals/
    └── evals.json                       # 27 个验证测试场景
```