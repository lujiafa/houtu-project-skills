# houtu-core 配置解密 — Complete Guide

## 能力说明

houtu-core 提供配置文件中敏感值（如数据库密码、Redis 密码）的自动解密能力，通过 `EnvironmentPostProcessor` 在应用启动时自动处理。

## Maven 依赖

`houtu-core` 已被其他模块传递依赖，通常无需单独引入。

## 配置

配置前缀：`houtu.core.decrypt`

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `encrypt-keys` | `List<String>` | 空 | 需要解密的配置项 key 列表 |
| `decrypt-processor-class` | `Class` | — | 自定义解密处理器类（全限定名） |

```yaml
houtu:
  core:
    decrypt:
      encrypt-keys:                                    # 需要解密的配置项列表
        - spring.datasource.password
        - spring.data.redis.password                   # v2.7.x: spring.redis.password
      decrypt-processor-class: com.example.MyDecryptProcessor  # 自定义解密处理器类（全限定名）
```

## 自定义解密处理器

```java
import io.github.lujiafa.houtu.core.env.DecryptProcessor;

public class MyDecryptProcessor implements DecryptProcessor {
    @Override
    public String decrypt(ConfigurableEnvironment environment, String encrypted) {
        // 实现解密逻辑，如 AES/SM4 解密
        // environment 可用于读取其他配置（如解密密钥）
        return AESUtils.decrypt(encrypted);
    }
}
```

## 使用示例

```yaml
# application.yml — 密码字段存储密文
spring:
  datasource:
    password: "U2FsdGVkX1+abc123..."    # 加密后的密文

houtu:
  core:
    decrypt:
      encrypt-keys:
        - spring.datasource.password
      decrypt-processor-class: com.example.AESDecryptProcessor
```

框架启动时自动将 `spring.datasource.password` 的密文解密为明文，应用层无感知。

## 内部行为

- 通过 `DecryptEnvPostProcessor`（实现 `EnvironmentPostProcessor`）在 Spring 环境准备阶段执行
- 在所有 Bean 初始化之前完成，确保 DataSource 等组件获取到明文密码
- 仅处理 `encrypt-keys` 列表中指定的配置项

## ❌ 禁止

- 不要自写 `EnvironmentPostProcessor` 或 `PropertySource` 做配置解密
- 不要在代码中手动解密配置值
