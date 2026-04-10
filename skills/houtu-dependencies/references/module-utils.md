# houtu-utils — 加密 / JSON / HTTP 客户端 / 通用工具

## Maven 依赖

```xml
<!-- 通常无需单独引入，houtu-web 已传递依赖 houtu-utils -->
<!-- 如果仅需工具类而不需要 Web 能力，可直接引入 -->
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-utils</artifactId>
</dependency>
```

传递依赖：Apache HttpClient 5、BouncyCastle 1.82、Commons Lang3、Jackson

## 自动配置

引入即生效，自动注册：
- `CloseableHttpClient` — Apache HttpClient 5 实例（连接池、SSL、代理已配置）
- `HttpClients` — 静态 HTTP 请求工具（基于上述 HttpClient）
- `JsonUtils` — JSON 序列化/反序列化（基于 Jackson ObjectMapper）

---

## 1. JSON 工具 — JsonUtils

**包路径**：`io.github.lujiafa.houtu.util.common.JsonUtils`

### API

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `JsonUtils.toString(Object bean)` | `String` | 对象 → JSON 字符串 |
| `JsonUtils.toStringIgnoreNull(Object bean)` | `String` | 对象 → JSON 字符串（忽略 null 字段） |
| `JsonUtils.parseObject(String json, Class<T> clazz)` | `T` | JSON 字符串 → 对象 |
| `JsonUtils.parseObject(String json, TypeReference<T> typeRef)` | `T` | JSON 字符串 → 泛型对象 |
| `JsonUtils.convertValue(Object from, Class<T> toType)` | `T` | 对象类型转换 |
| `JsonUtils.convertValueIgnoreNull(Object from, Class<T> toType)` | `T` | 对象类型转换（忽略 null） |
| `JsonUtils.convertValue(Object from, TypeReference<T> typeRef)` | `T` | 对象 → 泛型类型转换 |
| `JsonUtils.convertValueIgnoreNull(Object from, TypeReference<T> typeRef)` | `T` | 对象 → 泛型类型转换（忽略 null） |

### 代码示例

```java
import io.github.lujiafa.houtu.util.common.JsonUtils;

// 序列化
String json = JsonUtils.toString(userVO);
String jsonNoNull = JsonUtils.toStringIgnoreNull(userVO);

// 反序列化
UserVO user = JsonUtils.parseObject(json, UserVO.class);
List<UserVO> users = JsonUtils.parseObject(json, new TypeReference<List<UserVO>>() {});

// 对象转换（类似 BeanUtils 但通过 JSON 中转）
UserDTO dto = JsonUtils.convertValue(form, UserDTO.class);
```

---

## 2. HTTP 客户端 — HttpClients

**包路径**：`io.github.lujiafa.houtu.util.http.HttpClients`

### API

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `HttpClients.get(String url)` | `HttpResponseData` | 简单 GET 请求 |
| `HttpClients.get(String url, RequestConfig config)` | `HttpResponseData` | 带配置 GET 请求 |
| `HttpClients.post(String url, RequestConfig config)` | `HttpResponseData` | 带配置 POST 请求 |
| `HttpClients.execute(CloseableHttpClient client, HttpUriRequestBase request)` | `HttpResponseData` | 自定义请求执行 |

### RequestConfig 构建器

```java
RequestConfig config = RequestConfig.build()
    .headers(Map.of("Authorization", "Bearer xxx"))  // 设置 header
    .header("X-Custom", "value")                     // 单个 header
    .params(Map.of("key", "value"))                  // 查询参数 / 表单参数
    .param("id", 123)                                // 单个参数
    .data("{\"name\":\"test\"}")                      // JSON body
    .httpClient(customClient);                       // 可选：使用自定义 HttpClient
```

### MultipartConfig（文件上传）

```java
RequestConfig config = RequestConfig.build()
    .multipart()
        .fileInputStream("file", inputStream)
        .fileByteArray("file2", byteArray)
        .param("name", "test")
        .build();
```

