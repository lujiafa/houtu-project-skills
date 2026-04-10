# houtu-web-swagger — Complete Guide

## Maven 依赖

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-web-swagger</artifactId>
</dependency>
```

Transitively includes SpringDoc OpenAPI:
- **v3.5.x**: `springdoc-openapi-starter-webmvc-ui` 2.8.9
- **v2.7.x**: `springdoc-openapi-ui` 1.8.0

## 自动能力

引入依赖后自动：
- 注册 Swagger UI（默认 `/swagger-ui.html`）
- 扫描 Controller 生成 OpenAPI 文档
- **仅在 `dev` 或 `test` profile 激活**（`@Profile({"dev", "test"})`）
- 默认注册 `OpenAPI` bean（title: "API Docs", version: "1.0.0"）

## 无需额外配置

框架通过 `SwaggerConfiguration`（标注 `@ConditionalOnMissingBean`）自动注册 `OpenAPI` bean。

## 自定义 OpenAPI 信息

如需自定义标题、描述、版本等，注册自己的 `OpenAPI` bean 即可覆盖框架默认：

```java
@Configuration
@Profile({"dev", "test"})
public class MyApiDocConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("订单服务 API")
                .description("订单管理相关接口")
                .version("2.0.0"));
    }
}
```

> 框架使用 `@ConditionalOnMissingBean`，你的 Bean 会自动覆盖默认配置。

## 在 Controller 上使用 SpringDoc 注解

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
        @Parameter(description = "订单 ID") @PathVariable Long id) {
        // ...
    }
}
```

## 排除 Swagger（生产环境）

确保生产环境不使用 `dev` 或 `test` profile：

```yaml
spring:
  profiles:
    active: prod    # SwaggerConfiguration 不会激活
```

## ❌ 禁止

```xml
<!-- ❌ 不要自己引入 springdoc -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>  <!-- 禁止，框架已包含 -->
</dependency>
```

- 不要自己引入 `springdoc-openapi-*` 依赖 — 版本由框架 BOM 管理
- 不要写 `@EnableSwagger2` 或 `@EnableOpenApi` — 框架已自动配置
