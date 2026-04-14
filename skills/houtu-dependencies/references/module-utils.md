# houtu-utils — Encryption / JSON / HTTP Client / Common Utilities

## Maven Dependency

```xml
<!-- Usually no need to import separately; houtu-web already transitively depends on houtu-utils -->
<!-- If you only need utility classes without Web capabilities, you can import directly -->
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-utils</artifactId>
</dependency>
```

Transitive dependencies: Apache HttpClient 5, BouncyCastle 1.82, Commons Lang3, Jackson

## Auto-configuration

Works out-of-the-box, automatically registers:
- `CloseableHttpClient` — Apache HttpClient 5 instance (connection pool, SSL, proxy pre-configured)
- `HttpClients` — Static HTTP request utility (based on the above HttpClient)
- `JsonUtils` — JSON serialization/deserialization (based on Jackson ObjectMapper)

---

## 1. JSON Utility — JsonUtils

**Package**: `io.github.lujiafa.houtu.util.common.JsonUtils`

### API

| Method | Return type | Description |
|------|--------|------|
| `JsonUtils.toString(Object bean)` | `String` | Object -> JSON string |
| `JsonUtils.toStringIgnoreNull(Object bean)` | `String` | Object -> JSON string (ignoring null fields) |
| `JsonUtils.parseObject(String json, Class<T> clazz)` | `T` | JSON string -> Object |
| `JsonUtils.parseObject(String json, TypeReference<T> typeRef)` | `T` | JSON string -> Generic object |
| `JsonUtils.convertValue(Object from, Class<T> toType)` | `T` | Object type conversion |
| `JsonUtils.convertValueIgnoreNull(Object from, Class<T> toType)` | `T` | Object type conversion (ignoring null) |
| `JsonUtils.convertValue(Object from, TypeReference<T> typeRef)` | `T` | Object -> Generic type conversion |
| `JsonUtils.convertValueIgnoreNull(Object from, TypeReference<T> typeRef)` | `T` | Object -> Generic type conversion (ignoring null) |

### Code Example

```java
import io.github.lujiafa.houtu.util.common.JsonUtils;

// Serialization
String json = JsonUtils.toString(userVO);
String jsonNoNull = JsonUtils.toStringIgnoreNull(userVO);

// Deserialization
UserVO user = JsonUtils.parseObject(json, UserVO.class);
List<UserVO> users = JsonUtils.parseObject(json, new TypeReference<List<UserVO>>() {});

// Object conversion (similar to BeanUtils but via JSON intermediate)
UserDTO dto = JsonUtils.convertValue(form, UserDTO.class);
```

---

## 2. HTTP Client — HttpClients

**Package**: `io.github.lujiafa.houtu.util.http.HttpClients`

### API

| Method | Return type | Description |
|------|--------|------|
| `HttpClients.get(String url)` | `HttpResponseData` | Simple GET request |
| `HttpClients.get(String url, RequestConfig config)` | `HttpResponseData` | GET request with config |
| `HttpClients.post(String url, RequestConfig config)` | `HttpResponseData` | POST request with config |
| `HttpClients.execute(CloseableHttpClient client, HttpUriRequestBase request)` | `HttpResponseData` | Custom request execution |

### RequestConfig Builder

```java
RequestConfig config = RequestConfig.build()
    .headers(Map.of("Authorization", "Bearer xxx"))  // Set headers
    .header("X-Custom", "value")                     // Single header
    .params(Map.of("key", "value"))                  // Query params / form params
    .param("id", 123)                                // Single param
    .data("{\"name\":\"test\"}")                      // JSON body
    .httpClient(customClient);                       // Optional: use custom HttpClient
```

### MultipartConfig (File Upload)

```java
RequestConfig config = RequestConfig.build()
    .multipart()
        .fileInputStream("file", inputStream)
        .fileByteArray("file2", byteArray)
        .param("name", "test")
        .build();
```

### HttpResponseData

| Method | Return type | Description |
|------|--------|------|
| `getStatusCode()` | `int` | HTTP status code |
| `getStatusText()` | `String` | HTTP status text |
| `getContent()` | `String` | Response body string |
| `getHeaderMap()` | `Map<String, String>` | Response headers |
| `getCharset()` | `Charset` | Response charset |
| `convert(Class<T> clazz)` | `T` | Response body -> Object |
| `convert(TypeReference<T> typeRef)` | `T` | Response body -> Generic object |

