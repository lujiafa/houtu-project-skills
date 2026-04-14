# houtu-web — Complete Guide

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-web</artifactId>
</dependency>
```

Transitively includes: `spring-boot-starter-web`, `spring-boot-starter-validation`, `jackson-dataformat-xml`, `houtu-core`, `houtu-utils`. **No need to add spring-boot-starter-web separately.**

## Auto-Configured (zero-config)

- `UnifiedHandlerExceptionResolver` — catches all exceptions, returns `{code, message}`
- `CombineHandlerMethodArgumentResolver` — auto-binds params to `BaseForm`/`BaseDTO`/`HashMap`
- `ExtensionHandlerMethodReturnValueHandler` — `ResponseData`/`EmbedResponseData` without `@ResponseBody`

## Configuration

```yaml
houtu:
  web:
    exception-resolver: true          # default, set false to disable
    combine-form-resolver-type: JSON  # JSON (default) or NATIVE
```

---

## ResponseData\<T\> — Unified Response

```java
import io.github.lujiafa.houtu.web.model.ResponseData;

// In Controller — NO @ResponseBody needed
@PostMapping("/user")
public ResponseData<User> create(UserForm form) {
    User user = userService.create(form);
    return ResponseData.success(user);       // {code:0, message:"SUCCESS", data:{...}}
}

@GetMapping("/user/{id}")
public ResponseData<User> get(@PathVariable Long id) {
    User user = userService.getById(id);
    if (user == null) {
        return ResponseData.fail(ErrorCode.build(41, "用户不存在"));
    }
    return ResponseData.success(user);
}
```

**Methods:**
```java
static <T> ResponseData<T> success()
static <T> ResponseData<T> success(T data)
static <T> ResponseData<T> fail(ErrorCode errorCode)
static <T> ResponseData<T> fail(int code, String message)
boolean hasSuccess()    // code == 0
int getCode()
String getMessage()
T getData()
```

## EmbedResponseData — Flat Map Response

```java
import io.github.lujiafa.houtu.web.model.EmbedResponseData;

@GetMapping("/status")
public EmbedResponseData status() {
    return EmbedResponseData.success(Map.of(
        "online", true,
        "version", "1.0"
    ));  // {code:0, message:"SUCCESS", online:true, version:"1.0"}
}
```

## ResponseData vs EmbedResponseData — How to Choose

| Dimension | `ResponseData<T>` | `EmbedResponseData` |
|-----------|--------------------|---------------------|
| **JSON structure** | `{code, message, data: {...}}` — data nested in data field | `{code, message, key1: v1, key2: v2}` — business fields flattened alongside code/message |
| **Type safety** | Generic `<T>`, compile-time type checking for data | `Map<String, Object>`, no compile-time checking |
| **Use cases** | **Most APIs** — returning strongly-typed objects, lists, pagination, etc. | **Few special APIs** — status checks, simple KV results, scenarios where frontend doesn't need to define types |
| **Frontend integration** | Frontend uniformly reads business data from `response.data.data` | Frontend reads all fields directly from `response.data` (no data wrapper layer) |
| **Serialization** | Jackson auto-serializes generic objects | Extends `LinkedHashMap`, field order controllable |

**Decision rules**:
1. **Use `ResponseData<T>` by default** — unless there is a specific reason not to
2. Use `EmbedResponseData` when returning **dynamic KV structures** (field names and count are not fixed)
3. Use `EmbedResponseData` when the API is **externally exposed** and the consumer requires **no nested data layer**
4. When the business object **already has a defined VO class**, always use `ResponseData<T>`

## Exception Handling

**Throw BusinessException anywhere** — the framework auto-catches and returns JSON `{code, message}`:

```java
import io.github.lujiafa.houtu.core.exception.BusinessException;
import io.github.lujiafa.houtu.core.exception.ErrorCode;

// In service layer:
throw new BusinessException(ErrorCode.build(41, "订单不存在"));
throw new BusinessException(1001, "自定义错误");
throw new BusinessException(ErrorCode.build(30, new Object[]{"name"}));  // i18n with args
```

**ErrorCode.build() supports i18n** via `MessageSource` + `LocaleContextHolder`. Define messages in `messages.properties`:
```properties
30=参数 {0} 错误
41=数据不存在
```

**Custom exception handling** — implement `HandlerExceptionResolverCustomizer`:

```java
import io.github.lujiafa.houtu.web.handler.HandlerExceptionResolverCustomizer;

@Component
public class MyExceptionHandler implements HandlerExceptionResolverCustomizer {
    @Override
    public BusinessException process(HttpServletRequest request, HttpServletResponse response,
                                     Object handler, Exception ex) {
        if (ex instanceof MyDomainException e) {
            return new BusinessException(e.getCode(), e.getMessage());
        }
        return null;  // null = skip, let next handler try
    }
}
```

## Parameter Auto-Binding

Extend `BaseForm` / `BaseDTO` — parameters auto-bind from **any HTTP method** (GET, POST, PUT...):

```java
import io.github.lujiafa.houtu.web.model.BaseForm;
import io.github.lujiafa.houtu.web.model.form.PageForm;

