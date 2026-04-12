---
name: houtu-dependencies
description: >
  houtu-dependencies 企业级 Spring Cloud 微服务基础框架完整使用指南。
  GroupId 为 io.github.lujiafa，覆盖统一响应、异常处理、参数解析、
  会话鉴权、权限控制、签名验签、防重放、分布式锁、限流、数据库字段加密、配置解密、
  访问日志、灰度路由、权重负载均衡、Feign增强、Sentinel熔断、服务发现、
  Swagger文档、加密工具、HTTP客户端、监控指标等企业级能力。
  当项目构建文件（pom.xml 或 build.gradle/build.gradle.kts）中包含 io.github.lujiafa 或 houtu 相关依赖时，
  或当用户提到 houtu、houtu-dependencies 时，
  必须读取本 Skill 并严格按照框架约定生成代码。
  即使用户只是在做普通的 Spring Boot 开发（如写 Controller、Service、Feign），
  只要项目引入了 houtu，就必须使用 houtu 的方式而非原生 Spring 方式。
  当用户明确想用 houtu 框架且项目未引入时，主动帮其引入 BOM 和所需 Starter；
  当项目已引入时，在编码过程中根据业务场景主动识别并适时引入所需模块依赖，
  结合业务语义自然地融入框架能力增强业务服务，而非等待用户逐一指定。
metadata:
  author: jonlu
  version: "1.1"
---

# Houtu Framework — AI Agent Coding Guide

houtu-dependencies 是一套面向 Spring Boot / Spring Cloud 微服务的企业级基础框架，通过 Spring Boot Starter 机制实现"引入即生效"，让开发者完全聚焦业务逻辑。

**Repository**: https://github.com/lujiafa/houtu-dependencies
**Git Branches**: `3.5.2`, `3.5.1`, `3.5.0`, `2.7.2`, `2.7.1` (branch name = version)

---

## 核心原则

1. **引入即生效** — 添加 starter 依赖后能力自动启用，无需 @Enable 注解或手动配置
2. **注解声明式** — 通过注解控制行为（`@Lock`、`@CheckSession`、`@SecurityWatch`...），不要手写拦截器/AOP
3. **框架优先** — 框架已封装的能力，默认使用框架方式而非原生 Spring 方式；用户明确要求原生方式时服从用户
4. **约定优于配置** — 遵循框架默认约定，仅在需要定制时覆盖
5. **版本感知** — 不同版本的包路径、API 名称、配置方式存在差异，生成代码前必须确认版本

---

## 代码生成工作流（必须按顺序执行）

```
Step 1: 检测版本与依赖 → Step 2: 识别场景 → Step 3: 加载模块参考 → Step 4: 生成代码 → Step 5: 验证
```

### Step 1 — 检测版本与依赖

**生成任何代码前必须先确定版本，并确保 BOM 已引入。**

读取项目构建文件（`pom.xml` 或 `build.gradle` / `build.gradle.kts`），按以下顺序判断：

**1a. 已引入 houtu —** 构建文件中存在 `houtu-dependencies` 或 `spring-cloud-houtu`：
- 直接读取版本号确定版本，进入 Step 2
- **多模块项目**：BOM 通常在根 `pom.xml` 或根 `build.gradle` 的 `dependencyManagement` 中声明，子模块继承即可，无需重复添加