### HttpResponseData

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getStatusCode()` | `int` | HTTP 状态码 |
| `getStatusText()` | `String` | HTTP 状态描述 |
| `getContent()` | `String` | 响应体字符串 |
| `getHeaderMap()` | `Map<String, String>` | 响应头 |
| `getCharset()` | `Charset` | 响应字符集 |
| `convert(Class<T> clazz)` | `T` | 响应体 → 对象 |
| `convert(TypeReference<T> typeRef)` | `T` | 响应体 → 泛型对象 |

### 代码示例

```java
import io.github.lujiafa.houtu.util.http.HttpClients;
import io.github.lujiafa.houtu.util.http.HttpClients.RequestConfig;

// 简单 GET
HttpClients.HttpResponseData resp = HttpClients.get("https://api.example.com/users");
List<UserVO> users = resp.convert(new TypeReference<List<UserVO>>() {});

// POST JSON
HttpClients.HttpResponseData resp = HttpClients.post("https://api.example.com/users",
    RequestConfig.build()
        .header("Content-Type", "application/json")
        .data(JsonUtils.toString(createDTO)));
UserVO created = resp.convert(UserVO.class);

// 文件上传
HttpClients.HttpResponseData resp = HttpClients.post("https://api.example.com/upload",
    RequestConfig.build()
        .multipart()
            .fileInputStream("file", fileInputStream)
            .param("description", "avatar")
            .build());
```

### HttpClient 配置属性

配置前缀：`houtu.http`

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `houtu.http.pool.max-total` | int | — | 连接池最大连接数 |
| `houtu.http.pool.max-per-route` | int | — | 每路由最大连接数 |
| `houtu.http.pool.disable-ssl-validation` | boolean | — | 是否禁用 SSL 验证 |
| `houtu.http.pool.pool-reuse-policy` | PoolReusePolicy | — | 连接复用策略 |
| `houtu.http.pool.pool-concurrency-policy` | PoolConcurrencyPolicy | — | 并发策略 |
| `houtu.http.request.connect-timeout` | Duration | — | 连接超时 |
| `houtu.http.request.response-timeout` | Duration | — | 响应超时 |
| `houtu.http.request.connection-keep-alive` | Duration | — | 连接保持时间 |
| `houtu.http.request.user-agent` | String | — | User-Agent |
| `houtu.http.request.redirects-enabled` | boolean | — | 是否跟随重定向 |
| `houtu.http.proxy.hostname` | String | — | 代理主机 |
| `houtu.http.proxy.port` | int | — | 代理端口 |

---

## 3. 加密工具

所有加密工具位于 `io.github.lujiafa.houtu.util.crypto` 包。

> 加密方法均返回 `CodecData`，可通过 `.bytes()`、`.base64()`、`.hex()` 获取不同格式结果。

### 3.1 对称加密

#### AESUtils

```java
import io.github.lujiafa.houtu.util.crypto.AESUtils;
import io.github.lujiafa.houtu.util.crypto.type.AESKeySize;
import io.github.lujiafa.houtu.util.crypto.type.AESTransformation;
import io.github.lujiafa.houtu.util.common.CodecData;

// 生成密钥
CodecData key = AESUtils.getKey(AESKeySize.AES_128);

// 加密
CodecData encrypted = AESUtils.encrypt(
    CodecData.utf8("plaintext"),   // 明文
    key,                          // 密钥
    AESTransformation.ECB_PKCS5   // 模式
);
String base64 = encrypted.base64();

// 带 IV 加密（CBC 模式）
CodecData encrypted = AESUtils.encrypt(
    "plaintext".getBytes(), key, AESTransformation.CBC_PKCS5, iv);

// 解密
CodecData decrypted = AESUtils.decrypt(encrypted, key, AESTransformation.ECB_PKCS5);
String plaintext = new String(decrypted.bytes());
```

#### SM4Utils（国密）

```java
import io.github.lujiafa.houtu.util.crypto.SM4Utils;
import io.github.lujiafa.houtu.util.crypto.type.SM4Transformation;

