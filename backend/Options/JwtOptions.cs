namespace TeamExamProject.Options;

/// <summary>Параметры выдачи и проверки JWT-токенов аутентификации.</summary>
public class JwtOptions
{
    /// <summary>Имя секции в конфигурации приложения.</summary>
    public const string SectionName = "Jwt";

    /// <summary>Издатель токена (issuer).</summary>
    public string Issuer { get; set; } = string.Empty;
    /// <summary>Аудитория токена (audience).</summary>
    public string Audience { get; set; } = string.Empty;
    /// <summary>Секретный ключ подписи токена.</summary>
    public string Key { get; set; } = string.Empty;
    /// <summary>Срок действия токена в минутах.</summary>
    public int ExpiryMinutes { get; set; } = 120;
}