**1b. 未引入但用户明确要用 houtu —** 用户提到"使用 houtu"、"接入 houtu"、"用 houtu-dependencies"等：
- 确认版本（询问用户或根据项目 Spring Boot 版本推断：`3.x` → `3.5.2`，`2.x` → `2.7.2`）
- **主动在构建文件中添加 BOM**：

  **Maven（pom.xml）：**
  ```xml
  <!-- 基础模块 BOM（必须） -->
  <dependency>
      <groupId>io.github.lujiafa</groupId>
      <artifactId>houtu-dependencies</artifactId>
      <version>${version}</version>
      <type>pom</type>
      <scope>import</scope>
  </dependency>
  ```
  **Gradle（build.gradle / build.gradle.kts）：**
  ```kotlin
  // 基础模块 BOM（必须）
  implementation platform("io.github.lujiafa:houtu-dependencies:${version}")
  ```
  如果任务涉及 Spring Cloud 模块（Feign、灰度路由、Sentinel、服务发现），同时添加：
  ```xml
  <!-- Maven: Spring Cloud 增强模块 BOM -->
  <dependency>
      <groupId>io.github.lujiafa</groupId>
      <artifactId>spring-cloud-houtu</artifactId>
      <version>${version}</version>
      <type>pom</type>
      <scope>import</scope>
  </dependency>
  ```
  ```kotlin
  // Gradle: Spring Cloud 增强模块 BOM
  implementation platform("io.github.lujiafa:spring-cloud-houtu:${version}")
  ```
- 加载 `references/quick-start.md` 完成首次接入

**1c. 无法确定 —** 询问用户，或默认最新版 `3.5.2`

**确定版本后，立即加载对应版本参考文件**（`references/v{version}.md`），获取：
- 正确的包前缀（`io.github.lujiafa.houtu.*`）
- 正确的 namespace（`jakarta.*` 或 `javax.*`）
- 正确的配置路径（`spring.data.redis.*` 或 `spring.redis.*`）
- 依赖版本号（Spring Boot、Spring Cloud、Redisson 等）

### Step 2 — 识别场景并选择模块

分析编码任务，**不仅匹配用户显式要求，还要根据业务逻辑语义主动识别可增强的场景**（参见下方「业务场景增强指南」）。

从下表选择需要加载的模块参考文件（一个任务通常涉及多个模块）：

| 编码任务 | 模块 | 参考文件 |
|---------|------|---------|
| 新建微服务 / 首次接入 | — | `references/quick-start.md` |
| 写 Controller / 统一响应 / 异常处理 / 参数绑定 | houtu-web | `references/module-web.md` |
| 鉴权 / 权限 / 会话 / 签名 / 防重放 | houtu-web-security | `references/module-security.md` |
| 分布式锁 / 限流 | houtu-cache | `references/module-cache-lock.md` |
| 数据库敏感字段加密 | houtu-data-security | `references/module-data-security.md` |
| 请求访问日志 | houtu-access-log | `references/module-access-log.md` |
| 灰度路由 / Feign / Sentinel / 服务发现 | spring-cloud-houtu-* | `references/module-cloud.md` |
| 配置文件敏感值解密 | houtu-core | `references/module-config-decrypt.md` |
| API 文档 | houtu-web-swagger | `references/module-swagger.md` |
| 加密/签名/哈希/JSON/HTTP 客户端工具 | houtu-utils | `references/module-utils.md` |
| 监控指标 / Metrics / 可观测性 | houtu-actuator | `references/module-actuator.md` |
| 异步 / 定时任务 / 跨线程上下文传播 | houtu-core | `references/module-concurrent.md` |

> **示例**：用户说"写一个支付接口"，你应该同时识别出：`houtu-web`（Controller 响应）+ `houtu-web-security`（登录鉴权）+ `houtu-cache`（`@Lock` 防并发 + `@CheckRepeatRequest` 防重放）+ `houtu-access-log`（资金操作审计日志），而不是只写一个裸 Controller。

### Step 3 — 加载模块参考文件

**编写代码前加载对应模块参考文件。** 每个文件是完整配方：Maven 依赖 → 必需配置 → import → 代码模式 → 默认避免的做法 → 内部行为。

若任务涉及多个模块，加载所有相关文件。

### Step 4 — 生成代码（含依赖自动管理）

