using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Infrastructure.Authorization;

namespace TeamExamProject.Controllers;

/// <summary>
/// Базовый класс API-контроллеров платформы «Командный зачёт».
/// Наследует <see cref="ControllerBase"/> и предоставляет общие свойства для работы с JWT-контекстом.
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Идентификатор текущего пользователя из JWT-токена (<c>sub</c> claim).
    /// Возвращает <c>null</c>, если пользователь не аутентифицирован или claim отсутствует.
    /// </summary>
    protected int? CurrentUserId => User.GetUserId();
}
