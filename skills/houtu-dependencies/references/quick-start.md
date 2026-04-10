# 快速接入 Houtu Framework

## 创建新微服务的标准步骤

### 1. BOM 引入

框架分为两个 BOM：`houtu-dependencies`（基础模块）和 `spring-cloud-houtu`（Spring Cloud 增强模块）。

```xml
<dependencyManagement>
    <dependencies>
        <!-- 基础模块 BOM（必须） -->
        <dependency>
            <groupId>io.github.lujiafa</groupId>
            <artifactId>houtu-dependencies</artifactId>
            <version>${houtu.version}</version> <!-- 根据版本文件调整，如 3.5.1 -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <!-- Spring Cloud 增强模块 BOM（使用 spring-cloud-houtu-* 模块时必须） -->
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

> 如果项目不使用 Spring Cloud 模块（loadbalancer、feign、discovery、sentinel），可以只引入 `houtu-dependencies`。

### 2. 按需引入 Starter（无需写 version）

| ArtifactId | 功能 | 传递依赖 |
|-----------|------|---------|
| `houtu-web` | 统一响应、异常处理、参数自动绑定 | spring-boot-starter-web, validation, houtu-core, houtu-utils |
| `houtu-web-security` | 会话、鉴权、签名、防重放、RBAC | houtu-web, houtu-cache (→ Redis) |
| `houtu-cache` | 分布式锁、限流、缓存增强 | spring-data-redis, commons-pool2 |
| `houtu-data-security` | 数据库字段自动加解密 | houtu-core, houtu-utils (需额外加 spring-boot-starter-aop) |
| `houtu-access-log` | 请求访问日志 | spring-boot-starter-aop, houtu-utils |
| `houtu-web-swagger` | Swagger/OpenAPI 文档 | springdoc-openapi |
| `houtu-actuator` | 监控指标 (Prometheus/SkyWalking) | spring-boot-starter-actuator, micrometer |
| `spring-cloud-houtu-loadbalancer` | 灰度路由、权重负载均衡 | spring-cloud-starter-loadbalancer |
| `spring-cloud-houtu-feign` | Feign 自动发布、异常穿透 | spring-cloud-starter-openfeign |
| `spring-cloud-houtu-discovery` | 服务在线状态检测 | houtu-core |
| `spring-cloud-houtu-alibaba-sentinel` | 熔断限流 (Nacos 持久化) | sentinel, sentinel-datasource-nacos |

### 3. 最小化 application.yml

```yaml
server:
  port: 8080

spring:
  application:
    name: your-service-name
  data:                             # ⚠️ v2.7.x: spring.redis.* (无 data 层级)
    redis:                          # houtu-web-security / houtu-cache 需要
      host: localhost
      port: 6379

houtu:
  web:
    sign:
      sign-key: "your-sign-key"    # houtu-web-security 必需
  data:
    security:
      secret-key: "your-sm4-key"   # houtu-data-security 必需
```

### 4. 标准 Controller 写法

```java
import io.github.lujiafa.houtu.web.model.ResponseData;
import io.github.lujiafa.houtu.web.model.BaseForm;
import io.github.lujiafa.houtu.core.exception.BusinessException;
import io.github.lujiafa.houtu.core.exception.ErrorCode;
import io.github.lujiafa.houtu.websecurity.annotation.CheckSession;
import io.github.lujiafa.houtu.websecurity.annotation.RequiresPermission;

@CheckSession                                   // 整个 Controller 需要登录
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
        return ResponseData.success(order);      // 无需 @ResponseBody
    }

    @RequiresPermission("order:create")
    @PostMapping
    public ResponseData<Long> create(@Valid OrderForm form) {  // 无需 @RequestBody, 自动绑定
        Long id = orderService.create(form);
        return ResponseData.success(id);
    }
}

// Form 继承 BaseForm 即可自动绑定 query + body 参数
public class OrderForm extends BaseForm {
    @NotBlank private String productName;
    @NotNull private Integer quantity;
    // getters/setters
}
```

### ❌ 禁止

- 不要自定义 Result/Response 包装类 — 用 `ResponseData<T>`
- 不要写 @ControllerAdvice — 框架已有 `UnifiedHandlerExceptionResolver`
- 不要给 `BaseForm` 参数加 @RequestBody — 框架自动处理
- 不要引入 spring-boot-starter-security — 用 houtu-web-security
- 不要自己引入 springdoc — 用 houtu-web-swagger