1. **检查并补齐 Starter 依赖** — 在 pom.xml 的 `<dependencies>` 中检查当前场景所需的模块是否已引入，未引入则主动添加（无需写 version，由 BOM 管理）。同理，如果场景涉及 `spring-cloud-houtu-*` 模块，确保 `spring-cloud-houtu` BOM 已在 `<dependencyManagement>` 中
2. 使用版本文件中的正确包前缀和 import
3. 使用模块文件中的 API 模式和代码示例
4. **检查反模式清单** — 确认没有用原生 Spring 方式重复实现
5. 使用框架的 Model 基类（`BaseForm`、`BaseVO`、`BaseDTO`、`PageForm`、`PageDataVO` 等）

### Step 5 — 验证

对于不确定的 API，通过 `git show <branch>:<path>` 读取源码验证：

```bash
git show <branch>:<file-path>
# 示例：
git show 3.5.2:houtu-cache/src/main/java/io/github/lujiafa/houtu/lock/annotation/Lock.java
```

---

## 业务场景增强指南（主动识别，适时应用）

编写业务代码时，不要等用户明确指定框架功能，而应**根据业务逻辑的语义主动识别适用的框架能力**并自然地融入代码。以下是常见的业务场景与框架增强的映射关系：

### 接口层（Controller）

| 业务特征 | 应增强的框架能力 | 说明 |
|---------|----------------|------|
| 任何 Controller 方法 | `ResponseData<T>` + `BaseForm`/`PageForm` | 基本约定，所有接口必须遵守 |
| 需要登录才能访问 | `@CheckSession` | 用户相关的接口默认加上 |
| 区分角色权限（如管理员 vs 普通用户） | `@RequiresRole` / `@RequiresPermission` | 根据业务描述判断，无需用户逐个指定 |
| 接口有审计/追溯需求 | `@AccessLog` | 涉及资金、订单、敏感操作时主动加上 |
| 接口接收用户输入的富文本/评论 | `@NotXss` | 凡是用户可编辑的文本字段都应加上 |
| 列表查询（带分页） | `PageForm` + `PageDataVO<T>` | 识别到"列表""查询""分页"关键意图时应用 |

### 业务层（Service）

| 业务特征 | 应增强的框架能力 | 说明 |
|---------|----------------|------|
| 并发写操作（如下单、扣库存、扣款） | `@Lock` | 识别到"支付""库存""余额"等并发敏感操作时主动加上 |
| 提交类操作（如下单、支付、转账） | `@CheckRepeatRequest` | 有幂等需求的写操作主动加上 |
| 调用外部 HTTP 接口（如支付回调、三方对接） | `HttpClients` | 不要用 RestTemplate/WebClient |
| 对象转换（Entity → VO / Form → DTO） | `BeanUtils.smartCopyProperties` | 不要用 Spring BeanUtils |
| JSON 操作 | `JsonUtils` | 不要自建 ObjectMapper |
| 高并发热点操作（如秒杀） | `RateLimiter` | 识别到"限流""秒杀""抢购"意图时应用 |
| 异步/定时任务中需访问会话或上下文 | 框架自动传播（`TransferThreadPoolTaskExecutor`） | `@Async`、`@Scheduled`、`CompletableFuture` 自动继承父线程的 SessionContext、HintContext 等上下文，无需手动处理 |

### 数据层

| 业务特征 | 应增强的框架能力 | 说明 |
|---------|----------------|------|
| 存储手机号、身份证、银行卡等敏感字段 | `@SecurityWatch` + `@SecurityParam` | 识别到字段名含 phone/mobile/idCard/bankAccount 等时主动建议 |
| 配置文件中的数据库密码、API Key | houtu-core 配置解密 | 识别到 password、secret、key 等配置项时主动建议 |

### 微服务层

| 业务特征 | 应增强的框架能力 | 说明 |
|---------|----------------|------|
| 服务间调用 | `@AutoFeign` | 不要手写 FeignClient + RequestInterceptor |
| 灰度/AB测试/多租户路由 | `HintContext` | 识别到"灰度""金丝雀""特定用户路由"意图时应用 |
| 外部系统回调（如支付通知） | `@CheckSign` + `@CheckRepeatRequest` | 回调场景通常同时需要签名校验和防重放 |

### 适用原则