### Code Example

```java
import io.github.lujiafa.houtu.util.http.HttpClients;
import io.github.lujiafa.houtu.util.http.HttpClients.RequestConfig;

// Simple GET
HttpClients.HttpResponseData resp = HttpClients.get("https://api.example.com/users");
List<UserVO> users = resp.convert(new TypeReference<List<UserVO>>() {});

// POST JSON
HttpClients.HttpResponseData resp = HttpClients.post("https://api.example.com/users",
    RequestConfig.build()
        .header("Content-Type", "application/json")
        .data(JsonUtils.toString(createDTO)));
UserVO created = resp.convert(UserVO.class);

// File upload
HttpClients.HttpResponseData resp = HttpClients.post("https://api.example.com/upload",
    RequestConfig.build()
        .multipart()
            .fileInputStream("file", fileInputStream)
            .param("description", "avatar")
            .build());
```

### HttpClient Configuration Properties

Config prefix: `houtu.http`

| Property | Type | Default | Description |
|------|------|--------|------|
| `houtu.http.pool.max-total` | int | — | Max total connections |
| `houtu.http.pool.max-per-route` | int | — | Max connections per route |
| `houtu.http.pool.disable-ssl-validation` | boolean | — | Whether to disable SSL validation |
| `houtu.http.pool.pool-reuse-policy` | PoolReusePolicy | — | Connection reuse policy |
| `houtu.http.pool.pool-concurrency-policy` | PoolConcurrencyPolicy | — | Concurrency policy |
| `houtu.http.request.connect-timeout` | Duration | — | Connect timeout |
| `houtu.http.request.response-timeout` | Duration | — | Response timeout |
| `houtu.http.request.connection-keep-alive` | Duration | — | Connection keep-alive duration |
| `houtu.http.request.user-agent` | String | — | User-Agent |
| `houtu.http.request.redirects-enabled` | boolean | — | Whether to follow redirects |
| `houtu.http.proxy.hostname` | String | — | Proxy host |
| `houtu.http.proxy.port` | int | — | Proxy port |

---

## 3. Encryption Utilities

All encryption utilities are in the `io.github.lujiafa.houtu.util.crypto` package.

> All encryption methods return `CodecData`, which provides results in different formats via `.bytes()`, `.base64()`, `.hex()`.

### 3.1 Symmetric Encryption

#### AESUtils

```java
import io.github.lujiafa.houtu.util.crypto.AESUtils;
import io.github.lujiafa.houtu.util.crypto.type.AESKeySize;
import io.github.lujiafa.houtu.util.crypto.type.AESTransformation;
import io.github.lujiafa.houtu.util.common.CodecData;

// Generate key
CodecData key = AESUtils.getKey(AESKeySize.AES_128);

// Encrypt
CodecData encrypted = AESUtils.encrypt(
    CodecData.utf8("plaintext"),   // Plaintext
    key,                          // Key
    AESTransformation.ECB_PKCS5   // Mode
);
String base64 = encrypted.base64();

// Encrypt with IV (CBC mode)
CodecData encrypted = AESUtils.encrypt(
    "plaintext".getBytes(), key, AESTransformation.CBC_PKCS5, iv);

// Decrypt
CodecData decrypted = AESUtils.decrypt(encrypted, key, AESTransformation.ECB_PKCS5);
String plaintext = new String(decrypted.bytes());
```

#### SM4Utils (GM — Chinese national cryptographic standard)

```java
import io.github.lujiafa.houtu.util.crypto.SM4Utils;
import io.github.lujiafa.houtu.util.crypto.type.SM4Transformation;

CodecData key = SM4Utils.getKey();
CodecData encrypted = SM4Utils.encrypt(CodecData.utf8("data"), key, SM4Transformation.ECB_PKCS5);
CodecData decrypted = SM4Utils.decrypt(encrypted, key, SM4Transformation.ECB_PKCS5);
// With IV
CodecData encrypted = SM4Utils.encrypt("data".getBytes(), key, iv, SM4Transformation.CBC_PKCS5);
```

### 3.2 Asymmetric Encryption

#### RSAUtils

