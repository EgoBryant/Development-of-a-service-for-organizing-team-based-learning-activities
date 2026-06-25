namespace TeamExamProject.Infrastructure.Authorization;

/// <summary>Имена политик авторизации ASP.NET Core.</summary>
public static class PolicyNames
{
    /// <summary>Политика для роли студента.</summary>
    public const string Student = "Student";
    /// <summary>Политика для роли капитана команды.</summary>
    public const string Captain = "Captain";
}