CodecData key = SM4Utils.getKey();
CodecData encrypted = SM4Utils.encrypt(CodecData.utf8("data"), key, SM4Transformation.ECB_PKCS5);
CodecData decrypted = SM4Utils.decrypt(encrypted, key, SM4Transformation.ECB_PKCS5);
// 带 IV
CodecData encrypted = SM4Utils.encrypt("data".getBytes(), key, iv, SM4Transformation.CBC_PKCS5);
```

### 3.2 非对称加密

#### RSAUtils

```java
import io.github.lujiafa.houtu.util.crypto.RSAUtils;
import io.github.lujiafa.houtu.util.crypto.type.*;

// 生成密钥对
RSAKeyPair keyPair = RSAUtils.getKeyPair(RSAKeySize.RSA_2048);
CodecData publicKey = keyPair.getEncodedPublicKey();
CodecData privateKey = keyPair.getEncodedPrivateKey();

// 公钥加密 → 私钥解密
CodecData encrypted = RSAUtils.encryptByPublicKey(CodecData.utf8("data"), publicKey, RSATransformationAlgorithm.ECB_PKCS1);
CodecData decrypted = RSAUtils.decryptByPrivateKey(encrypted, privateKey, RSATransformationAlgorithm.ECB_PKCS1);

// 私钥签名 → 公钥验签
CodecData signature = RSAUtils.sign(CodecData.utf8("data"), privateKey, RSASignAlgorithm.SHA256withRSA);
boolean valid = RSAUtils.signVerify(CodecData.utf8("data"), publicKey, signature, RSASignAlgorithm.SHA256withRSA);
```

#### SM2Utils（国密）

```java
import io.github.lujiafa.houtu.util.crypto.SM2Utils;
import io.github.lujiafa.houtu.util.crypto.type.SM2SignAlgorithm;

SM2KeyPair keyPair = SM2Utils.getKeyPair();
CodecData encrypted = SM2Utils.encrypt(CodecData.utf8("data"), keyPair.getEncodedPublicKey());
CodecData decrypted = SM2Utils.decrypt(encrypted, keyPair.getEncodedPrivateKey());

// 签名/验签
CodecData sig = SM2Utils.sign(CodecData.utf8("data"), keyPair.getEncodedPrivateKey(), SM2SignAlgorithm.SM3withSM2);
boolean valid = SM2Utils.signVerify(CodecData.utf8("data"), keyPair.getEncodedPublicKey(), sig, SM2SignAlgorithm.SM3withSM2);
```

### 3.3 哈希 / HMAC

```java
import io.github.lujiafa.houtu.util.crypto.MD5Utils;
import io.github.lujiafa.houtu.util.crypto.HMacMD5Utils;
import io.github.lujiafa.houtu.util.crypto.SHAUtils;
import io.github.lujiafa.houtu.util.crypto.SM3Utils;

// MD5
CodecData hash = MD5Utils.hash(CodecData.utf8("data"));
String md5Hex = hash.hex();

// HMAC-MD5
CodecData hmacKey = HMacMD5Utils.getKey();
CodecData hmac = HMacMD5Utils.hash(CodecData.utf8("data"), hmacKey);

// SHA (类似接口：SHAUtils)
// SM3 国密哈希 (类似接口：SM3Utils)
```

### 3.4 编码

```java
import io.github.lujiafa.houtu.util.crypto.Base64Utils;
import io.github.lujiafa.houtu.util.crypto.Base58Utils;
import io.github.lujiafa.houtu.util.data.HexUtils;