```java
import io.github.lujiafa.houtu.util.crypto.RSAUtils;
import io.github.lujiafa.houtu.util.crypto.extension.RSAKeyPair;
import io.github.lujiafa.houtu.util.crypto.type.*;

// Generate key pair
RSAKeyPair keyPair = RSAUtils.getKeyPair(RSAKeySize.RSA_2048);
CodecData publicKey = keyPair.getEncodedPublicKey();
CodecData privateKey = keyPair.getEncodedPrivateKey();

// Public key encrypt -> Private key decrypt
CodecData encrypted = RSAUtils.encryptByPublicKey(CodecData.utf8("data"), publicKey, RSATransformationAlgorithm.ECB_PKCS1);
CodecData decrypted = RSAUtils.decryptByPrivateKey(encrypted, privateKey, RSATransformationAlgorithm.ECB_PKCS1);

// Private key sign -> Public key verify
CodecData signature = RSAUtils.sign(CodecData.utf8("data"), privateKey, RSASignAlgorithm.SHA256withRSA);
boolean valid = RSAUtils.signVerify(CodecData.utf8("data"), publicKey, signature, RSASignAlgorithm.SHA256withRSA);
```

#### SM2Utils (GM — Chinese national cryptographic standard)

```java
import io.github.lujiafa.houtu.util.crypto.SM2Utils;
import io.github.lujiafa.houtu.util.crypto.extension.SM2KeyPair;
import io.github.lujiafa.houtu.util.crypto.type.SM2SignAlgorithm;

SM2KeyPair keyPair = SM2Utils.getKeyPair();
CodecData encrypted = SM2Utils.encrypt(CodecData.utf8("data"), keyPair.getEncodedPublicKey());
CodecData decrypted = SM2Utils.decrypt(encrypted, keyPair.getEncodedPrivateKey());

// Sign / Verify
CodecData sig = SM2Utils.sign(CodecData.utf8("data"), keyPair.getEncodedPrivateKey(), SM2SignAlgorithm.SM3withSM2);
boolean valid = SM2Utils.signVerify(CodecData.utf8("data"), keyPair.getEncodedPublicKey(), sig, SM2SignAlgorithm.SM3withSM2);
```

### 3.3 Hash / HMAC

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

// SHA (similar interface: SHAUtils)
// SM3 GM hash (similar interface: SM3Utils)
```

### 3.4 Encoding

```java
import io.github.lujiafa.houtu.util.crypto.Base64Utils;
import io.github.lujiafa.houtu.util.crypto.Base58Utils;
import io.github.lujiafa.houtu.util.data.HexUtils;

String base64 = Base64Utils.encode(data);
byte[] decoded = Base64Utils.decode(base64);
```

### CodecData — Universal Data Carrier

All encryption utilities use `CodecData` for input and output:

**Factory methods (static):**

| Method | Description |
|------|------|
| `CodecData.utf8(String text)` | Create from UTF-8 string |
| `CodecData.bytes(byte[] bytes)` | Create from byte array |
| `CodecData.base64(String base64)` | Create from Base64 encoded string |
| `CodecData.hex(String hex)` | Create from hex encoded string |

**Instance methods:**

| Method | Description |
|------|------|
| `.bytes()` | Get byte array |
| `.utf8()` | Get UTF-8 string |
| `.base64()` | Get Base64 encoded string |
| `.hex()` | Get hex encoded string |
| `.ascii()` | Get ASCII string |

---

## 4. Bean Object Utilities — BeanUtils

**Package**: `io.github.lujiafa.houtu.util.common.BeanUtils`

### API

| Method | Description |
|------|------|
| `smartCopyProperties(Object source, Object target)` | Smart property copy |
| `smartCopyProperties(Object source, Object target, boolean nonNullProperties)` | Smart copy (can skip null) |
| `smartCopyProperties(Object source, Object target, String... ignoreProperties)` | Smart copy (excluding specified properties) |
| `smartCopyProperties(S source, Class<T> targetClass)` | Smart copy to new instance |
| `smartCopyProperties(List<S> source, Class<T> targetClass)` | Batch smart copy |
| `copyProperties(Object source, Object target, boolean nonNullProperties)` | Standard copy |
| `copyProperties(S source, Class<T> targetClass)` | Standard copy to new instance |
| `copyProperties(List<S> source, Class<T> targetClass)` | Batch standard copy |

> The difference between `smartCopyProperties` and `copyProperties`: the smart version uses introspection for more flexible property matching.

```java
import io.github.lujiafa.houtu.util.common.BeanUtils;

