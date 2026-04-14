# houtu-core Configuration Decryption — Complete Guide

## Feature description

houtu-core provides automatic decryption of sensitive values in configuration files (such as database passwords, Redis passwords) via `EnvironmentPostProcessor`, which processes them automatically at application startup.

## Maven Dependency

`houtu-core` is already a transitive dependency of other modules; no need to import separately.

## Configuration

Config prefix: `houtu.core.decrypt`

| Property | Type | Default | Description |
|------|------|--------|------|
| `encrypt-keys` | `List<String>` | empty | List of configuration keys that need decryption |
| `decrypt-processor-class` | `Class` | — | Custom decryption processor class (fully qualified name) |

```yaml
houtu:
  core:
    decrypt:
      encrypt-keys:                                    # List of configuration keys to decrypt
        - spring.datasource.password
        - spring.data.redis.password                   # Redis config path varies by version, see version reference file for details
      decrypt-processor-class: com.example.MyDecryptProcessor  # Custom decryption processor class (fully qualified name)
```

## Custom Decryption Processor

```java
import io.github.lujiafa.houtu.core.env.DecryptProcessor;

public class MyDecryptProcessor implements DecryptProcessor {
    @Override
    public String decrypt(ConfigurableEnvironment environment, String encrypted) {
        // Implement decryption logic, e.g. AES/SM4 decryption
        // environment can be used to read other configs (e.g. decryption key)
        return AESUtils.decrypt(encrypted);
    }
}
```

## Usage example

```yaml
# application.yml — Password fields store ciphertext
spring:
  datasource:
    password: "U2FsdGVkX1+abc123..."    # Encrypted ciphertext

houtu:
  core:
    decrypt:
      encrypt-keys:
        - spring.datasource.password
      decrypt-processor-class: com.example.AESDecryptProcessor
```

At startup, the framework automatically decrypts the ciphertext of `spring.datasource.password` into plaintext, transparent to the application layer.

## Internal behavior

- Executed during the Spring environment preparation phase via `DecryptEnvPostProcessor` (implements `EnvironmentPostProcessor`)
- Completed before all Bean initialization, ensuring components like DataSource receive the plaintext password
- Only processes configuration keys specified in the `encrypt-keys` list

## Avoid by default (follow user if explicitly requested)

- Do not write custom `EnvironmentPostProcessor` or `PropertySource` for configuration decryption by default
- Do not manually decrypt configuration values in code by default