public class UserForm extends BaseForm {
    private String name;
    private String email;
    // getters/setters
}

public class UserQueryForm extends PageForm {  // has currentPage(default 1), pageSize(default 10)
    private String keyword;
    // getters/setters
}

@GetMapping("/users")
public ResponseData<List<User>> list(UserQueryForm form) {
    // form.getCurrentPage(), form.getPageSize(), form.getKeyword() all auto-bound
}
```

**Binding mechanism (JSON mode, default):**
1. Query string params → JSON convert to target type
2. Request body (if not GET, not form-encoded) → merge via BeanUtils.copyProperties
3. Validation applied automatically

## Common Mistakes

- Do NOT add `@RequestBody` to `BaseForm`/`BaseDTO` parameters — the framework handles both query and body automatically
- Do NOT add `@ResponseBody` to methods returning `ResponseData`/`EmbedResponseData`
- `HashMap` parameters also auto-bind (query + body merged)
- `BindException` (validation errors) auto-converts to `{code:30, message:"..."}`

---

## @NotXss — XSS Validation

```java
import io.github.lujiafa.houtu.web.validation.constroins.NotXss;  // Note package name constroins (original framework spelling)

public class CommentForm extends BaseForm {
    @NotXss private String content;   // Rejects content with XSS patterns, also implies @NotNull
    // getters/setters
}
```

> `@NotXss` includes `@NotNull` semantics, no need to add `@NotNull` separately. Default message: `"内容包含不安全信息"`.

---

## BusinessException Construction Methods

```java
import io.github.lujiafa.houtu.core.exception.BusinessException;
import io.github.lujiafa.houtu.core.exception.ErrorCode;

// Approach 1: ErrorCode (recommended, supports i18n)
throw new BusinessException(ErrorCode.build(41, "订单不存在"));
throw new BusinessException(ErrorCode.build(30, new Object[]{"name"}));  // i18n with args
throw new BusinessException(ErrorCode.build(41));                         // message read from MessageSource

// Approach 2: code + message
throw new BusinessException(1001, "自定义错误");

// Approach 3: With original cause
throw new BusinessException(ErrorCode.build(2), cause);
throw new BusinessException(1001, "自定义错误", cause);

// Approach 4: Wrap exception only (code defaults to SERVER_BUSY=2)
throw new BusinessException(cause);
```

**ErrorCode.build() full overloads:**
```java
static ErrorCode build(int code)
static ErrorCode build(int code, String defaultMessage)
static ErrorCode build(int code, Locale locale)
static ErrorCode build(int code, Object[] args)
static ErrorCode build(int code, Object[] args, String defaultMessage)
static ErrorCode build(int code, Locale locale, Object[] args)
static ErrorCode build(int code, Locale locale, String defaultMessage)
static ErrorCode build(int code, Locale locale, Object[] args, String defaultMessage)
```

---

## Model Base Class Detailed API

### PageForm (extends BaseForm)

```java
import io.github.lujiafa.houtu.web.model.form.PageForm;

public class UserQueryForm extends PageForm {
    private String keyword;
    // getters/setters
}
// PageForm fields:
// Long getCurrentPage()  — default 1, minimum 1
// Long getPageSize()     — default 10
```

### PageQueryDTO (extends BaseDTO)

```java
import io.github.lujiafa.houtu.web.model.dto.PageQueryDTO;
// Same fields as PageForm: currentPage (default 1), pageSize (default 10)
```

### PageDataVO\<V\> (extends BaseDTO)

```java
import io.github.lujiafa.houtu.web.model.vo.PageDataVO;

// Construction method 1: Convert from PageDataDTO
PageDataVO<UserVO> pageVO = PageDataVO.build(pageDataDTO, UserVO.class);

// Construction method 2: Build manually
PageDataVO<UserVO> pageVO = PageDataVO.build(currentPage, pageSize, totalRecords, records);

// Construction method 3: Empty page
PageDataVO<UserVO> empty = PageDataVO.empty();

// Fields: pageSize, currentPage, totalPages, totalRecords, records (List<V>)
```

### PageDataExtVO\<D, V\> (extends PageDataVO\<V\>)

```java
import io.github.lujiafa.houtu.web.model.vo.PageDataExtVO;

// Paginated list + extra data (e.g., summary statistics)
PageDataExtVO<OrderSummary, OrderVO> extVO = new PageDataExtVO<>();
extVO.setRecords(orderVOList);
extVO.setTotalRecords(total);
extVO.setCurrentPage(currentPage);
extVO.setPageSize(pageSize);
extVO.setData(new OrderSummary(totalAmount, totalCount));  // Extra data field
// JSON: {records:[...], totalRecords:100, ..., data:{totalAmount:9999, totalCount:50}}
```

### HandlerExceptionResolverCustomizer Interface

```java
public interface HandlerExceptionResolverCustomizer {
    // Return BusinessException and the framework uses its ErrorCode as the response
    // Return null to skip, letting the next Customizer or default handler process it
    BusinessException process(HttpServletRequest request, HttpServletResponse response,
                              Object handler, Exception ex);
}
```