1. **不过度增强** — 仅在业务语义确实匹配时才应用，不要为了展示功能而堆注解。如内部管理工具不一定需要 `@AccessLog`，简单查询不需要 `@Lock`
2. **不遗漏关键增强** — 涉及资金、安全、并发的场景必须加对应能力，这是框架存在的核心价值
3. **渐进式引入** — 用户首次接入时先保证基础能力（`houtu-web`），后续编码中根据实际场景逐步引入其他模块
4. **依赖按需添加** — 使用某模块能力时，先检查 pom.xml 是否已引入该 Starter，未引入则主动添加

---

## 反模式清单（Agent 自主编码时默认遵循，用户明确要求时服从用户）

| 场景 | ⚠️ 默认避免 | ✅ 框架方式（优先） |
|------|--------|-----------------|
| 接口鉴权 | 引入 spring-security 或手写 Filter 校验 token | `@CheckSession` + `@RequiresRole` / `@RequiresPermission` |
| 统一响应 | 自定义 Result/Response 类或用 ResponseEntity 包装 | 返回 `ResponseData<T>` 或 `EmbedResponseData` |
| 异常处理 | 自写 @ControllerAdvice + @ExceptionHandler | 抛 `BusinessException`，框架自动处理 |
| 参数校验响应 | 自己捕获 BindException 格式化 | 框架自动处理，返回 `{code:30, message:"..."}` |
| 数据库字段加密 | 手写 TypeHandler 或 Service 层手动加解密 | `@SecurityWatch` + `@SecurityParam` 注解 |
| 分布式锁 | 自写 Redis SETNX 或 Redisson 调用 | `@Lock` 注解或 `LockSupport` |
| Feign 调用 | 手写 RequestInterceptor 传递 header | 框架自动透传，用 `@AutoFeign` 发布接口 |
| 请求日志 | 手写 Filter/Interceptor 记录日志 | `@AccessLog` 注解 |
| 签名验证 | 手写签名校验拦截器 | `@CheckSign` 注解 |
| 防重放 | 手写 Redis 幂等检查 | `@CheckRepeatRequest` 注解 |
| 负载均衡 | 自写 LoadBalancer 策略 | 使用 `HintContext` + 配置权重 |
| Swagger 文档 | 自己引入 springdoc/springfox 并配置 | 引入 `houtu-web-swagger` starter |
| 限流 | 自写 Redis Lua 限流脚本 | 使用 `RateLimiter` |
| 对称/非对称加密 | 自行引入 BouncyCastle 或手写加密工具类 | 使用 `SM4Utils` / `AESUtils` / `RSAUtils` / `SM2Utils` 等 |
| JSON 序列化 | 自行创建 ObjectMapper 实例 | 使用 `JsonUtils` |
| HTTP 客户端 | 自行创建 RestTemplate 或 HttpClient | 使用框架自动配置的 `HttpClients` |
| 配置值解密 | 自写 EnvironmentPostProcessor 或启动时手动解密 | 使用 houtu-core 的 `decrypt` 配置 |
| 监控指标 | 自写 Micrometer MeterBinder 采集接口指标 | 引入 `houtu-actuator` starter 自动采集 |
| 异步线程上下文传递 | 手写 `TaskDecorator` 或手动在子线程中 set/get 上下文 | 框架自动替换为 `TransferThreadPoolTaskExecutor`，`@Async`/`CompletableFuture`/`@Scheduled` 自动传播 SessionContext、HintContext 等 |

---

## Model 基类体系

生成业务代码时应继承框架提供的基类：

```
BaseResponseData<T>        (interface: getCode(), getMessage(), getData())
├── ResponseData<T>        (标准 JSON 响应，含 code/message/data)
└── EmbedResponseData      (extends LinkedHashMap, 扁平化响应)

BaseForm                   (请求表单基类, implements Serializable)
└── PageForm               (分页请求, 含 currentPage/pageSize)

BaseDTO                    (数据传输基类, implements Serializable)
├── PageQueryDTO           (分页查询 DTO, 含 currentPage/pageSize)
└── PageDataDTO<R,V>       (分页数据 DTO, 含 records/totalRecords/totalPages)

BaseVO                     (视图对象基类, implements Serializable)

PageDataVO<V> extends BaseDTO  (分页响应, 含 records/totalRecords/totalPages/currentPage/pageSize)
└── PageDataExtVO<D,V>         (分页响应 + 额外数据字段 D data，如分页列表附带汇总统计)
```