String base64 = Base64Utils.encode(data);
byte[] decoded = Base64Utils.decode(base64);
```

### CodecData 通用数据载体

所有加密工具的输入输出均使用 `CodecData`：

**工厂方法（静态）：**

| 方法 | 说明 |
|------|------|
| `CodecData.utf8(String text)` | 从 UTF-8 字符串创建 |
| `CodecData.bytes(byte[] bytes)` | 从字节数组创建 |
| `CodecData.base64(String base64)` | 从 Base64 编码字符串创建 |
| `CodecData.hex(String hex)` | 从十六进制编码字符串创建 |

**实例方法：**

| 方法 | 说明 |
|------|------|
| `.bytes()` | 获取字节数组 |
| `.utf8()` | 获取 UTF-8 字符串 |
| `.base64()` | 获取 Base64 编码字符串 |
| `.hex()` | 获取十六进制编码字符串 |
| `.ascii()` | 获取 ASCII 字符串 |

---

## 4. Bean 对象工具 — BeanUtils

**包路径**：`io.github.lujiafa.houtu.util.common.BeanUtils`

### API

| 方法 | 说明 |
|------|------|
| `smartCopyProperties(Object source, Object target)` | 智能属性复制 |
| `smartCopyProperties(Object source, Object target, boolean nonNullProperties)` | 智能复制（可跳过 null） |
| `smartCopyProperties(Object source, Object target, String... ignoreProperties)` | 智能复制（排除指定属性） |
| `smartCopyProperties(S source, Class<T> targetClass)` | 智能复制到新实例 |
| `smartCopyProperties(List<S> source, Class<T> targetClass)` | 批量智能复制 |
| `copyProperties(Object source, Object target, boolean nonNullProperties)` | 标准复制 |
| `copyProperties(S source, Class<T> targetClass)` | 标准复制到新实例 |
| `copyProperties(List<S> source, Class<T> targetClass)` | 批量标准复制 |

> `smartCopyProperties` 与 `copyProperties` 的区别：smart 版本使用内省机制，支持更灵活的属性匹配。

```java
import io.github.lujiafa.houtu.util.common.BeanUtils;

UserVO vo = BeanUtils.smartCopyProperties(entity, UserVO.class);
List<UserVO> voList = BeanUtils.smartCopyProperties(entityList, UserVO.class);
```

---

## 5. 其他常用工具

### DateUtils

```java
import io.github.lujiafa.houtu.util.common.DateUtils;

String dateStr = DateUtils.formatDate(new Date());              // yyyy-MM-dd
String dateTimeStr = DateUtils.formatDateTime(LocalDateTime.now()); // yyyy-MM-dd HH:mm:ss
String utcStr = DateUtils.formatUTCDateTime(new Date());        // UTC 格式

Date dayStart = DateUtils.toDayStart(new Date());               // 当天 00:00:00
Date dayEnd = DateUtils.toDayEnd(new Date());                   // 当天 23:59:59

// Date ↔ LocalDateTime 互转
LocalDateTime ldt = DateUtils.toLocalDateTime(new Date());
Date date = DateUtils.toDate(LocalDateTime.now());

// 时间戳转换
LocalDateTime ldt = DateUtils.toLocalDateTime(timestamp);
Date date = DateUtils.toDate(timestamp);
```

### UUIDUtils

```java
import io.github.lujiafa.houtu.util.common.UUIDUtils;
String uuid = UUIDUtils.genUUIDString();  // 32 位无连字符 UUID
```

### MapUtils

```java
import io.github.lujiafa.houtu.util.common.MapUtils;
T value = MapUtils.getIgnoreCase(map, "Key");           // 忽略大小写取值
boolean has = MapUtils.containsIgnoreCaseKey(map, "key"); // 忽略大小写判断 key
Map<String, String> strMap = MapUtils.toStringMap(map);   // 转 String Map
```

---

## 禁止做的事

1. **禁止** 自行创建 `ObjectMapper` 实例 — 使用 `JsonUtils`
2. **禁止** 自行创建 `RestTemplate` / `HttpClient` — 使用 `HttpClients`
3. **禁止** 自行引入 BouncyCastle 依赖 — houtu-utils 已包含
4. **禁止** 自行实现 MD5/SHA/AES/SM4 等加密算法 — 使用对应的 `*Utils` 工具类
5. **禁止** 使用 Spring 的 `org.springframework.beans.BeanUtils` — 使用 houtu 的 `BeanUtils`（支持批量转换和泛型）
