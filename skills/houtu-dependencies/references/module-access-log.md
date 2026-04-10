# houtu-access-log — Complete Guide

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-access-log</artifactId>
</dependency>
```

Transitively includes: `spring-boot-starter-aop`, `houtu-utils`. Optionally depends on `houtu-web`.

## No Required Configuration

Works out-of-the-box after adding the dependency.

**Important:** Logs to logger named `accessLog` at INFO level. Configure in `logback-spring.xml`:

```xml
<logger name="accessLog" level="INFO" additivity="false">
    <appender-ref ref="ACCESS_LOG_FILE" />
</logger>
```

---

## Basic Usage

```java
import io.github.lujiafa.houtu.accesslog.annotation.AccessLog;

// Method-level
@AccessLog
@PostMapping("/api/order")
public ResponseData<Order> createOrder(OrderForm form) { ... }

// Class-level: all methods logged
@AccessLog
@RestController
@RequestMapping("/api")
public class OrderController { ... }

// With request body and custom headers
@AccessLog(requestBody = true, requestHeaders = {"User-Agent", "X-Request-Id", "Authorization"})
@PostMapping("/api/payment")
public ResponseData<Void> pay(PayForm form) { ... }
```

**Log format:** `httpMethod|path|requestIp|headers|queryString|[body]|methodName|args|response|exception|elapsed(ms)`

**Example output:**
```
POST|/api/order|192.168.1.1|Mozilla/5.0...|userId=123|{"productId":1,"qty":2}|createOrder|{"productId":1,"qty":2}|{"code":0,"message":"SUCCESS"}|null|56
```

## @AccessLog Attributes

```java
boolean value() default true;                                          // Enable logging
String[] requestHeaders() default {HttpHeaders.USER_AGENT};           // Headers to log
boolean requestBody() default false;                                   // Log request body
Class<? extends LogFilterHandler> logFilterHandler() default SimpleLogFilterHandler.class;
```

---

## Custom Log Filter — Mask Sensitive Data

```java
import io.github.lujiafa.houtu.accesslog.handler.LogFilterHandler;

@Component
public class SensitiveLogFilter implements LogFilterHandler {

    @Override
    public Object filterMethodArg(int index, Object arg) {
        if (arg instanceof UserForm form) {
            UserForm masked = new UserForm();
            BeanUtils.copyProperties(form, masked);
            masked.setPhone(mask(form.getPhone()));     // 138****1234
            masked.setIdCard(mask(form.getIdCard()));
            return masked;
        }
        return arg;
    }

    @Override
    public Object filterResult(Object result) {
        // Mask sensitive fields in response before logging
        return result;
    }

    @Override
    public String filterQueryParamString(String queryParamString) {
        // Mask sensitive query params
        return queryParamString;
    }

    @Override
    public Map filterBody(Map params) {
        // Mask sensitive body fields
        return params;
    }

    private String mask(String value) {
        if (value == null || value.length() < 4) return "****";
        return value.substring(0, 3) + "****" + value.substring(value.length() - 4);
    }
}

// Apply:
@AccessLog(logFilterHandler = SensitiveLogFilter.class)
@PostMapping("/api/user")
public ResponseData<User> create(UserForm form) { ... }
```

**LogFilterHandler interface (all default no-op methods):**
```java
default String filterQueryParamString(String queryParamString)
default Map filterBody(Map params)
default Object filterMethodArg(int index, Object arg)
default Object filterResult(Object resultObject)
```

---

## Internal Behavior

- **Logger name:** `accessLog` (not class name)
- **Level:** INFO
- **Serialization:** Uses `JsonUtils.toString()` for complex objects. `ServletRequest`, `ServletResponse`, `MultipartFile` are not serialized.
- **Body capture:** Uses `@CachingParam` mechanism to wrap request in `CachingStreamHttpServletRequest` for body re-reading.

## Common Mistakes

- **No log output?** Check that `accessLog` logger is configured in logback at INFO level
- **Filter does NOT modify actual data** — only affects log output, original request/response untouched
