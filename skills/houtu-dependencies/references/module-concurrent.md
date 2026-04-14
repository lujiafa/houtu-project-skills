# houtu-core Concurrency — Cross-thread Context Auto-propagation

## Maven Dependency

`houtu-core` is already a transitive dependency of other modules; no need to import separately.

## Auto-configuration

houtu-core automatically replaces Spring's default `ThreadPoolTaskExecutor` and `ThreadPoolTaskScheduler` with framework-enhanced versions via `CoreTaskExecutionAutoConfiguration`:

| Spring default | Framework replacement | Enhanced capability |
|------------|-----------|---------|
| `ThreadPoolTaskExecutor` | `TransferThreadPoolTaskExecutor` | Automatically captures parent thread context on task submission; auto-injects before child thread execution and auto-cleans after |
| `ThreadPoolTaskScheduler` | `TransferThreadPoolTaskScheduler` | Same as above, covers `@Scheduled` scenarios |

**Works out-of-the-box**, no configuration needed. Thread pool parameters are still configured via standard Spring `spring.task.execution.*` and `spring.task.scheduling.*` properties.

---

## Auto-propagated Contexts

The following framework contexts are automatically available in `@Async`, `CompletableFuture`, and `@Scheduled`:

| Context | Source module | Propagation mechanism |
|--------|---------|---------|
| `SessionContext` (current logged-in user session) | houtu-web-security | Built into framework, via `@CachingParam` + ThreadLocal |
| `HintContext` (canary routing labels) | spring-cloud-houtu-loadbalancer | SPI-registered `HintRequestAcrossThreadProcessor` |

```java
// Parent thread (Controller)
@CheckSession
@PostMapping("/order")
public ResponseData<Void> createOrder(OrderForm form) {
    orderService.createAsync(form);  // Async method
    return ResponseData.success();
}

// Child thread (@Async method) — SessionContext automatically available
@Async
public void createAsync(OrderForm form) {
    Session session = SessionContext.get();  // Auto-propagated from parent thread, no manual passing needed
    Long userId = (Long) session.getAttribute("userId");
    // ... business logic
}
```

---

## AcrossThreadProcessor — SPI Extension Point

To propagate custom contexts (e.g., MDC, tenant ID), implement the `AcrossThreadProcessor` interface and register via Java SPI.

```java
import io.github.lujiafa.houtu.core.concurrent.AcrossThreadProcessor;

public class MdcAcrossThreadProcessor implements AcrossThreadProcessor<Map<String, String>> {

    @Override
    public boolean available() {
        return true;  // Return false to disable this processor
    }

    @Override
    public Map<String, String> parentGet() {
        return MDC.getCopyOfContextMap();  // Executed in parent thread: capture context
    }

    @Override
    public void childExecuteBefore(Thread parentThread, Map<String, String> context) {
        if (context != null) MDC.setContextMap(context);  // Before child thread execution: inject context
    }

    @Override
    public void childExecuteAfter(Thread parentThread, Map<String, String> context) {
        MDC.clear();  // After child thread execution: clean up context
    }
}
```

**SPI registration**: Add the fully qualified class name of the implementation to `src/main/resources/META-INF/services/io.github.lujiafa.houtu.core.concurrent.AcrossThreadProcessor`.

**AcrossThreadProcessor\<T\> interface methods:**

| Method | Execution thread | Description |
|------|---------|------|
| `available()` | At load time | Return false to skip this processor, default true |
| `parentGet()` | Parent thread | Capture context data to be propagated |
| `childExecuteBefore(Thread parent, T data)` | Child thread | Inject context before task execution |
| `childExecuteAfter(Thread parent, T data)` | Child thread | Clean up context after task execution |

---

## Key Source Files

| Class | Description |
|----|------|
| `TransferThreadPoolTaskExecutor` | Replaces Spring default thread pool; triggers AcrossThreadProcessor chain on task submission |
| `TransferThreadPoolTaskScheduler` | Replaces Spring default scheduler |
| `TransferThreadPoolExecutor` | Underlying ThreadPoolExecutor enhancement |
| `DelegatingRunnable` | Wraps Runnable, carrying parent thread context |
| `AcrossThreadProcessorSupport` | SPI loader, discovers all processors via `ServiceLoader` |
| `CoreTaskExecutionAutoConfiguration` | Auto-configuration entry point, `@AutoConfigureBefore(TaskExecutionAutoConfiguration.class)` |

## Avoid by default (follow user if explicitly requested)

1. **Avoid by default** writing custom `TaskDecorator` to propagate context — the framework already handles this automatically
2. **Avoid by default** manually passing userId/sessionId and other context parameters in `@Async` method signatures — use `SessionContext.get()` directly
3. **Avoid by default** creating custom `ThreadPoolTaskExecutor` Bean to override the framework default — if you need to adjust parameters, use `spring.task.execution.*` configuration