**PageDataVO 静态工厂方法：**
- `PageDataVO.build(PageDataDTO dto, Class<V> clazz)` — 从 DTO 转换
- `PageDataVO.build(currentPage, pageSize, totalRecords, List<V> records)` — 手动构建
- `PageDataVO.empty()` — 空分页

---

## 全部注解速查表

| 注解 | Target | 模块 | 关键参数 |
|------|--------|------|---------|
| `@CheckSession` | TYPE, METHOD | houtu-web-security | `value`(bool, default true) |
| `@RequiresRole` | METHOD | houtu-web-security | `value`(String[]), `logic`(Logic.OR/AND, default OR) |
| `@RequiresPermission` | METHOD | houtu-web-security | `value`(String[]), `logic`(Logic.OR/AND, default OR) |
| `@CheckSign` | TYPE, METHOD | houtu-web-security | `value`(bool, default true) |
| `@CheckRepeatRequest` | TYPE, METHOD | houtu-web-security | (无参数) |
| `@Lock` | METHOD | houtu-cache | `prefix`(String), `key`(String), `leaseTime`(long, -1), `waitTime`(long, -1), `unit`(TimeUnit.SECONDS) |
| `@AccessLog` | TYPE, METHOD | houtu-access-log | `value`(bool), `requestHeaders`(String[], default USER_AGENT), `requestBody`(bool, default false), `logFilterHandler`(Class) |
| `@SecurityWatch` | TYPE, METHOD | houtu-data-security | `encrypt`(bool), `encryptMapKeys`(String[]), `decrypt`(bool), `decryptMapKeys`(String[]), `processorBeanName`(String), `processorClass`(Class) |
| `@SecurityParam` | PARAMETER, FIELD | houtu-data-security | (无参数) |
| `@AutoFeign` | TYPE, METHOD | sc-houtu-feign | `value`(bool, default true), `responseBody`(bool, default true) |
| `@NotXss` | FIELD, PARAMETER | houtu-web | `message`(String, default "内容包含不安全信息") |

---

## 预定义错误码（ErrorCodeConstant）

| 码值 | 常量 | 描述 |
|------|------|------|
| 0 | SUCCESS | 成功 |
| 1 | INTERNAL_ERROR | 内部错误 |
| 2 | SERVER_BUSY | 服务繁忙 |
| 3 | NETWORK_ERROR | 网络错误 |
| 4 | OPERATION_FAIL | 操作失败 |
| 5 | REQUEST_INVALID | 无效请求 |
| 6 | REQUEST_INVALID_IP | IP 无效 |
| 7 | REQUEST_INVALID_DATA | 数据无效 |
| 8 | REQUEST_REPEAT | 重复请求 |
| 9 | REQUEST_TOO_FREQUENCY | 请求过频 |
| 10 | USERNAME_NOT_EXIST | 用户名不存在 |
| 11 | ACCOUNT_LOCKED | 账户已锁定 |
| 12 | ACCOUNT_EXCEPTION | 账户异常 |
| 13 | PASSWORD_ERROR | 密码错误 |
| 14 | USERNAME_OR_PASSWORD_ERROR | 用户名或密码错误 |
| 15 | SESSION_EXPIRED | 会话过期 |
| 16 | SESSION_KICK_OUT_EXPIRED | 会话被踢出 |
| 17 | INVALID_VERIFICATION_INFO | 验证信息无效 |
| 18 | INVALID_SIGNATURE_INFO | 签名无效 |
| 19 | ACCESS_PERMISSIONS_DENIED | 权限不足 |
| 30 | PARAMETER_ERROR | 参数错误 |
| 31 | PARAMETER_FORMAT_ERROR | 参数格式错误 |
| 32 | NOT_SUPPORTED_PARAMETER_TYPE_CONVERSION | 参数类型转换不支持 |
| 40 | DATA_LOADING_FAILED | 数据加载失败 |
| 41 | DATA_NOT_EXIST | 数据不存在 |
| 42 | DATA_ALREADY_EXIST | 数据已存在（v2.7.1、v3.5.0、v3.5.1 中为 41，与 DATA_NOT_EXIST 相同的BUG，v2.7.2 和 v3.5.2 已修复） |