UserVO vo = BeanUtils.smartCopyProperties(entity, UserVO.class);
List<UserVO> voList = BeanUtils.smartCopyProperties(entityList, UserVO.class);
```

---

## 5. Other Common Utilities

### DateUtils

```java
import io.github.lujiafa.houtu.util.common.DateUtils;

String dateStr = DateUtils.formatDate(new Date());              // yyyy-MM-dd
String dateTimeStr = DateUtils.formatDateTime(LocalDateTime.now()); // yyyy-MM-dd HH:mm:ss
String utcStr = DateUtils.formatUTCDateTime(new Date());        // UTC format

Date dayStart = DateUtils.toDayStart(new Date());               // Day start 00:00:00
Date dayEnd = DateUtils.toDayEnd(new Date());                   // Day end 23:59:59

// Date <-> LocalDateTime conversion
LocalDateTime ldt = DateUtils.toLocalDateTime(new Date());
Date date = DateUtils.toDate(LocalDateTime.now());

// Timestamp conversion
LocalDateTime ldt = DateUtils.toLocalDateTime(timestamp);
Date date = DateUtils.toDate(timestamp);
```

### UUIDUtils

```java
import io.github.lujiafa.houtu.util.common.UUIDUtils;
String uuid = UUIDUtils.genUUIDString();  // 32-character UUID without hyphens
```

### MapUtils

```java
import io.github.lujiafa.houtu.util.common.MapUtils;
T value = MapUtils.getIgnoreCase(map, "Key");           // Case-insensitive get
boolean has = MapUtils.containsIgnoreCaseKey(map, "key"); // Case-insensitive key check
Map<String, String> strMap = MapUtils.toStringMap(map);   // Convert to String Map
```

---

## 6. Signature Utility — SignUtils

**Package**: `io.github.lujiafa.houtu.util.crypto.SignUtils`

Sorts parameter Map by ASCII order, concatenates into a query string, then performs signing/verification. Automatically excludes `sign` and `signature` fields and null key-values.

| Method | Return type | Description |
|------|--------|------|
| `signMd5(Map<String,String> params, String key)` | `String` (hex) | MD5 signature, key appended to end of query string |
| `verifyMd5(Map<String,String> params, String key, String sign)` | `boolean` | MD5 signature verification |
| `signMD5WithRSA(Map<String,String> params, String privateKeyBase64)` | `String` (base64) | RSA-MD5 signature |
| `signSHA1WithRSA(Map<String,String> params, String privateKeyBase64)` | `String` (base64) | RSA-SHA1 signature |
| `signSHA256WithRSA(Map<String,String> params, String privateKeyBase64)` | `String` (base64) | RSA-SHA256 signature |
| `verifyMD5WithRSA(params, publicKeyBase64, sign)` | `boolean` | RSA-MD5 verification |
| `verifySHAWithRSA(params, publicKeyBase64, sign)` | `boolean` | RSA-SHA1 verification |
| `verifySHA256WithRSA(params, publicKeyBase64, sign)` | `boolean` | RSA-SHA256 verification |
| `buildParam(Map<String,String> params, boolean encode)` | `StringBuilder` | Build sorted query string |

```java
import io.github.lujiafa.houtu.util.crypto.SignUtils;

// MD5 signature (consistent with @CheckSign server-side verification algorithm)
Map<String, String> params = Map.of("orderId", "123", "amount", "100");
String sign = SignUtils.signMd5(params, "your-sign-key");

// RSA-SHA256 signature
String sign = SignUtils.signSHA256WithRSA(params, privateKeyBase64);
boolean valid = SignUtils.verifySHA256WithRSA(params, publicKeyBase64, sign);
```

---

## 7. Additional Encryption Utilities

### DESUtils / DESedeUtils

```java
import io.github.lujiafa.houtu.util.crypto.DESUtils;
import io.github.lujiafa.houtu.util.crypto.DESedeUtils;
import io.github.lujiafa.houtu.util.crypto.type.DESTransformation;
import io.github.lujiafa.houtu.util.crypto.type.DESedeTransformation;

