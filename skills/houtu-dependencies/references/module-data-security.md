# houtu-data-security — Complete Guide

## Maven Dependency

```xml
<dependency>
    <groupId>io.github.lujiafa</groupId>
    <artifactId>houtu-data-security</artifactId>
</dependency>
```

Transitively includes: `houtu-core`, `houtu-utils`. **Does NOT require Redis or Redisson.**

For AOP support (needed for annotation processing):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

## Required Configuration

```yaml
houtu:
  data:
    security:
      secret-key: "your-sm4-base64-key"   # REQUIRED — SM4 symmetric key in Base64
```

Generate key example: `SM4Utils.getKey().base64()`

---

## Basic Usage — DAO Layer Auto Encrypt/Decrypt

### Step 1: Entity implements SecurityObject, mark fields with @SecurityParam

```java
import io.github.lujiafa.houtu.data.security.annotation.SecurityParam;
import io.github.lujiafa.houtu.data.security.support.SecurityObject;

public class User implements SecurityObject {
    private Long id;
    private String name;                    // Plain text — not encrypted
    @SecurityParam private String phone;    // Auto encrypt/decrypt
    @SecurityParam private String idCard;   // Auto encrypt/decrypt
    @SecurityParam private String bankCard; // Auto encrypt/decrypt
    // getters/setters
}
```

### Step 2: Annotate Mapper with @SecurityWatch

```java
import io.github.lujiafa.houtu.data.security.annotation.SecurityWatch;
import io.github.lujiafa.houtu.data.security.annotation.SecurityParam;

@SecurityWatch
public interface UserMapper {

    // INSERT: @SecurityParam fields auto-encrypted before DB write
    int insert(@SecurityParam User user);

    // SELECT: result fields auto-decrypted after DB read
    @SecurityWatch
    User selectById(Long id);

    // Batch select: each item decrypted
    @SecurityWatch
    List<User> selectByIds(List<Long> ids);

    // UPDATE: encrypt params, decrypt not needed
    @SecurityWatch(decrypt = false)
    int updatePhone(@SecurityParam User user);

    // SELECT: decrypt only, no encrypt needed
    @SecurityWatch(encrypt = false)
    List<User> selectAll();
}
```

### How it works internally

1. **Pre-execution:** Scans method params for `@SecurityParam`. For each `SecurityObject`, finds `@SecurityParam` fields via reflection. Encrypts all marked String fields.
2. **Method execution:** Mapper runs with encrypted values → DB stores ciphertext.
3. **Post-execution:** Scans result for `SecurityObject`. Decrypts all `@SecurityParam` String fields.
4. **Finally:** Restores original parameter values (so caller's objects aren't permanently encrypted).

**Supports nested objects:** If a `@SecurityParam` field's type also implements `SecurityObject`, recursively processes. Handles arrays, Lists, Sets, Maps. Prevents circular references.

---

## Map-Based Encryption

For methods using Map parameters:

```java
@SecurityWatch(encryptMapKeys = {"phone", "idCard"})
int insertByMap(Map<String, Object> params);

@SecurityWatch(decryptMapKeys = {"phone", "idCard"})
Map<String, Object> selectByIdAsMap(Long id);
```

If `encryptMapKeys`/`decryptMapKeys` is empty (default), ALL string values in the map are processed.

---

## Custom Encryption Processor

Override default SM4 with your own algorithm:

```java
import io.github.lujiafa.houtu.data.security.handler.SecurityProcessor;

@Component("aesProcessor")
public class AESSecurityProcessor implements SecurityProcessor {
    @Override
    public String encrypt(Method method, String original) {
        return AESUtils.encrypt(original);
    }

    @Override
    public String decrypt(Method method, String encrypted) {
        return AESUtils.decrypt(encrypted);
    }
}

// Use by bean name:
@SecurityWatch(processorBeanName = "aesProcessor")
User selectById(Long id);

// Or by class:
@SecurityWatch(processorClass = AESSecurityProcessor.class)
User selectById(Long id);
```

**SecurityProcessor interface (all default no-op methods):**
```java
default String encrypt(Method method, String original)                    // Single value
default Map<String, String> encrypt(Method method, Set<String> originals) // Batch (calls single)
default String decrypt(Method method, String encrypted)                   // Single value
default Map<String, String> decrypt(Method method, Set<String> encrypted) // Batch (calls single)
```

---

## Common Mistakes

- **secret-key is REQUIRED** — without it, default `SimpleSecurityProcessor` will fail
- **Only String fields are encrypted** — `@SecurityParam` on non-String fields is ignored
- **Entity MUST implement SecurityObject** for nested field scanning to work
- **@SecurityWatch on class level** applies to ALL methods in that mapper — use method-level for fine control
- **Original values are restored** after method execution — caller's objects won't be corrupted
- **Do NOT use @SecurityParam on static or final fields** — they are skipped
- **Requires spring-boot-starter-aop** — without AOP, annotations are silently ignored
