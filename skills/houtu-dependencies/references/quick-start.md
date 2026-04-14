# Quick Start with Houtu Framework

## Standard steps for creating a new microservice

### 1. Import BOM

The framework is divided into two BOMs: `houtu-dependencies` (base modules) and `spring-cloud-houtu` (Spring Cloud enhancement modules).

```xml
<dependencyManagement>
    <dependencies>
        <!-- Base module BOM (required) -->
        <dependency>
            <groupId>io.github.lujiafa</groupId>
            <artifactId>houtu-dependencies</artifactId>
            <version>${houtu.version}</version> <!-- Adjust according to version file, e.g. 3.5.2 -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <!-- Spring Cloud enhancement module BOM (required when using spring-cloud-houtu-* modules) -->
        <dependency>
            <groupId>io.github.lujiafa</groupId>
            <artifactId>spring-cloud-houtu</artifactId>
            <version>${houtu.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

> If your project does not use Spring Cloud modules (loadbalancer, feign, discovery, sentinel), you can import only `houtu-dependencies`.

**Gradle (build.gradle.kts):**

```kotlin
dependencies {
    // Base module BOM (required)
    implementation platform("io.github.lujiafa:houtu-dependencies:${houtuVersion}") // Adjust according to version file, e.g. 3.5.2
    // Spring Cloud enhancement module BOM (required when using spring-cloud-houtu-* modules)
    implementation platform("io.github.lujiafa:spring-cloud-houtu:${houtuVersion}")
}
```

**Gradle (build.gradle):**

```groovy
dependencies {
    implementation platform('io.github.lujiafa:houtu-dependencies:${houtuVersion}')
    implementation platform('io.github.lujiafa:spring-cloud-houtu:${houtuVersion}')
}
```

> In Gradle projects, Starters also do not need a version specified — managed by the BOM platform.

### 2. Import Starters as needed (no version required)

| ArtifactId | Feature | Transitive dependencies |
|-----------|------|---------|
| `houtu-web` | Unified response, exception handling, automatic parameter binding | spring-boot-starter-web, validation, houtu-core, houtu-utils |
| `houtu-web-security` | Session, authentication, signature, replay prevention, RBAC | houtu-web, houtu-cache (-> Redis) |
| `houtu-cache` | Distributed lock, rate limiting, cache enhancement | spring-data-redis, commons-pool2 |
| `houtu-data-security` | Automatic database field encryption/decryption | houtu-core, houtu-utils (requires additional spring-boot-starter-aop) |
| `houtu-access-log` | Request access logging | spring-boot-starter-aop, houtu-utils |
| `houtu-web-swagger` | Swagger/OpenAPI documentation | springdoc-openapi |
| `houtu-actuator` | Monitoring / Metrics (Prometheus/SkyWalking) | spring-boot-starter-actuator, micrometer |
| `spring-cloud-houtu-loadbalancer` | Canary routing, weighted load balancing | spring-cloud-starter-loadbalancer |
| `spring-cloud-houtu-feign` | Feign auto-publish, exception propagation | spring-cloud-starter-openfeign |
| `spring-cloud-houtu-discovery` | Service online status detection | houtu-core |
| `spring-cloud-houtu-alibaba-sentinel` | Circuit breaking & rate limiting (Nacos persistence) | sentinel, sentinel-datasource-nacos |

### 3. Minimal application.yml

```yaml
server:
  port: 8080

spring:
  application:
    name: your-service-name
  data:                             # ⚠️ v2.7.x: spring.redis.* (no data level)
    redis:                          # Required by houtu-web-security / houtu-cache
      host: localhost
      port: 6379

houtu:
  web:
    sign:
      sign-key: "your-sign-key"    # Required by houtu-web-security
  data:
    security:
      secret-key: "your-sm4-key"   # Required by houtu-data-security
```

### 4. Standard Controller pattern

```java
import io.github.lujiafa.houtu.web.model.ResponseData;
import io.github.lujiafa.houtu.web.model.BaseForm;
import io.github.lujiafa.houtu.core.exception.BusinessException;
import io.github.lujiafa.houtu.core.exception.ErrorCode;
import io.github.lujiafa.houtu.websecurity.annotation.CheckSession;
import io.github.lujiafa.houtu.websecurity.annotation.RequiresPermission;

@CheckSession                                   // Entire Controller requires login
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @RequiresPermission("order:read")
    @GetMapping("/{id}")
    public ResponseData<OrderVO> getOrder(@PathVariable Long id) {
        OrderVO order = orderService.getById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.build(41, "订单不存在"));
        }
        return ResponseData.success(order);      // No need for @ResponseBody
    }

    @RequiresPermission("order:create")
    @PostMapping
    public ResponseData<Long> create(@Valid OrderForm form) {  // No need for @RequestBody, auto-binding
        Long id = orderService.create(form);
        return ResponseData.success(id);
    }
}

// Form extends BaseForm to automatically bind query + body parameters
public class OrderForm extends BaseForm {
    @NotBlank private String productName;
    @NotNull private Integer quantity;
    // getters/setters
}
```

### Avoid by default (follow user if explicitly requested)

- Do not customize Result/Response wrapper classes by default — use `ResponseData<T>`
- Do not write @ControllerAdvice by default — the framework already provides `UnifiedHandlerExceptionResolver`
- Do not add @RequestBody to `BaseForm` parameters by default — the framework handles this automatically
- Do not import spring-boot-starter-security by default — use houtu-web-security
- Do not import springdoc manually by default — use houtu-web-swagger
