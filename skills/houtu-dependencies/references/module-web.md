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

## ResponseData vs EmbedResponseData — 如何选择

| 维度 | `ResponseData<T>` | `EmbedResponseData` |
|------|-------------------|---------------------|
| **JSON 结构** | `{code, message, data: {...}}` — data 嵌套在 data 字段中 | `{code, message, key1: v1, key2: v2}` — 业务字段与 code/message 平铺 |
| **类型安全** | 泛型 `<T>`，编译期检查 data 类型 | `Map<String, Object>`，无编译期检查 |
| **适用场景** | **绝大多数接口** — 返回强类型对象、列表、分页等 | **少数特殊接口** — 状态检查、简单 KV 结果、无需前端定义类型的场景 |
| **前端配合** | 前端统一从 `response.data.data` 取业务数据 | 前端直接从 `response.data` 取所有字段（无 data 包装层） |
| **序列化** | Jackson 自动序列化泛型对象 | 继承 `LinkedHashMap`，字段顺序可控 |

**决策规则**：
1. **默认使用 `ResponseData<T>`** — 除非有明确理由
2. 当需要返回**动态 KV 结构**（字段名和数量不固定）时使用 `EmbedResponseData`
3. 当接口是**对外开放 API**且对方要求**不嵌套 data 层**时使用 `EmbedResponseData`
4. 当返回的业务对象**已有明确 VO 类**时，始终用 `ResponseData<T>`

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
import io.github.lujiafa.houtu.web.validation.constroins.NotXss;  // 注意包名 constroins（框架原始拼写）

public class CommentForm extends BaseForm {
    @NotXss private String content;   // Rejects content with XSS patterns, also implies @NotNull
    // getters/setters
}
```

> `@NotXss` 包含 `@NotNull` 语义，无需额外添加 `@NotNull`。默认 message: `"内容包含不安全信息"`。

---

## BusinessException 构造方式

```java
import io.github.lujiafa.houtu.core.exception.BusinessException;
import io.github.lujiafa.houtu.core.exception.ErrorCode;

// 方式 1: ErrorCode（推荐，支持 i18n）
throw new BusinessException(ErrorCode.build(41, "订单不存在"));
throw new BusinessException(ErrorCode.build(30, new Object[]{"name"}));  // i18n with args
throw new BusinessException(ErrorCode.build(41));                         // message 从 MessageSource 读取

// 方式 2: code + message
throw new BusinessException(1001, "自定义错误");

// 方式 3: 带原始异常
throw new BusinessException(ErrorCode.build(2), cause);
throw new BusinessException(1001, "自定义错误", cause);

// 方式 4: 仅包装异常（code 默认为 SERVER_BUSY=2）
throw new BusinessException(cause);
```

**ErrorCode.build() 完整重载：**
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

## Model 基类详细 API

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

// 构建方式 1: 从 PageDataDTO 转换
PageDataVO<UserVO> pageVO = PageDataVO.build(pageDataDTO, UserVO.class);

// 构建方式 2: 手动构建
PageDataVO<UserVO> pageVO = PageDataVO.build(currentPage, pageSize, totalRecords, records);

// 构建方式 3: 空分页
PageDataVO<UserVO> empty = PageDataVO.empty();

// Fields: pageSize, currentPage, totalPages, totalRecords, records (List<V>)
```

### HandlerExceptionResolverCustomizer 接口

```java
public interface HandlerExceptionResolverCustomizer {
    // 返回 BusinessException 则框架使用其 ErrorCode 作为响应
    // 返回 null 则跳过，由下一个 Customizer 或默认处理器处理
    BusinessException process(HttpServletRequest request, HttpServletResponse response,
                              Object handler, Exception ex);
}
```
