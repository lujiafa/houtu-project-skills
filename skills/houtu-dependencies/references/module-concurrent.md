# houtu-core 并发 — 跨线程上下文自动传播

## Maven 依赖

`houtu-core` 已被其他模块传递依赖，无需单独引入。

## 自动配置

houtu-core 通过 `CoreTaskExecutionAutoConfiguration` 自动替换 Spring 默认的 `ThreadPoolTaskExecutor` 和 `ThreadPoolTaskScheduler` 为框架增强版本：

| Spring 默认 | 框架替换为 | 增强能力 |
|------------|-----------|---------|
| `ThreadPoolTaskExecutor` | `TransferThreadPoolTaskExecutor` | 提交任务时自动捕获父线程上下文，子线程执行前自动注入、执行后自动清理 |
| `ThreadPoolTaskScheduler` | `TransferThreadPoolTaskScheduler` | 同上，覆盖 `@Scheduled` 场景 |

**引入即生效**，无需配置。线程池参数仍通过标准 Spring `spring.task.execution.*` 和 `spring.task.scheduling.*` 配置。

---

## 自动传播的上下文

以下框架上下文在 `@Async`、`CompletableFuture`、`@Scheduled` 中自动可用：

| 上下文 | 来源模块 | 传播机制 |
|--------|---------|---------|
| `SessionContext`（当前登录用户会话） | houtu-web-security | 框架内置，通过 `@CachingParam` + ThreadLocal |
| `HintContext`（灰度路由标签） | spring-cloud-houtu-loadbalancer | SPI 注册 `HintRequestAcrossThreadProcessor` |

```java
// 父线程（Controller）
@CheckSession
@PostMapping("/order")
public ResponseData<Void> createOrder(OrderForm form) {
    orderService.createAsync(form);  // 异步方法
    return ResponseData.success();
}

// 子线程（@Async 方法）— SessionContext 自动可用
@Async
public void createAsync(OrderForm form) {
    Session session = SessionContext.get();  // 自动从父线程传播，无需手动传递
    Long userId = (Long) session.getAttribute("userId");
    // ... 业务逻辑
}
```

---

## AcrossThreadProcessor — SPI 扩展点

如需传播自定义上下文（如 MDC、租户 ID），实现 `AcrossThreadProcessor` 接口并通过 Java SPI 注册。

```java
import io.github.lujiafa.houtu.core.concurrent.AcrossThreadProcessor;

public class MdcAcrossThreadProcessor implements AcrossThreadProcessor<Map<String, String>> {

    @Override
    public boolean available() {
        return true;  // 返回 false 则此 processor 不生效
    }

    @Override
    public Map<String, String> parentGet() {
        return MDC.getCopyOfContextMap();  // 父线程中执行：捕获上下文
    }

    @Override
    public void childExecuteBefore(Thread parentThread, Map<String, String> context) {
        if (context != null) MDC.setContextMap(context);  // 子线程执行前：注入上下文
    }

    @Override
    public void childExecuteAfter(Thread parentThread, Map<String, String> context) {
        MDC.clear();  // 子线程执行后：清理上下文
    }
}
```

**SPI 注册**：在 `src/main/resources/META-INF/services/io.github.lujiafa.houtu.core.concurrent.AcrossThreadProcessor` 文件中写入实现类全限定名。

**AcrossThreadProcessor\<T\> 接口方法：**

| 方法 | 执行线程 | 说明 |
|------|---------|------|
| `available()` | 加载时 | 返回 false 跳过此 processor，默认 true |
| `parentGet()` | 父线程 | 捕获需要传递的上下文数据 |
| `childExecuteBefore(Thread parent, T data)` | 子线程 | 任务执行前注入上下文 |
| `childExecuteAfter(Thread parent, T data)` | 子线程 | 任务执行后清理上下文 |

---

## 关键源文件

| 类 | 说明 |
|----|------|
| `TransferThreadPoolTaskExecutor` | 替换 Spring 默认线程池，任务提交时触发 AcrossThreadProcessor 链 |
| `TransferThreadPoolTaskScheduler` | 替换 Spring 默认调度器 |
| `TransferThreadPoolExecutor` | 底层 ThreadPoolExecutor 增强 |
| `DelegatingRunnable` | 包装 Runnable，携带父线程上下文 |
| `AcrossThreadProcessorSupport` | SPI 加载器，通过 `ServiceLoader` 发现所有 processor |
| `CoreTaskExecutionAutoConfiguration` | 自动配置入口，`@AutoConfigureBefore(TaskExecutionAutoConfiguration.class)` |

## 默认避免（用户明确要求时除外）

1. **默认避免** 手写 `TaskDecorator` 传播上下文 — 框架已自动处理
2. **默认避免** 在 `@Async` 方法签名中手动传递 userId/sessionId 等上下文参数 — 直接用 `SessionContext.get()`
3. **默认避免** 自行创建 `ThreadPoolTaskExecutor` Bean 覆盖框架默认 — 如需调整参数，使用 `spring.task.execution.*` 配置
