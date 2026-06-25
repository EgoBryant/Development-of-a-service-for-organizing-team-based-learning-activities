namespace TeamExamProject.Models;

/// <summary>Роли пользователей в системе «Командный зачёт».</summary>
public static class Roles
{
    /// <summary>Роль студента — базовый участник игры.</summary>
    public const string Student = "Student";
    /// <summary>Роль капитана команды.</summary>
    public const string Captain = "Captain";
    /// <summary>Роль администратора платформы.</summary>
    public const string Admin = "Admin";
    /// <summary>Псевдоним роли студента (для обратной совместимости).</summary>
    public const string User = Student;
}
