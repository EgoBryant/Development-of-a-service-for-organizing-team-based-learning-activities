using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TeamExamProject.Infrastructure.Authorization;

/// <summary>Расширения для извлечения данных из <see cref="ClaimsPrincipal"/>.</summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>Возвращает числовой идентификатор пользователя из JWT- или cookie-claims.</summary>
    /// <param name="user">Текущий principal аутентифицированного пользователя.</param>
    /// <returns>Идентификатор пользователя или <c>null</c>, если claim отсутствует или невалиден.</returns>
    public static int? GetUserId(this ClaimsPrincipal user)
    {
        var value =
            user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue("sub");

        return int.TryParse(value, out var userId) && userId > 0 ? userId : null;
    }
}
