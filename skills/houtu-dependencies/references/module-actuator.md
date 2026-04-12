# houtu-actuator — 监控指标 / Metrics / 可观测性

## Maven 依赖

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-actuator</artifactId>
</dependency>
```

传递依赖：Spring Boot Starter Actuator、Micrometer Registry Prometheus、SkyWalking APM Toolkit

> houtu-actuator 的 web、redis、jdbc 依赖均为 optional，需项目自行引入对应 starter。

## 自动配置

引入即生效，根据 classpath 和配置自动注册以下能力：

| 能力 | 条件 | 自动配置类 |
|------|------|-----------|
| Web 请求指标（业务状态码分布） | Servlet 应用 + 配置 percentiles | `ActuatorWebMetricsAutoConfiguration` |
| HttpClient5 请求指标 | HttpClient on classpath + 配置 percentiles | `ActuatorWebMetricsAutoConfiguration` |
| DataSource 连接池指标 | HikariDataSource + MeterRegistry | `ActuatorDataSourcePoolMetricsAutoConfiguration` |
| Redis 命令延迟指标 | Lettuce RedisClient + MeterRegistry | `ActuatorRedisMetricsAutoConfiguration` |

---

## 1. Web 请求指标

### 启用条件

在 `application.yml` 中配置 percentiles：

```yaml
management:
  metrics:
    distribution:
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
```

### 自动采集内容

- 标准 HTTP 指标（method、status、uri）
- **业务状态码分布**（自动从 `ResponseData.getCode()` 提取 `code` tag）
- 异常类型标签（`BusinessException` 及其包装异常）

### 工作原理

框架通过 `ResponseBodyAdviceAndWebMvcTagsContributor`（同时实现 `ResponseBodyAdvice` 和 `DefaultServerRequestObservationConvention`）自动拦截响应体：

1. 在响应写出前，从 `BaseResponseData.getCode()` 提取业务码
2. 将业务码作为 low cardinality tag `code` 注入到 Observation 中
3. 对 `BusinessException` 提取异常类型标签

> 无需手动埋点，只要 Controller 返回 `ResponseData<T>` 即可自动采集。

---

## 2. HttpClient5 请求指标

### 启用条件

```yaml
management:
  metrics:
    distribution:
      percentiles:
        http.client.requests: 0.5, 0.95, 0.99
```

### 自动采集的 Tags

**Low Cardinality Tags（用于聚合）：**

| Tag | 说明 | 示例 |
|-----|------|------|
| `svrname` | scheme://host:port | `https://api.example.com:443` |
| `method` | HTTP 方法 | `GET`, `POST` |
| `uri` | 请求 URI | `/api/users` |
| `status` | HTTP 响应状态码 | `200`, `500`, `UNKNOWN` |
| `exception` | 异常类名 | `none`, `IOException` |

### 控制 URI 基数 — HttpClientMetric

当请求路径包含路径变量（如 `/users/{id}`）时，每个不同的 id 都会生成新的 metric tag，导致 OOM。使用 `HttpClientMetric` 自定义 metric URI：

```java
import io.github.lujiafa.houtu.actuator.metrics.client.HttpClientMetric;

// 在发起 HTTP 请求前调用
HttpClientMetric.metric("/api/users/{id}");  // 自定义 metric URI
HttpClients.get("https://api.example.com/users/12345");

// 或使用默认 URI（不含路径变量时）
HttpClientMetric.metric();
HttpClients.get("https://api.example.com/users");
```

**注意**：`HttpClientMetric.metric()` 基于 ThreadLocal，必须在 HTTP 请求前调用。不调用时不采集该请求的指标。

---

## 3. DataSource 连接池指标

### 启用条件

classpath 存在 `HikariDataSource` + `MeterRegistry` 即自动启用，无需额外配置。

### 自动采集内容

通过 `MicrometerMetricsTrackerFactory` 自动采集 HikariCP 连接池指标：

- `hikaricp.connections` — 总连接数
- `hikaricp.connections.active` — 活跃连接数
- `hikaricp.connections.idle` — 空闲连接数
- `hikaricp.connections.pending` — 等待连接的线程数
- `hikaricp.connections.creation` — 连接创建时间
- `hikaricp.connections.acquire` — 连接获取时间
- `hikaricp.connections.usage` — 连接使用时间
- `hikaricp.connections.timeout` — 连接超时次数

### 多数据源支持

框架自动检测 `Map<String, HikariDataSource>` 类型的 Bean（如动态数据源），为每个数据源设置独立的 pool name 并注册独立的 metrics。

---

## 4. Redis 命令延迟指标

### 启用条件

classpath 存在 Lettuce `RedisClient` + `MicrometerCommandLatencyRecorder` + `MeterRegistry`。

### 配置

```yaml
management:
  metrics:
    enable:
      redis.lettuce: true                              # 启用 Redis 指标
    distribution:
      percentiles-histogram:
        redis.lettuce: true                            # 启用直方图
      percentiles:
        redis.lettuce: 0.5, 0.95, 0.99                # 百分位配置
```

### 自动采集内容

通过 Lettuce 的 `MicrometerCommandLatencyRecorder` 采集 Redis 命令延迟：

- `lettuce.command.completion` — 命令完成延迟
- `lettuce.command.firstresponse` — 首次响应延迟

---

## 5. Prometheus 端点

houtu-actuator 传递依赖 `micrometer-registry-prometheus`，默认暴露 `/actuator/prometheus` 端点。

确保配置：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, prometheus
```

---

## 自定义扩展

### 自定义 HttpClient5 Observation Convention

注册自定义 `HttpClient5ObservationConvention` Bean 覆盖默认实现：

```java
@Bean
public HttpClient5ObservationConvention customConvention() {
    return new HttpClient5ObservationConvention("custom.http.client") {
        @Override
        public KeyValues getLowCardinalityKeyValues(HttpClient5RequestReplySenderContext context) {
            // 自定义 tag 逻辑
            return super.getLowCardinalityKeyValues(context);
        }
    };
}
```

### 自定义 Web 业务码采集

默认从 `BaseResponseData.getCode()` 提取。如需覆盖，注册自定义 `ResponseBodyAdviceAndWebMvcTagsContributor` Bean。

---

## 默认避免（用户明确要求时除外）

1. **默认避免** 自行创建 MeterBinder 采集 HTTP 接口指标 — 框架已自动采集
2. **默认避免** 自行注册 Micrometer Filter 采集 HttpClient 指标 — 使用框架的 Observation 机制
3. **默认避免** 自行配置 HikariCP 的 MetricsTrackerFactory — 框架自动注册
4. **默认避免** 单独引入 `micrometer-registry-prometheus` — houtu-actuator 已传递依赖
5. **默认避免** 忽略 `HttpClientMetric.metric()` 调用 — 对含路径变量的请求不调用会导致指标基数爆炸