// DES
CodecData key = DESUtils.getKey();
CodecData encrypted = DESUtils.encrypt(CodecData.utf8("data"), key, DESTransformation.ECB_PKCS5);
CodecData decrypted = DESUtils.decrypt(encrypted, key, DESTransformation.ECB_PKCS5);

// 3DES (DESede)
CodecData key3 = DESedeUtils.getKey(DESedeKeySize.DESede_168);
CodecData encrypted = DESedeUtils.encrypt(CodecData.utf8("data"), key3, DESedeTransformation.ECB_PKCS5);
```

### ECDSAUtils

```java
import io.github.lujiafa.houtu.util.crypto.ECDSAUtils;
import io.github.lujiafa.houtu.util.crypto.extension.ECDSAKeyPair;
import io.github.lujiafa.houtu.util.crypto.type.ECDSAKeyType;
import io.github.lujiafa.houtu.util.crypto.type.ECDSASignAlgorithm;

ECDSAKeyPair keyPair = ECDSAUtils.getKeyPair(ECDSAKeyType.SECP256R1);
CodecData sig = ECDSAUtils.sign(CodecData.utf8("data"), keyPair.getEncodedPrivateKey(), ECDSASignAlgorithm.SHA256withECDSA);
boolean valid = ECDSAUtils.verify(CodecData.utf8("data"), keyPair.getEncodedPublicKey(), sig, ECDSASignAlgorithm.SHA256withECDSA);
```

### SM3Utils (GM Hash)

```java
import io.github.lujiafa.houtu.util.crypto.SM3Utils;

CodecData hash = SM3Utils.sm3(CodecData.utf8("data"));
String hex = hash.hex();

// HMAC-SM3
CodecData key = SM3Utils.getKey();
CodecData hmac = SM3Utils.hmacSM3(CodecData.utf8("data"), key);
```

### HMacSHAUtils

```java
import io.github.lujiafa.houtu.util.crypto.HMacSHAUtils;
import io.github.lujiafa.houtu.util.crypto.type.HmacSHAAlgorithm;

CodecData key = HMacSHAUtils.getKey(HmacSHAAlgorithm.HmacSHA256);
CodecData hmac = HMacSHAUtils.hash(CodecData.utf8("data"), key, HmacSHAAlgorithm.HmacSHA256);
```

---

## 8. Web Utility — WebUtils

**Package**: `io.github.lujiafa.houtu.util.web.WebUtils`

Provides access to the current HTTP request/response objects outside the Controller layer (e.g., in Service, Filter).

| Method | Return type | Description |
|------|--------|------|
| `getRequest()` | `HttpServletRequest` | Get the HttpServletRequest bound to the current thread |
| `getResponse()` | `HttpServletResponse` | Get the HttpServletResponse bound to the current thread |
| `isHttpPost(request)` | `boolean` | Check if it is a POST request |
| `isHttpGet(request)` | `boolean` | Check if it is a GET request |
| `isHttpMultipart(request)` | `boolean` | Check if it is a Multipart request |
| `getRequestMethod(request)` | `RequestMethod` | Get the request method enum |
| `getUrlEncodedParams(request)` | `Map<String, String>` | Get URL-encoded form parameters |
| `getRequestBodyStream(request)` | `byte[]` | Read the request body byte stream |

```java
import io.github.lujiafa.houtu.util.web.WebUtils;

// Get client IP in the Service layer
HttpServletRequest request = WebUtils.getRequest();
String clientIp = request.getRemoteAddr();
```

---

## Avoid by default (follow user if explicitly requested)

1. **Avoid by default** creating custom `ObjectMapper` instances — use `JsonUtils`
2. **Avoid by default** creating custom `RestTemplate` / `HttpClient` — use `HttpClients`
3. **Avoid by default** importing BouncyCastle dependency manually — houtu-utils already includes it
4. **Avoid by default** implementing MD5/SHA/AES/SM4 and other encryption algorithms manually — use the corresponding `*Utils` utility classes
5. **Avoid by default** using Spring's `org.springframework.beans.BeanUtils` — use houtu's `BeanUtils` (supports batch conversion and generics)
