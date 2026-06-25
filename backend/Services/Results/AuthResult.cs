using TeamExamProject.Contracts.Auth;

namespace TeamExamProject.Services;

/// <summary>
/// Код исхода регистрации или входа пользователя.
/// </summary>
public enum AuthResultType
{
    /// <summary>Операция выполнена успешно, выдан JWT.</summary>
    Succeeded,

    /// <summary>Email уже занят другим пользователем (регистрация).</summary>
    EmailAlreadyTaken,

    /// <summary>Неверный email или пароль (вход).</summary>
    InvalidCredentials,

    /// <summary>Обнаружен дубликат email в данных запроса или БД.</summary>
    DuplicateEmail
}

/// <summary>
/// Результат операции аутентификации (регистрация или вход).
/// </summary>
public sealed class AuthResult
{
    /// <summary>Код исхода операции.</summary>
    public required AuthResultType Type { get; init; }

    /// <summary>Ответ с токеном и профилем; заполняется при <see cref="AuthResultType.Succeeded"/>.</summary>
    public AuthResponse? Response { get; init; }
}