业务自定义错误码建议从 **100** 开始，通过 `ErrorCode.build(code)` 构建，支持 i18n。

---

## 源码验证（兜底）

当参考文件未覆盖某 API 或需确认参数时，通过 `git show` 读取框架源码：

```bash
git show <branch>:<file-path>
```

| 模块 | 关键源文件（`src/main/java/` 下） |
|------|--------------------------------------|
| houtu-core | `.../core/exception/BusinessException.java`, `.../core/exception/ErrorCode.java`, `.../core/constant/ErrorCodeConstant.java`, `.../core/context/SpringApplicationContext.java` |
| houtu-web | `.../web/model/ResponseData.java`, `.../web/model/EmbedResponseData.java`, `.../web/model/vo/PageDataVO.java`, `.../web/model/form/PageForm.java`, `.../web/handler/UnifiedHandlerExceptionResolver.java`, `.../web/validation/constroins/NotXss.java` |
| houtu-web-security | `.../websecurity/annotation/*.java`, `.../websecurity/session/SessionContext.java` |
| houtu-cache | `.../lock/annotation/Lock.java`, `.../lock/support/LockSupport.java`, `.../lock/support/BLock.java`, `.../limit/RateLimiter.java` |
| houtu-data-security | `.../data/security/annotation/SecurityWatch.java`, `.../data/security/handler/SecurityProcessor.java` |
| houtu-access-log | `.../accesslog/annotation/AccessLog.java`, `.../accesslog/handler/LogFilterHandler.java` |
| houtu-utils | `.../util/crypto/*.java`, `.../util/JsonUtils.java`, `.../util/HttpClients.java` |
| houtu-actuator | `.../actuator/metrics/*.java` |
| sc-houtu-loadbalancer | `.../loadbalancer/support/hint/HintContext.java` |
| sc-houtu-feign | `.../feign/anotation/AutoFeign.java` |
| sc-houtu-discovery | `.../discovery/context/ServiceContext.java` |

> 路径前缀：`io/github/lujiafa/houtu`
> 注意：`@AutoFeign` 的包名为 `anotation`（非 `annotation`），这是框架原始拼写。

---

## 版本快速对比

| 特性 | v3.5.2 | v3.5.1 | v3.5.0 | v2.7.2 | v2.7.1 |
|------|--------|--------|--------|--------|--------|
| JDK | 17+ | 17+ | 17+ | 1.8+ | 1.8+ |
| Spring Boot | 3.5.11 | 3.5.11 | 3.5.11 | 2.7.18 | 2.7.18 |
| 包前缀 | `io.github.lujiafa.houtu` | 同左 | 同左 | 同左 | 同左 |
| Namespace | `jakarta.*` | `jakarta.*` | `jakarta.*` | `javax.*` | `javax.*` |
| Redis 配置 | `spring.data.redis.*` | 同左 | 同左 | `spring.redis.*` | `spring.redis.*` |
| Nacos 配置 | `spring.config.import` | 同左 | **bootstrap.yml** | bootstrap.yml | bootstrap.yml |
| SCA 版本 | 2025.0.0.0 | 同左 | **2023.0.1.2** | 2021.0.6.2 | 2021.0.6.2 |
| @Lock SpEL | ✅ | ✗ | ✗ | ✗ | ✗ |

> 详细版本信息见 `references/v{version}.md`
