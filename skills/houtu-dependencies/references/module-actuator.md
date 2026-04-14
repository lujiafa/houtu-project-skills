# houtu-actuator — Monitoring / Metrics / Observability

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-actuator</artifactId>
</dependency>
```

Transitive dependencies: Spring Boot Starter Actuator, Micrometer Registry Prometheus, SkyWalking APM Toolkit

> houtu-actuator's web, redis, and jdbc dependencies are all optional; the project must import the corresponding starters separately.

## Auto-configuration

Works out-of-the-box; automatically registers the following capabilities based on classpath and configuration:

| Capability | Condition | Auto-config class |
|------|------|-----------|
| Web request metrics (business status code distribution) | Servlet application + percentiles configured | `ActuatorWebMetricsAutoConfiguration` |
| HttpClient5 request metrics | HttpClient on classpath + percentiles configured | `ActuatorWebMetricsAutoConfiguration` |
| DataSource connection pool metrics | HikariDataSource + MeterRegistry | `ActuatorDataSourcePoolMetricsAutoConfiguration` |
| Redis command latency metrics | Lettuce RedisClient + MeterRegistry | `ActuatorRedisMetricsAutoConfiguration` |

---

## 1. Web Request Metrics

### Activation condition

Configure percentiles in `application.yml`:

```yaml
management:
  metrics:
    distribution:
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
```

### Auto-collected metrics

- Standard HTTP metrics (method, status, uri)
- **Business status code distribution** (automatically extracts `code` tag from `ResponseData.getCode()`)
- Exception type tags (`BusinessException` and its wrapped exceptions)

### How it works

The framework uses `ResponseBodyAdviceAndWebMvcTagsContributor` (implementing both `ResponseBodyAdvice` and `DefaultServerRequestObservationConvention`) to automatically intercept response bodies:

1. Before the response is written, extracts the business code from `BaseResponseData.getCode()`
2. Injects the business code as a low cardinality tag `code` into the Observation
3. Extracts exception type tags for `BusinessException`

> No manual instrumentation needed — as long as the Controller returns `ResponseData<T>`, metrics are collected automatically.

---

## 2. HttpClient5 Request Metrics

### Activation condition

```yaml
management:
  metrics:
    distribution:
      percentiles:
        http.client.requests: 0.5, 0.95, 0.99
```

### Auto-collected Tags

**Low Cardinality Tags (for aggregation):**

| Tag | Description | Example |
|-----|------|------|
| `svrname` | scheme://host:port | `https://api.example.com:443` |
| `method` | HTTP method | `GET`, `POST` |
| `uri` | Request URI | `/api/users` |
| `status` | HTTP response status code | `200`, `500`, `UNKNOWN` |
| `exception` | Exception class name | `none`, `IOException` |

### Controlling URI Cardinality — HttpClientMetric

When request paths contain path variables (e.g., `/users/{id}`), each different id generates a new metric tag, leading to OOM. Use `HttpClientMetric` to customize the metric URI:

```java
import io.github.lujiafa.houtu.actuator.metrics.client.HttpClientMetric;

// Call before making the HTTP request
HttpClientMetric.metric("/api/users/{id}");  // Custom metric URI
HttpClients.get("https://api.example.com/users/12345");

// Or use the default URI (when no path variables)
HttpClientMetric.metric();
HttpClients.get("https://api.example.com/users");
```

**Note**: `HttpClientMetric.metric()` is ThreadLocal-based and must be called before the HTTP request. If not called, metrics for that request are not collected.

---

## 3. DataSource Connection Pool Metrics

### Activation condition

Automatically enabled when `HikariDataSource` + `MeterRegistry` are on the classpath; no additional configuration needed.

### Auto-collected metrics

Automatically collects HikariCP connection pool metrics via `MicrometerMetricsTrackerFactory`:

- `hikaricp.connections` — Total connections
- `hikaricp.connections.active` — Active connections
- `hikaricp.connections.idle` — Idle connections
- `hikaricp.connections.pending` — Threads waiting for a connection
- `hikaricp.connections.creation` — Connection creation time
- `hikaricp.connections.acquire` — Connection acquisition time
- `hikaricp.connections.usage` — Connection usage time
- `hikaricp.connections.timeout` — Connection timeout count

### Multi-datasource support

The framework automatically detects `Map<String, HikariDataSource>` type Beans (e.g., dynamic datasources), sets an independent pool name for each datasource, and registers independent metrics.

---

## 4. Redis Command Latency Metrics

### Activation condition

Lettuce `RedisClient` + `MicrometerCommandLatencyRecorder` + `MeterRegistry` on the classpath.

### Configuration

```yaml
management:
  metrics:
    enable:
      redis.lettuce: true                              # Enable Redis metrics
    distribution:
      percentiles-histogram:
        redis.lettuce: true                            # Enable histogram
      percentiles:
        redis.lettuce: 0.5, 0.95, 0.99                # Percentile config
```

### Auto-collected metrics

Collects Redis command latency via Lettuce's `MicrometerCommandLatencyRecorder`:

- `lettuce.command.completion` — Command completion latency
- `lettuce.command.firstresponse` — First response latency

---

## 5. Prometheus Endpoint

houtu-actuator transitively depends on `micrometer-registry-prometheus`, exposing the `/actuator/prometheus` endpoint by default.

Ensure the following is configured:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, prometheus
```

---

## Custom extensions

### Custom HttpClient5 Observation Convention

Register a custom `HttpClient5ObservationConvention` Bean to override the default implementation:

```java
@Bean
public HttpClient5ObservationConvention customConvention() {
    return new HttpClient5ObservationConvention("custom.http.client") {
        @Override
        public KeyValues getLowCardinalityKeyValues(HttpClient5RequestReplySenderContext context) {
            // Custom tag logic
            return super.getLowCardinalityKeyValues(context);
        }
    };
}
```

### Custom Web Business Code Collection

By default, business codes are extracted from `BaseResponseData.getCode()`. To override, register a custom `ResponseBodyAdviceAndWebMvcTagsContributor` Bean.

---

## Avoid by default (follow user if explicitly requested)

1. **Avoid by default** creating custom MeterBinder to collect HTTP endpoint metrics — the framework already collects them automatically
2. **Avoid by default** registering custom Micrometer Filter to collect HttpClient metrics — use the framework's Observation mechanism
3. **Avoid by default** manually configuring HikariCP's MetricsTrackerFactory — the framework registers it automatically
4. **Avoid by default** importing `micrometer-registry-prometheus` separately — houtu-actuator already includes it as a transitive dependency
5. **Avoid by default** omitting `HttpClientMetric.metric()` calls — not calling it for requests with path variables will cause metric cardinality explosion
