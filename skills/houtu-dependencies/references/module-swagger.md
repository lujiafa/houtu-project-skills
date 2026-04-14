# houtu-web-swagger — Complete Guide

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-web-swagger</artifactId>
</dependency>
```

Transitively includes SpringDoc OpenAPI (specific artifact and version vary by framework version; see version reference file for details).

## Auto Capabilities

Works out-of-the-box after importing the dependency:
- Registers Swagger UI (default `/swagger-ui.html`)
- Scans Controllers to generate OpenAPI documentation
- **Only active when `dev` or `test` profile is active** (`@Profile({"dev", "test"})`)
- Registers a default `OpenAPI` bean (title: "API Docs", version: "1.0.0")

## No Additional Configuration Needed

The framework automatically registers the `OpenAPI` bean via `SwaggerConfiguration` (annotated with `@ConditionalOnMissingBean`).

## Custom OpenAPI Information

To customize the title, description, version, etc., register your own `OpenAPI` bean to override the framework default:

```java
@Configuration
@Profile({"dev", "test"})
public class MyApiDocConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Order Service API")
                .description("Order management related endpoints")
                .version("2.0.0"));
    }
}
```

> The framework uses `@ConditionalOnMissingBean`, so your Bean will automatically override the default configuration.

## Using SpringDoc Annotations on Controllers

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "订单管理")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Operation(summary = "查询订单详情")
    @GetMapping("/{id}")
    public ResponseData<OrderVO> getOrder(
        @Parameter(description = "Order ID") @PathVariable Long id) {
        // ...
    }
}
```

## Excluding Swagger (Production Environment)

Ensure the production environment does not use the `dev` or `test` profile:

```yaml
spring:
  profiles:
    active: prod    # SwaggerConfiguration will not activate
```

## Avoid by default (follow user if explicitly requested)

```xml
<!-- ⚠️ Do not import springdoc manually by default -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>  <!-- Avoid by default, framework already includes it -->
</dependency>
```

- Do not import `springdoc-openapi-*` dependencies manually by default — version is managed by the framework BOM
- Do not write `@EnableSwagger2` or `@EnableOpenApi` — the framework already provides auto-configuration
